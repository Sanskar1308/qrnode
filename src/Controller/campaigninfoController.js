const express = require('express');
const prisma = require('../../prisma/client');
const fs = require('fs');
const path = require('path');
const multer = require('multer'); // Import multer
const authmiddleware = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/opt/qrcode/infoimage'); // Destination folder to store images
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`); // Create a unique file name
    }
});

const upload = multer({ storage }); // Initialize multer with storage configuration

// Insert API with file upload
router.post('/Insert', upload.single('file'),authmiddleware, async (req, res) => {
    try {
        const model = req.body;
        model.file = req.file;

        if (!model.file) {
            return res.status(400).json({   
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'ECC_620',
                ErrorMsg: 'File is required',
                SubErrorCode: 'ECC_620'
            });
        }

        if (model.CampaignId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'ECC_606',
                ErrorMsg: 'Invalid Campaign ID',
                SubErrorCode: 'ECC_606'
            });
        }

        if (!model.Name) {
            model.Name = "";
        }

        if (!model.Remark) {
            model.Remark = "";
        }

        model.CreatedBy = "User";
        model.Ip = req.ip;
        model.Source = "web";

        // Get UserId from headers exactly as `UserId` (case-sensitive)
        model.UserId = parseInt(req.headers['user-id'], 10);

        if (isNaN(model.UserId) || model.UserId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        // File path logic (already handled by multer)
        const fileName = req.file.filename; // File name from multer
        const filePath = `/opt/qrcode/infoimage/${fileName}`; // Full file path

        // Insert into the `campaigninfotbl` table using Prisma
        const insertResult = await prisma.campaigninfotbl.create({
            data: {
                CampaignId: model.CampaignId,
                FileName: fileName,
                FilePath: filePath,
                Active: true,
                Name: model.Name,
                Remark: model.Remark,
                UserId: model.UserId, // Ensure UserId is properly set here
                CreatedBy: model.CreatedBy,
                CreatedDate: new Date(),
                CreatedIP: model.Ip,
                CreatedSource: model.Source
            }
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: insertResult
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_596',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_596'
        });
    }
});

router.post('/Update',authmiddleware, async (req, res) => {
    try {
        const model = req.body;

        model.ModifiedBy = "User";
        model.Ip = req.ip;
        model.Source = "web";
        model.UserId = parseInt(req.headers['user-id'], 10);

        // Validate User ID
        if (!model.UserId || model.UserId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        // Validate Campaign ID
        if (!model.Id || model.Id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid ID',
                ErrorMsg: 'Invalid ID',
                SubErrorCode: 'Invalid ID'
            });
        }

        // Update only the fields you want in the database
        const updateResult = await prisma.campaigninfotbl.update({
            where: { Id: model.Id }, // Update based on campaign ID
            data: {
                Name: model.name,        // Update name
                Remark: model.remark,    // Update remark
                Position: model.position, // Update position
                Active: model.active,    // Update active status
                LastModifiedBy: model.ModifiedBy,  // Track the user who modified
                LastModifiedDate: new Date(),      // Set the modified date
                LastModifiedIP: model.Ip,          // Track the IP address
                LastModifiedSource: model.Source,  // Track the source
            },
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: updateResult
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_597',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_597'
        });
    }
});

router.post('/Delete',authmiddleware, async (req, res) => {
    try {
        const model = req.body;
        
        // Extract UserId from headers
        const userId = parseInt(req.headers['user-id'], 10);

        // Validate User ID from headers
        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        // Validate Campaign ID (Id) from the body
        if (model.Id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid ID',
                ErrorMsg: 'Invalid ID',
                SubErrorCode: 'Invalid ID'
            });
        }

        // Check if the record exists for the given UserId and Id
        const existingRecord = await prisma.campaigninfotbl.findFirst({
            where: {
                Id: model.Id,
                UserId: userId // Ensure the UserId matches the record
            }
        });

        // If the record doesn't exist, return a 404 error
        if (!existingRecord) {
            return res.status(404).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Record Not Found',
                ErrorMsg: 'No record found for the given User ID and Campaign ID',
                SubErrorCode: 'Record Not Found'
            });
        }

        // Proceed with deletion
        await prisma.campaigninfotbl.delete({
            where: {
                Id: model.Id
            }
        });

        // Respond with success message
        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            ErrorCode: null,
            ErrorMsg: null,
            SubErrorCode: null
        });
    } catch (error) {
        console.error('Error during deletion:', error);
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_597',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_597'
        });
    }
});

router.post('/UpdateStatus/Active',authmiddleware, async (req, res) => {
    try {
        const model = req.body;

        // Get UserId from headers
        model.UserId = parseInt(req.headers['user-id'], 10);

        // Validate UserId
        if (isNaN(model.UserId) || model.UserId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        // Validate CampaignInfo Id
        if (!model.Id || model.Id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid ID',
                ErrorMsg: 'Invalid CampaignInfo ID',
                SubErrorCode: 'Invalid ID'
            });
        }

        // Update the 'Active' status to true for the given campaigninfo ID
        const updateResult = await prisma.campaigninfotbl.update({
            where: { Id: model.Id },  // Find by Id
            data: {
                Active: true,  // Set status to active
                LastModifiedBy: "User",  // Example modified by
                LastModifiedDate: new Date(),  // Set modified date to now
                LastModifiedIP: req.ip,
                LastModifiedSource: "web"
            }
        });

        // Send successful response
        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: updateResult
        });
    } catch (error) {
        console.error('Error updating status to Active:', error);

        // Send error response
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_597',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_597'
        });
    }
});

router.post('/UpdateStatus/Deactive',authmiddleware, async (req, res) => {
    try {
        const model = req.body;

        // Get UserId from headers
        const userId = parseInt(req.headers['user-id'], 10);

        // Validate UserId
        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        // Validate CampaignInfo Id
        if (!model.Id || model.Id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid ID',
                ErrorMsg: 'Invalid CampaignInfo ID',
                SubErrorCode: 'Invalid ID'
            });
        }

        // Update the 'Active' status to false (Deactive) for the given campaigninfo ID
        const updateResult = await prisma.campaigninfotbl.update({
            where: { Id: model.Id },  // Find by Id
            data: {
                Active: false,  // Set status to deactive
                LastModifiedBy: "User",  // Example modified by
                LastModifiedDate: new Date(),  // Set modified date to now
                LastModifiedIP: req.ip,
                LastModifiedSource: "web"
            }
        });

        // Send successful response
        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: updateResult
        });
    } catch (error) {
        console.error('Error updating status to Deactive:', error);

        // Send error response
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_597',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_597'
        });
    }
});

router.post('/SwitchPosition',authmiddleware, async (req, res) => {
    try {
        const model = req.body;

        // Get UserId from headers
        const userId = parseInt(req.headers['user-id'], 10);

        // Validate UserId
        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        // Validate CampaignInfo Id
        if (!model.Id || model.Id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid ID',
                ErrorMsg: 'Invalid CampaignInfo ID',
                SubErrorCode: 'Invalid ID'
            });
        }

        // Validate Direction (should be 'up' or 'down')
        if (!model.Direction || (model.Direction.toLowerCase().trim() !== 'up' && model.Direction.toLowerCase().trim() !== 'down')) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid direction',
                ErrorMsg: 'Invalid direction',
                SubErrorCode: 'Invalid direction'
            });
        }

        // Fetch the current campaign from the database
        const currentCampaign = await prisma.campaigninfotbl.findUnique({
            where: { Id: model.Id }
        });

        if (!currentCampaign) {
            return res.status(404).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Campaign Not Found',
                ErrorMsg: 'Campaign not found',
                SubErrorCode: 'Campaign Not Found'
            });
        }

        // Determine new position based on the direction
        let newPosition;
        if (model.Direction.toLowerCase() === 'up') {
            newPosition = currentCampaign.Position - 1;
        } else {
            newPosition = currentCampaign.Position + 1;
        }

        // Ensure new position is valid
        if (newPosition < 1) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid Position',
                ErrorMsg: 'Cannot move position further up',
                SubErrorCode: 'Invalid Position'
            });
        }

        // Fetch the campaign with the target position (to switch places)
        const targetCampaign = await prisma.campaigninfotbl.findFirst({
            where: {
                Position: newPosition,
                UserId: userId
            }
        });

        if (!targetCampaign) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Target Campaign Not Found',
                ErrorMsg: 'No campaign found in the target position',
                SubErrorCode: 'Target Campaign Not Found'
            });
        }

        // Update the positions of both campaigns (current and target)
        const transaction = await prisma.$transaction([
            prisma.campaigninfotbl.update({
                where: { Id: currentCampaign.Id },
                data: { Position: newPosition }
            }),
            prisma.campaigninfotbl.update({
                where: { Id: targetCampaign.Id },
                data: { Position: currentCampaign.Position }
            })
        ]);

        // Send successful response
        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: transaction
        });
    } catch (error) {
        console.error('Error switching position:', error);

        // Send error response
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_597',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_597'
        });
    }
});

router.post('/UpdatePosition',authmiddleware, async (req, res) => {
    try {
        const model = req.body;

        // Get UserId from headers
        const userId = parseInt(req.headers['user-id'], 10);

        // Validate UserId
        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        // Validate the list of campaigns to update
        if (!model.list || !Array.isArray(model.list) || model.list.length === 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'ECC_645',
                ErrorMsg: 'List is required and should be a non-empty array',
                SubErrorCode: 'ECC_645'
            });
        }

        const modifiedBy = "User";
        const ip = req.ip;
        const source = "web";

        // Loop through the list of campaign info and update their positions
        const updatePromises = model.list.map(async (item) => {
            if (!item.Id || !item.Position) {
                throw new Error(`Invalid data for campaign Id: ${item.Id}`);
            }

            return prisma.campaigninfotbl.update({
                where: { Id: item.Id },
                data: {
                    Position: item.Position,       // Update the position
                    LastModifiedBy: modifiedBy,    // Track modification info
                    LastModifiedDate: new Date(),  // Set the modified date
                    LastModifiedIP: ip,            // Track the IP address
                    LastModifiedSource: source,    // Track the source
                }
            });
        });

        // Execute all update queries in parallel
        const updateResults = await Promise.all(updatePromises);

        // Respond with success
        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: updateResults
        });

    } catch (error) {
        console.error('Error updating positions:', error);

        // Handle errors and respond
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_597',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_597'
        });
    }
});

router.post('/Search',authmiddleware, async (req, res) => {
    try {
        const model = req.body;

        // Get UserId from headers
        const userId = parseInt(req.headers['user-id'], 10);

        // Validate UserId
        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        // Create search conditions based on incoming model fields
        const searchConditions = {
            UserId: userId,
            ...(model.campaignid && { CampaignId: parseInt(model.campaignid, 10) }),
            ...(model.active !== '' && { Active: model.active }), // Active is a string, so ensure it's non-empty
            ...(model.merchantid && { MerchantId: model.merchantid }), // Assuming you want to search by MerchantId as well
            ...(model.posname && { Name: { contains: model.posname, mode: 'insensitive' } }) // Partial match for POS name (case-insensitive)
        };

        // Apply created date filters if applycreateddate is true
        if (model.applycreateddate) {
            const fromCreatedDate = model.fromcreateddate ? new Date(model.fromcreateddate) : new Date('1970-01-01');
            const endCreatedDate = model.endcreateddate ? new Date(model.endcreateddate) : new Date();
            searchConditions.CreatedDate = {
                gte: fromCreatedDate,
                lte: endCreatedDate
            };
        }

        // Pagination logic
        const currentPage = model.currentpageno || 0;
        const pageSize = model.pagesize || 10;
        const skipRecords = currentPage * pageSize;

        // If pagination is disabled, retrieve all records
        const results = await prisma.campaigninfotbl.findMany({
            where: searchConditions,
            ...(model.withoutpagination === false && { skip: skipRecords, take: pageSize }), // If pagination is enabled
            orderBy: { CreatedDate: 'desc' } // Default sorting by CreatedDate
        });

        // Respond with search results
        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: results
        });

    } catch (error) {
        console.error('Error during campaign info search:', error);

        // Handle errors and respond
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_597',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_597'
        });
    }
});
module.exports = router;
