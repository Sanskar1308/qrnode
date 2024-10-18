const express = require('express');
const prisma = require('../../prisma/client');
const authmiddleware = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/opt/qrnode/audiodata'); // Destination folder to store audio files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`); // Create a unique file name
    }
});

const upload = multer({ storage }); // Initialize multer with storage configuration

router.post('/Insert', upload.single('file'), authmiddleware, async (req, res) => {
    try {
        const model = req.body;
        model.file = req.file;

        // Check if file is uploaded
        if (!model.file) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'ECC_620',
                ErrorMsg: 'Audio file is required',
                SubErrorCode: 'ECC_620'
            });
        }

        // Validate CampaignId (if needed)
        if (model.CampaignId && model.CampaignId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'ECC_606',
                ErrorMsg: 'Invalid Campaign ID',
                SubErrorCode: 'ECC_606'
            });
        }

        // Set additional properties
        model.CreatedBy = "User";
        model.Ip = req.ip;
        model.Source = "web";
        model.UserId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);

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

        // Handle file path logic
        const fileName = req.file.filename; // File name from multer
        const uploadDir = '/opt/qrnode/audiodata'; // Correct file path
        const filePath = path.join(uploadDir, fileName); // Full file path

        // Define the base URL of your server
        const baseUrl = 'http://157.90.147.8:9500'; // Use your actual server URL

        // Construct the full audio file URL
        const fileUrl = `${baseUrl}/audios/${fileName}`; // URL path for accessing the audio file

        // Insert into the `audiotbl` table using Prisma
        const insertResult = await prisma.audiotbl.create({
            data: {
                UserId: BigInt(model.UserId),
                Name: model.Name || "", // Set to empty string if not provided
                OrgFileName: fileName,
                SystemFileName: fileName,
                FileSize: model.file.size.toString(),
                DownloadPath: fileUrl, // Store the full URL to access the audio file
                CreatedBy: model.CreatedBy,
                CreatedDate: new Date(),
                CreatedIP: model.Ip,
                CreatedSource: model.Source,
                Active: true // Set active status to true by default
            }
        });

        // Respond with success
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
router.post('/UpdateFile', upload.single('file'), authmiddleware, async (req, res) => {
    try {
        const model = req.body;
        model.file = req.file;

        // Validate if a file was uploaded
        if (!model.file) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'ECC_666',
                ErrorMsg: 'File is required',
                SubErrorCode: 'ECC_666'
            });
        }

        // Validate ID
        if (!model.Id || model.Id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'ECC_665',
                ErrorMsg: 'Invalid ID',
                SubErrorCode: 'ECC_665'
            });
        }

        // Validate UserId
        model.UserId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);
        if (isNaN(model.UserId) || model.UserId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        // File path logic
        const audioSavePath = '/opt/qrnode/audiodata'; // Replace with actual path
        const directoryPath = path.join(audioSavePath, model.UserId.toString());

        // Create directory if it doesn't exist
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        const fileName = `${model.UserId}_${Date.now()}_${model.file.originalname}`;
        const filePath = path.join(directoryPath, fileName);

        // Move the file from temp location to the final destination
        fs.renameSync(model.file.path, filePath);

        // Construct the URL for accessing the file
        const baseUrl = 'http://157.90.147.8:9500'; // Use your actual server URL
        const fileUrl = `${baseUrl}/audios/${model.UserId}/${fileName}`;

        // Update the file information in the database using Prisma
        const updateResult = await prisma.audiotbl.update({
            where: {
                Id: BigInt(model.Id),
            },
            data: {
                UserId: BigInt(model.UserId),
                DownloadPath: fileUrl,  // Store the file URL in the database
                LastModifiedBy: 'User', // Change as per your logic
                LastModifiedDate: new Date(),
                LastModifiedIP: req.ip,
                LastModifiedSource: 'web',
                OrgFileName: model.file.originalname, // Store original file name
                SystemFileName: fileName, // Store system file name
                FileSize: model.file.size.toString(), // Store file size
            }
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: updateResult,
            ErrorCode: null,
            ErrorMsg: null,
            SubErrorCode: null
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_658',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_658'
        });
    }
});

router.post('/Update', authmiddleware, async (req, res) => {
    try {
        const model = req.body;

        // Validate UserId
        model.UserId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);
        if (isNaN(model.UserId) || model.UserId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        // Validate ID
        if (!model.Id || model.Id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'ECC_665',
                ErrorMsg: 'Invalid ID',
                SubErrorCode: 'ECC_665'
            });
        }

        // Update the database using Prisma
        const updateResult = await prisma.audiotbl.update({
            where: {
                Id: BigInt(model.Id),
            },
            data: {
                UserId: BigInt(model.UserId),
                LastModifiedBy: 'User', // Hardcoded for now, adjust if needed
                LastModifiedDate: new Date(),
                LastModifiedIP: req.ip,
                LastModifiedSource: 'web',
                Active: model.Active,
                Name: model.Name,
            }
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
            ErrorCode: 'ECC_658',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_658'
        });
    }
});

router.post('/Delete', authmiddleware, async (req, res) => {
    try {
        const model = req.body;

        // Validate UserId
        model.UserId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);
        if (isNaN(model.UserId) || model.UserId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        // Validate ID
        if (!model.Id || model.Id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'ECC_665',
                ErrorMsg: 'Invalid ID',
                SubErrorCode: 'ECC_665'
            });
        }

        // Delete record from the database using Prisma
        const deleteResult = await prisma.audiotbl.delete({
            where: {
                Id: BigInt(model.Id),
            }
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: deleteResult
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_658',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_658'
        });
    }
});

router.get('/Get/:id', authmiddleware, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const userId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);

        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'ECC_665',
                ErrorMsg: 'Invalid ID',
                SubErrorCode: 'ECC_665'
            });
        }

        // Fetch record from the database using Prisma
        const getResult = await prisma.audiotbl.findUnique({
            where: {
                Id: BigInt(id),
            }
        });

        if (!getResult) {
            return res.status(404).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Not Found',
                ErrorMsg: `Record with ID ${id} not found`,
                SubErrorCode: 'Not Found'
            });
        }

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: getResult
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_658',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_658'
        });
    }
});

router.post('/UpdateStatus/Active', authmiddleware, async (req, res) => {
    try {
        const model = req.body;

        // Validate UserId
        if (!model.UserId || model.UserId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        // Validate ID
        if (!model.Id || model.Id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'ECC_665',
                ErrorMsg: 'Invalid ID',
                SubErrorCode: 'ECC_665'
            });
        }

        // Update Active status in the database using Prisma
        const updateStatusResult = await prisma.audiotbl.update({
            where: {
                Id: BigInt(model.Id),
            },
            data: {
                Active: true // Set the Active status to true
            }
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: updateStatusResult
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_658',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_658'
        });
    }
});

router.post('/UpdateStatus/Deactive', authmiddleware, async (req, res) => {
    try {
        const model = req.body;

        // Validate UserId
        if (!model.UserId || model.UserId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        // Validate ID
        if (!model.Id || model.Id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'ECC_665',
                ErrorMsg: 'Invalid ID',
                SubErrorCode: 'ECC_665'
            });
        }

        // Update Active status in the database using Prisma
        const updateStatusResult = await prisma.audiotbl.update({
            where: {
                Id: BigInt(model.Id),
            },
            data: {
                Active: false // Set the Active status to false
            }
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: updateStatusResult
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_658',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_658'
        });
    }
});

router.get('/GetDistinct/:by', authmiddleware, async (req, res) => {
    try {
        const by = req.params.by;

        // Validate "by" parameter
        if (!by || by.trim() === "") {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid parameter',
                ErrorMsg: 'Parameter "by" is required',
                SubErrorCode: 'Invalid parameter'
            });
        }

        // Validate the allowed fields
        const allowedFields = ['name', 'name_active', 'name_deactive'];
        if (!allowedFields.includes(by)) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid parameter',
                ErrorMsg: `Invalid parameter: ${by}`,
                SubErrorCode: 'Invalid parameter'
            });
        }

        // Build the filter condition based on the parameter
        let distinctField;
        let condition = {};
        
        switch (by) {
            case 'name':
                distinctField = 'Name';
                break;
            case 'name_active':
                distinctField = 'Name';
                condition = { Active: true }; // Fetch only active names
                break;
            case 'name_deactive':
                distinctField = 'Name';
                condition = { Active: false }; // Fetch only deactivated names
                break;
            default:
                return res.status(400).json({
                    IsResponse: false,
                    ResponseStatus: 'Error',
                    ErrorCode: 'Invalid parameter',
                    ErrorMsg: `Invalid parameter: ${by}`,
                    SubErrorCode: 'Invalid parameter'
                });
        }

        // Fetch distinct records using Prisma
        const getDistinctResult = await prisma.audiotbl.findMany({
            where: condition,
            distinct: [distinctField], // Prisma's distinct query
            select: {
                [distinctField]: true // Only return the distinct field
            }
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: getDistinctResult,
            ErrorCode: null,
            ErrorMsg: null,
            SubErrorCode: null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_658',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_658'
        });
    }
});

router.post('/Search', authmiddleware, async (req, res) => {
    try {
        const model = req.body;

        // Validate UserId
        if (!model.UserId || model.UserId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        // Build filter conditions
        const filterConditions = {};

        if (model.name) {
            filterConditions.Name = {
                contains: model.name,
            };
        }

        if (model.active !== undefined) {
            filterConditions.Active = model.active === 'true';
        }

        if (model.fromCreatedDate && model.toCreatedDate) {
            filterConditions.CreatedDate = {
                gte: new Date(model.fromCreatedDate),
                lte: new Date(model.toCreatedDate),
            };
        }

        // Pagination logic
        const pageSize = model.pageSize || 10;
        const currentPage = model.currentPage || 1;
        const skip = (currentPage - 1) * pageSize;

        // Perform search using Prisma
        const searchResult = await prisma.audiotbl.findMany({
            where: filterConditions,
            skip,
            take: pageSize,
            orderBy: {
                CreatedDate: 'desc',
            },
        });

        // Get total record count
        const totalRecords = await prisma.audiotbl.count({
            where: filterConditions,
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: searchResult,
            TotalRecords: totalRecords,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_658',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_658',
        });
    }
});

module.exports = router;
