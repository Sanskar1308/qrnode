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


module.exports = router;
