const express = require('express');
const prisma = require('../../prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenProvider = { secret: 'your-secret-key' }; // Replace with your actual secret

const router = express.Router();

router.post('/Insert', async (req, res) => {
    try {
        // Extract the data from the request body
        const { campaignname, remark, active } = req.body;

        // Validate User ID from headers
        const UserId = parseInt(req.headers['user-id'], 10) || 1;
        if (UserId <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid User ID',
                errorcode: 'Invalid User ID',
                suberrorcode: 400,
                errormsg: 'Invalid User ID'
            });
        }

        // Insert data into the campaign table using Prisma
        const insertResult = await prisma.campaigntbl.create({
            data: {
                UserId,
                CampaignName: campaignname || null,
                Remark: remark || null,
                Active: active !== undefined ? active : true, // Default to true if not provided
                CreatedDate: new Date(),
                CreatedIP: req.ip,
                CreatedSource: "web",
                CreatedBy: "User"
            }
        });

        // Return a success response with the required format
        return res.json({
            isresponse: true,
            responsestatus: 'Success',
            errorcode: null,
            suberrorcode: 0,
            errormsg: 'Campaign created successfully'
        });
    } catch (error) {
        // Log the error and return a 500 response with the required format
        // AppLogger.error('ECC_576', 'Error message', 'fullPath', 'namespace', 'className', 'methodName', error);
        console.log(error)
        return res.status(500).json({
            isresponse: false,
            responsestatus: 'Error',
            errorcode: 'ECC_576',
            suberrorcode: 500,
            errormsg: 'Internal Server Error'
        });
    }
    });

router.post('/Update', async(req, res) => {
    try {
        const { Id, campaignname, remark, active } = req.body;
        const UserId = parseInt(req.headers['user-id'], 10) || 1;

        if (UserId <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid User ID',
                errorcode: 'Invalid User ID',
                suberrorcode: 400,
                errormsg: 'Invalid User ID'
            });
        }

        if (Id <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid ID',
                errorcode: 'Invalid ID',
                suberrorcode: 400,
                errormsg: 'Invalid campaign ID'
            });
        }

        const updateResult = await prisma.campaigntbl.update({
            where: { Id: BigInt(Id) },
            data: {
                CampaignName: campaignname || null,
                Remark: remark || null,
                Active: active !== undefined ? active : true,
                LastModifiedDate: new Date(),
                LastModifiedIP: req.ip,
                LastModifiedSource: 'web',
                LastModifiedBy: 'User'
            }
        });

        // Convert BigInt fields to strings before sending the response
        const resultWithStringBigInt = {
            ...updateResult,
            Id: updateResult.Id.toString(),
            UserId: updateResult.UserId.toString()
        };

        return res.json({
            isresponse: true,
            responsestatus: 'Success',
            errorcode: null,
            suberrorcode: 0,
            errormsg: 'Campaign updated successfully',
            data: resultWithStringBigInt
        });
    } catch (error) {
        AppLogger.error('ECC_577', 'Error message', 'fullPath', 'namespace', 'className', 'methodName', error);
        return res.status(500).json({
            isresponse: false,
            responsestatus: 'Error',
            errorcode: 'ECC_577',
            suberrorcode: 500,
            errormsg: 'Internal Server Error'
        });
    }});

router.post('/Delete', async(req, res) => {
    try {
        const { id } = req.body;
        const UserId = parseInt(req.headers['user-id'], 10) || 1;

        // Validate UserId
        if (UserId <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid User ID',
                errorcode: 'Invalid User ID',
                suberrorcode: 400,
                errormsg: 'Invalid User ID' 
            });
        }

        // Validate the campaign ID to be deleted
        if (id <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid ID',
                errorcode: 'Invalid ID',
                suberrorcode: 400,
                errormsg: 'Invalid ID'
            });
        }

        const data = await prisma.campaigntbl.findUnique({where: {Id: BigInt(id)}})

        if (!data) {
            return res.status(404).json({
                isresponse: false,
                responsestatus: 'Invalid ID',
                errorcode: 'Invalid ID',
                suberrorcode: 404,
                errormsg: 'Invalid ID'
            });
        }

        // Perform the delete operation using Prisma
        const deleteResult = await prisma.campaigntbl.delete({
            where: { Id: data.Id }
        });

        // Return a success response
        return res.json({
            isresponse: true,
            responsestatus: 'Success',
            errorcode: null,
            suberrorcode: 0,
            errormsg: 'Campaign deleted successfully'
        });
    } catch (error) {
        // Log the error and return a 500 response
        // AppLogger.error('ECC_578', 'Error message', 'fullPath', 'namespace', 'className', 'methodName', error);
        return res.status(500).json({
            isresponse: false,
            responsestatus: 'Error',
            errorcode: 'ECC_578',
            suberrorcode: 500,
            errormsg: 'Internal Server Error'
        });
    }
});

router.post('/Get', async (req, res) => {
    try {
        const { id } = req.body;
        const UserId = parseInt(req.headers['user-id'], 10) || 1;

        // Validate UserId
        if (UserId <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid User ID',
                errorcode: 'Invalid User ID',
                suberrorcode: 400,
                errormsg: 'Invalid User ID'
            });
        }

        // Validate campaign ID
        if (id <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid ID',
                errorcode: 'Invalid ID',
                suberrorcode: 400,
                errormsg: 'Invalid campaign ID'
            });
        }

        // Fetch campaign using Prisma's findUnique or findFirst based on ID
        const campaign = await prisma.campaigntbl.findFirst({
            where: {
                Id: BigInt(id),
                UserId: BigInt(UserId)
            }
        });

        // If campaign not found
        if (!campaign) {
            return res.status(404).json({
                isresponse: false,
                responsestatus: 'Not Found',
                errorcode: 'NOT_FOUND',
                suberrorcode: 404,
                errormsg: 'Campaign not found'
            });
        }

        // Success response
        return res.json({
            data: campaign,
            isresponse: true,
            responsestatus: 'Success',
            errorcode: null,
            suberrorcode: 0,
            errormsg: 'Campaign retrieved successfully'
        });
    } catch (error) {
        // Log the error and return a 500 response
        // AppLogger.error('ECC_579', 'Error message', 'fullPath', 'namespace', 'className', 'methodName', error);
        return res.status(500).json({
            isresponse: false,
            responsestatus: 'Error',
            errorcode: 'ECC_579',
            suberrorcode: 500,
            errormsg: 'Internal Server Error'
        });
    }
});

router.post('/UpdateStatus/Active', async (req, res) => {
    try {
        const { id } = req.body;
        const UserId = parseInt(req.headers['user-id'], 10) || 1;

        // Validate UserId
        if (UserId <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid User ID',
                errorcode: 'Invalid User ID',
                suberrorcode: 400,
                errormsg: 'Invalid User ID'
            });
        }

        // Validate campaign ID
        if (id <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid ID',
                errorcode: 'Invalid ID',
                suberrorcode: 400,
                errormsg: 'Invalid campaign ID'
            });
        }

        // Update the Active status of the campaign
        const updateStatusResult = await prisma.campaigntbl.update({
            where: {
                Id: BigInt(id), // Convert to BigInt if necessary
                UserId: BigInt(UserId)
            },
            data: {
                Active: true, // Set the campaign to active
                LastModifiedDate: new Date(),
                LastModifiedIP: req.ip,
                LastModifiedSource: 'web',
                LastModifiedBy: 'User'
            }
        });

        // Success response
        return res.json({
            isresponse: true,
            responsestatus: 'Success',
            errorcode: null,
            suberrorcode: 0,
            errormsg: 'Campaign status updated successfully'
        });
    } catch (error) {
        // Log the error and return a 500 response
        // AppLogger.error('ECC_580', 'Error message', 'fullPath', 'namespace', 'className', 'methodName', error);
        return res.status(500).json({
            isresponse: false,
            responsestatus: 'Error',
            errorcode: 'ECC_580',
            suberrorcode: 500,
            errormsg: 'Internal Server Error'
        });
    }
});

router.post('/UpdateStatus/Deactive', async (req, res) => {
    try {
        const { id } = req.body;
        const UserId = parseInt(req.headers['user-id'], 10) || 1;

        // Validate UserId
        if (UserId <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid User ID',
                errorcode: 'Invalid User ID',
                suberrorcode: 400,
                errormsg: 'Invalid User ID'
            });
        }

        // Validate campaign ID
        if (id <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid ID',
                errorcode: 'Invalid ID',
                suberrorcode: 400,
                errormsg: 'Invalid campaign ID'
            });
        }

        // Update the Active status of the campaign to false
        const updateStatusResult = await prisma.campaigntbl.update({
            where: {
                Id: BigInt(id), // Convert to BigInt if necessary
                UserId: BigInt(UserId)
            },
            data: {
                Active: false, // Set the campaign to inactive
                LastModifiedDate: new Date(),
                LastModifiedIP: req.ip,
                LastModifiedSource: 'web',
                LastModifiedBy: 'User'
            }
        });

        // Success response
        return res.json({
            isresponse: true,
            responsestatus: 'Success',
            errorcode: null,
            suberrorcode: 0,
            errormsg: 'Campaign status updated to inactive successfully'
        });
    } catch (error) {
        // Log the error and return a 500 response
        // AppLogger.error('ECC_581', 'Error message', 'fullPath', 'namespace', 'className', 'methodName', error);
        return res.status(500).json({
            isresponse: false,
            responsestatus: 'Error',
            errorcode: 'ECC_581',
            suberrorcode: 500,
            errormsg: 'Internal Server Error'
        });
    }
});

router.get('/GetDistinct/:by', async (req, res) => {
    try {
        const { by } = req.params;

        // Validate the 'by' parameter
        if (!['campaignname', 'campaignname_active', 'campaignname_deactive'].includes(by)) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid parameter',
                errorcode: 'Invalid parameter',
                suberrorcode: 400,
                errormsg: 'Invalid parameter value'
            });
        }

        const userId = parseInt(req.headers['user-id'], 10) || 1;

        // Validate UserId
        if (userId <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid User ID',
                errorcode: 'Invalid User ID',
                suberrorcode: 400,
                errormsg: 'Invalid User ID'
            });
        }

        // Define the Prisma query based on the 'by' parameter
        let filter = {};
        if (by === 'campaignname_active') {
            filter = { Active: true };
        } else if (by === 'campaignname_deactive') {
            filter = { Active: false };
        }

        // Fetch distinct values from the database using Prisma
        const result = await prisma.campaigntbl.findMany({
            where: {
                UserId: BigInt(userId), // Ensure UserId matches
                ...filter
            },
            distinct: ['CampaignName'], // Fetch distinct campaign names
            select: {
                CampaignName: true // Only return distinct campaign names
            }
        });

        // Success response
        return res.json({
            data: result,
            isresponse: true,
            responsestatus: 'Success',
            errorcode: null,
            suberrorcode: 0,
            errormsg: 'Distinct campaign data retrieved successfully'
        });
    } catch (error) {
        // Log the error and return a 500 response
        // AppLogger.error('ECC_583', 'Error message', 'fullPath', 'namespace', 'className', 'methodName', error);
        return res.status(500).json({
            isresponse: false,
            responsestatus: 'Error',
            errorcode: 'ECC_583',
            suberrorcode: 500,
            errormsg: 'Internal Server Error'
        });
    }
});

router.post('/Search',  async (req, res) => {
    try {
        const model = req.body;
        const UserId = parseInt(req.headers['user-id'], 10) || 1;

        // Validate UserId
        if (UserId <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid User ID',
                errorcode: 'Invalid User ID',
                suberrorcode: 400,
                errormsg: 'Invalid User ID'
            });
        }

        // Construct filter conditions based on the request body
        const filters = {
            UserId: BigInt(UserId), // Ensure UserId is matched
            Remark: model.remark ? { contains: model.remark } : undefined,
            CampaignName: model.campaignname ? { contains: model.campaignname } : undefined,
            CreatedIP: model.createdip ? { contains: model.createdip } : undefined,
            Active: model.active !== undefined ? model.active : undefined,
            // You can add more filters based on other fields in the model (e.g., dates)
        };

        // Pagination settings
        const pageSize = model.pagesize || 10;
        const currentPage = model.currentpage || 0;
        const skip = currentPage * pageSize;

        // Fetch data using Prisma
        const result = await prisma.campaigntbl.findMany({
            where: filters,
            skip: skip,
            take: pageSize,
            orderBy: {
                Id: 'desc', // You can change this to sort by another field
            }
        });

        // Get total count for pagination
        const totalCount = await prisma.campaigntbl.count({
            where: filters
        });

        // Return the paginated result
        return res.json({
            data: result,
            totalRecords: totalCount,
            isresponse: true,
            responsestatus: 'Success',
            errorcode: null,
            suberrorcode: 0,
            errormsg: 'Search results fetched successfully'
        });
    } catch (error) {
        // Log the error and return a 500 response
        AppLogger.error('ECC_584', 'Error message', 'fullPath', 'namespace', 'className', 'methodName', error);
        return res.status(500).json({
            isresponse: false,
            responsestatus: 'Error',
            errorcode: 'ECC_584',
            suberrorcode: 500,
            errormsg: 'Internal Server Error'
        });
    }
});


module.exports = router;
