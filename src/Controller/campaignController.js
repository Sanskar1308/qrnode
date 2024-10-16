const express = require('express');
const prisma = require('../../prisma/client');
const authmiddleware = require('../middleware/auth');

const router = express.Router();

// Insert Campaign
router.post('/Insert',authmiddleware, async (req, res) => {

    try {
        const { campaignname, remark, active } = req.body;
        const UserId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);
        if (UserId <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid User ID',
                errorcode: 'Invalid User ID',
                suberrorcode: 400,
                errormsg: 'Invalid User ID'
            });
        }

        const insertResult = await prisma.campaigntbl.create({
            data: {
                UserId,
                CampaignName: campaignname || null,
                Remark: remark || null,
                Active: active !== undefined ? active : true,
                CreatedDate: new Date(),
                CreatedIP: req.ip,
                CreatedSource: "web",
                CreatedBy: "User"
            }
        });

        return res.json({
            isresponse: true,
            responsestatus: 'Success',
            errorcode: null,
            suberrorcode: 0,
            errormsg: 'Campaign created successfully'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            isresponse: false,
            responsestatus: 'Error',
            errorcode: 'ECC_576',
            suberrorcode: 500,
            errormsg: 'Internal Server Error'
        });
    }
});

// Update Campaign
router.post('/Update',authmiddleware, async (req, res) => {

    try {
        const { Id, campaignname, remark, active } = req.body;
        const UserId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);

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

        return res.json({
            isresponse: true,
            responsestatus: 'Success',
            errorcode: null,
            suberrorcode: 0,
            errormsg: 'Campaign updated successfully'
        });
    } catch (error) {
        return res.status(500).json({
            isresponse: false,
            responsestatus: 'Error',
            errorcode: 'ECC_577',
            suberrorcode: 500,
            errormsg: 'Internal Server Error'
        });
    }
});

// Delete Campaign
router.post('/Delete',authmiddleware, async (req, res) => {

    try {
        const { id } = req.body;
        const UserId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);

        if (UserId <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid User ID',
                errorcode: 'Invalid User ID',
                suberrorcode: 400,
                errormsg: 'Invalid User ID'
            });
        }

        if (id <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid ID',
                errorcode: 'Invalid ID',
                suberrorcode: 400,
                errormsg: 'Invalid ID'
            });
        }

        const data = await prisma.campaigntbl.findUnique({ where: { Id: BigInt(id) } });

        if (!data) {
            return res.status(404).json({
                isresponse: false,
                responsestatus: 'Not Found',
                errorcode: 'NOT_FOUND',
                suberrorcode: 404,
                errormsg: 'Campaign not found'
            });
        }

        const deleteResult = await prisma.campaigntbl.delete({
            where: { Id: data.Id }
        });

        return res.json({
            isresponse: true,
            responsestatus: 'Success',
            errorcode: null,
            suberrorcode: 0,
            errormsg: 'Campaign deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            isresponse: false,
            responsestatus: 'Error',
            errorcode: 'ECC_578',
            suberrorcode: 500,
            errormsg: 'Internal Server Error'
        });
    }
});

// Get Campaign
router.post('/Get',authmiddleware, async (req, res) => {

    try {
        const { id } = req.body;
        const UserId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);

        if (UserId <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid User ID',
                errorcode: 'Invalid User ID',
                suberrorcode: 400,
                errormsg: 'Invalid User ID'
            });
        }

        if (id <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid ID',
                errorcode: 'Invalid ID',
                suberrorcode: 400,
                errormsg: 'Invalid campaign ID'
            });
        }

        const campaign = await prisma.campaigntbl.findFirst({
            where: {
                Id: BigInt(id),
                UserId: BigInt(UserId)
            }
        });

        if (!campaign) {
            return res.status(404).json({
                isresponse: false,
                responsestatus: 'Not Found',
                errorcode: 'NOT_FOUND',
                suberrorcode: 404,
                errormsg: 'Campaign not found'
            });
        }

        return res.json({
            data: campaign,
            isresponse: true,
            responsestatus: 'Success',
            errorcode: null,
            suberrorcode: 0,
            errormsg: 'Campaign retrieved successfully'
        });
    } catch (error) {
        return res.status(500).json({
            isresponse: false,
            responsestatus: 'Error',
            errorcode: 'ECC_579',
            suberrorcode: 500,
            errormsg: 'Internal Server Error'
        });
    }
});

// Update Status to Active
router.post('/UpdateStatus/Active',authmiddleware, async (req, res) => {

    try {
        const { id } = req.body;
        const UserId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);

        if (UserId <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid User ID',
                errorcode: 'Invalid User ID',
                suberrorcode: 400,
                errormsg: 'Invalid User ID'
            });
        }

        if (id <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid ID',
                errorcode: 'Invalid ID',
                suberrorcode: 400,
                errormsg: 'Invalid campaign ID'
            });
        }

        const updateStatusResult = await prisma.campaigntbl.update({
            where: {
                Id: BigInt(id),
                UserId: BigInt(UserId)
            },
            data: {
                Active: true,
                LastModifiedDate: new Date(),
                LastModifiedIP: req.ip,
                LastModifiedSource: 'web',
                LastModifiedBy: 'User'
            }
        });

        return res.json({
            isresponse: true,
            responsestatus: 'Success',
            errorcode: null,
            suberrorcode: 0,
            errormsg: 'Campaign status updated successfully'
        });
    } catch (error) {
        return res.status(500).json({
            isresponse: false,
            responsestatus: 'Error',
            errorcode: 'ECC_580',
            suberrorcode: 500,
            errormsg: 'Internal Server Error'
        });
    }
});

// Update Status to Inactive (Deactive)
router.post('/UpdateStatus/Deactive',authmiddleware, async (req, res) => {
    try {
        const { id } = req.body;
        const UserId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);

        if (UserId <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid User ID',
                errorcode: 'Invalid User ID',
                suberrorcode: 400,
                errormsg: 'Invalid User ID'
            });
        }

        if (id <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid ID',
                errorcode: 'Invalid ID',
                suberrorcode: 400,
                errormsg: 'Invalid campaign ID'
            });
        }

        const updateStatusResult = await prisma.campaigntbl.update({
            where: {
                Id: BigInt(id),
                UserId: BigInt(UserId)
            },
            data: {
                Active: false,
                LastModifiedDate: new Date(),
                LastModifiedIP: req.ip,
                LastModifiedSource: 'web',
                LastModifiedBy: 'User'
            }
        });

        return res.json({
            isresponse: true,
            responsestatus: 'Success',
            errorcode: null,
            suberrorcode: 0,
            errormsg: 'Campaign deactivated successfully'
        });
    } catch (error) {
        return res.status(500).json({
            isresponse: false,
            responsestatus: 'Error',
            errorcode: 'ECC_581',
            suberrorcode: 500,
            errormsg: 'Internal Server Error'
        });
    }
});

router.get('/GetDistinct/:by', authmiddleware, async (req, res) => {
    try {
        const { by } = req.params;

        // Check if the 'by' parameter is valid
        if (!['campaignname', 'campaignname_active', 'campaignname_deactive'].includes(by)) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid parameter',
                errorcode: 'Invalid parameter',
                suberrorcode: 400,
                errormsg: 'Invalid parameter value'
            });
        }

        const userId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);

        // Check if userId is valid
        if (userId <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid User ID',
                errorcode: 'Invalid User ID',
                suberrorcode: 400,
                errormsg: 'Invalid User ID'
            });
        }

        let filter = {};
        if (by === 'campaignname_active') {
            filter = { Active: true };
        } else if (by === 'campaignname_deactive') {
            filter = { Active: false };
        }

        // Execute the Prisma query to fetch Id and CampaignName from campaigntbl
        const result = await prisma.campaigntbl.findMany({
            where: {
                UserId: BigInt(userId),
                ...filter
            },
            distinct: ['CampaignName'],
            select: {
                Id: true,          // Select Id
                CampaignName: true  // Select CampaignName
            }
        });

        // Log the result to see what the query returned
        console.log("Prisma Query Result:", result);

        // Check if there is any result to return
        if (!result || result.length === 0) {
            return res.status(404).json({
                isresponse: false,
                responsestatus: 'Error',
                errorcode: 'NoRecordsFound',
                suberrorcode: 404,
                errormsg: 'No campaigns found for this user'
            });
        }

        // Map the result to include only Id and CampaignName in the desired format
        return res.json({
            data: result.map((item) => ({
                id: item.Id,
                value: item.CampaignName  // Map CampaignName to 'value'
            })),
            isresponse: true,
            responsestatus: 'SUCCESS',
            errorcode: 'CampaignR',
            suberrorcode: 200,
            errormsg: 'success'
        });
    } catch (error) {
        // Log the actual error for debugging
        console.error("Error occurred:", error);

        // Return the Internal Server Error response
        return res.status(500).json({
            isresponse: false,
            responsestatus: 'Error',
            errorcode: 'ECC_583',
            suberrorcode: 500,
            errormsg: 'Internal Server Error'
        });
    }
});

// Search Campaigns
router.post('/Search',authmiddleware, async (req, res) => {
    try {
        const model = req.body;
        const UserId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);

        if (UserId <= 0) {
            return res.status(400).json({
                isresponse: false,
                responsestatus: 'Invalid User ID',
                errorcode: 'Invalid User ID',
                suberrorcode: 400,
                errormsg: 'Invalid User ID'
            });
        }

        const filters = {
            UserId: BigInt(UserId),
            Remark: model.remark ? { contains: model.remark } : undefined,
            CampaignName: model.campaignname ? { contains: model.campaignname } : undefined,
            CreatedIP: model.createdip ? { contains: model.createdip } : undefined,
            Active: model.active !== undefined ? model.active : undefined
        };

        const pageSize = model.pagesize || 10;
        const currentPage = model.currentpage || 0;
        const skip = currentPage * pageSize;

        const result = await prisma.campaigntbl.findMany({
            where: filters,
            skip: skip,
            take: pageSize,
            orderBy: {
                Id: 'desc',
            }
        });

        const totalCount = await prisma.campaigntbl.count({
            where: filters
        });

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
