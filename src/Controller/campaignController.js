const express = require('express');
const prisma = require('../../prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authmiddleware = require('../middleware/auth');
const tokenProvider = { secret: 'your-secret-key' }; // Replace with your actual secret

const router = express.Router();

// Insert Campaign
router.post('/Insert',authmiddleware, async (req, res) => {
    // #swagger.tags = ['Campaign']
    // #swagger.summary = 'Insert a new campaign'
    // #swagger.description = 'Insert a new campaign into the database'

    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Campaign data',
        required: true,
        schema: {
            campaignname: 'string' ,
            remark: 'string' ,
            active: 'boolean' 
        }
    } */

    /* #swagger.responses[200] = {
          description: 'Campaign created successfully',
          schema: {
              isresponse: true,
              responsestatus: 'Success',
              errorcode: null,
              suberrorcode: 0,
              errormsg: 'Campaign created successfully'
          }
    } */
    
    /* #swagger.responses[400] = {
          description: 'Invalid User ID',
          schema: {
              isresponse: false,
              responsestatus: 'Invalid User ID',
              errorcode: 'Invalid User ID',
              suberrorcode: 400,
              errormsg: 'Invalid User ID'
          }
    } */
    
    /* #swagger.responses[500] = {
          description: 'Internal Server Error',
          schema: {
              isresponse: false,
              responsestatus: 'Error',
              errorcode: 'ECC_576',
              suberrorcode: 500,
              errormsg: 'Internal Server Error'
          }
    } */

    try {
        const { campaignname, remark, active } = req.body;
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
    // #swagger.tags = ['Campaign']
    // #swagger.summary = 'Update an existing campaign'
    // #swagger.description = 'Update an existing campaign in the database'

    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Campaign update data',
        required: true,
        schema: {
            Id: 'integer' ,
            campaignname: 'string' ,
            remark: 'string' ,
            active: 'boolean'
        }
    } */

    /* #swagger.responses[200] = {
          description: 'Campaign updated successfully',
          schema: {
              isresponse: true,
              responsestatus: 'Success',
              errorcode: null,
              suberrorcode: 0,
              errormsg: 'Campaign updated successfully'
          }
    } */
    
    /* #swagger.responses[400] = {
          description: 'Invalid ID or User ID',
          schema: {
              isresponse: false,
              responsestatus: 'Invalid ID or User ID',
              errorcode: 'Invalid ID or User ID',
              suberrorcode: 400,
              errormsg: 'Invalid ID or User ID'
          }
    } */
    
    /* #swagger.responses[500] = {
          description: 'Internal Server Error',
          schema: {
              isresponse: false,
              responsestatus: 'Error',
              errorcode: 'ECC_577',
              suberrorcode: 500,
              errormsg: 'Internal Server Error'
          }
    } */

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
    // #swagger.tags = ['Campaign']
    // #swagger.summary = 'Delete an existing campaign'
    // #swagger.description = 'Delete an existing campaign from the database'

    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Campaign ID to delete',
        required: true,
        schema: {
            id: 'integer'
        }
    } */

    /* #swagger.responses[200] = {
          description: 'Campaign deleted successfully',
          schema: {
              isresponse: true,
              responsestatus: 'Success',
              errorcode: null,
              suberrorcode: 0,
              errormsg: 'Campaign deleted successfully'
          }
    } */
    
    /* #swagger.responses[400] = {
          description: 'Invalid ID or User ID',
          schema: {
              isresponse: false,
              responsestatus: 'Invalid ID or User ID',
              errorcode: 'Invalid ID or User ID',
              suberrorcode: 400,
              errormsg: 'Invalid ID or User ID'
          }
    } */
    
    /* #swagger.responses[500] = {
          description: 'Internal Server Error',
          schema: {
              isresponse: false,
              responsestatus: 'Error',
              errorcode: 'ECC_578',
              suberrorcode: 500,
              errormsg: 'Internal Server Error'
          }
    } */

    try {
        const { id } = req.body;
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
    // #swagger.tags = ['Campaign']
    // #swagger.summary = 'Get a campaign by ID'
    // #swagger.description = 'Fetch campaign details using its ID'

    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Campaign ID',
        required: true,
        schema: {
            id: 'integer'
        }
    } */

    /* #swagger.responses[200] = {
          description: 'Campaign retrieved successfully',
          schema: {
              data: {
                  id: 1,
                  campaignname: 'Campaign name',
                  remark: 'Remark',
                  active: true
              },
              isresponse: true,
              responsestatus: 'Success',
              errorcode: null,
              suberrorcode: 0,
              errormsg: 'Campaign retrieved successfully'
          }
    } */
    
    /* #swagger.responses[400] = {
          description: 'Invalid ID or User ID',
          schema: {
              isresponse: false,
              responsestatus: 'Invalid ID or User ID',
              errorcode: 'Invalid ID or User ID',
              suberrorcode: 400,
              errormsg: 'Invalid ID or User ID'
          }
    } */
    
    /* #swagger.responses[500] = {
          description: 'Internal Server Error',
          schema: {
              isresponse: false,
              responsestatus: 'Error',
              errorcode: 'ECC_579',
              suberrorcode: 500,
              errormsg: 'Internal Server Error'
          }
    } */

    try {
        const { id } = req.body;
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
    // #swagger.tags = ['Campaign']
    // #swagger.summary = 'Update campaign status to Active'
    // #swagger.description = 'Activate a campaign by updating its status to active'

    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Campaign ID',
        required: true,
        schema: {
            id: 'integer'
        }
    } */

    /* #swagger.responses[200] = {
          description: 'Campaign activated successfully',
          schema: {
              isresponse: true,
              responsestatus: 'Success',
              errorcode: null,
              suberrorcode: 0,
              errormsg: 'Campaign activated successfully'
          }
    } */
    
    /* #swagger.responses[400] = {
          description: 'Invalid ID or User ID',
          schema: {
              isresponse: false,
              responsestatus: 'Invalid ID or User ID',
              errorcode: 'Invalid ID or User ID',
              suberrorcode: 400,
              errormsg: 'Invalid ID or User ID'
          }
    } */
    
    /* #swagger.responses[500] = {
          description: 'Internal Server Error',
          schema: {
              isresponse: false,
              responsestatus: 'Error',
              errorcode: 'ECC_580',
              suberrorcode: 500,
              errormsg: 'Internal Server Error'
          }
    } */

    try {
        const { id } = req.body;
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
    // #swagger.tags = ['Campaign']
    // #swagger.summary = 'Update campaign status to Inactive'
    // #swagger.description = 'Deactivate a campaign by updating its status to inactive'

    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Campaign ID',
        required: true,
        schema: {
            id: 'integer'
        }
    } */

    /* #swagger.responses[200] = {
          description: 'Campaign deactivated successfully',
          schema: {
              isresponse: true,
              responsestatus: 'Success',
              errorcode: null,
              suberrorcode: 0,
              errormsg: 'Campaign deactivated successfully'
          }
    } */
    
    /* #swagger.responses[400] = {
          description: 'Invalid ID or User ID',
          schema: {
              isresponse: false,
              responsestatus: 'Invalid ID or User ID',
              errorcode: 'Invalid ID or User ID',
              suberrorcode: 400,
              errormsg: 'Invalid ID or User ID'
          }
    } */
    
    /* #swagger.responses[500] = {
          description: 'Internal Server Error',
          schema: {
              isresponse: false,
              responsestatus: 'Error',
              errorcode: 'ECC_581',
              suberrorcode: 500,
              errormsg: 'Internal Server Error'
          }
    } */

    try {
        const { id } = req.body;
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

router.get('/GetDistinct/:by',authmiddleware, async (req, res) => {
    // #swagger.tags = ['Campaign']
    // #swagger.summary = 'Get distinct campaign names'
    // #swagger.description = 'Fetch distinct campaign names or status (active/inactive)'

    /* #swagger.parameters['by'] = {
        in: 'path',
        description: "Enter a value from the list: campaignname, campaignname_active, campaignname_deactive",
        required: true,
        type: 'string'
    } */

    /* #swagger.parameters['user-id'] = {
        in: 'header',
        description: 'Enter login UserId',
        required: true,
        type: 'string'
    } */

    /* #swagger.parameters['X-Authorization'] = {
        in: 'header',
        description: 'Enter login token',
        required: true,
        type: 'string'
    } */

    /* #swagger.responses[200] = {
          description: 'Distinct campaign data retrieved successfully',
          schema: {
              data: [{ CampaignName: 'string' }],
              isresponse: true,
              responsestatus: 'Success',
              errorcode: null,
              suberrorcode: 0,
              errormsg: 'Distinct campaign data retrieved successfully'
          }
    } */
    
    /* #swagger.responses[400] = {
          description: 'Invalid parameter or User ID',
          schema: {
              isresponse: false,
              responsestatus: 'Invalid parameter or User ID',
              errorcode: 'Invalid parameter or User ID',
              suberrorcode: 400,
              errormsg: 'Invalid parameter or User ID'
          }
    } */
    
    /* #swagger.responses[500] = {
          description: 'Internal Server Error',
          schema: {
              isresponse: false,
              responsestatus: 'Error',
              errorcode: 'ECC_583',
              suberrorcode: 500,
              errormsg: 'Internal Server Error'
          }
    } */

    try {
        const { by } = req.params;

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

        const result = await prisma.campaigntbl.findMany({
            where: {
                UserId: BigInt(userId),
                ...filter
            },
            distinct: ['CampaignName'],
            select: {
                CampaignName: true
            }
        });

        return res.json({
            data: result,
            isresponse: true,
            responsestatus: 'Success',
            errorcode: null,
            suberrorcode: 0,
            errormsg: 'Distinct campaign data retrieved successfully'
        });
    } catch (error) {
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
    // #swagger.tags = ['Campaign']
    // #swagger.summary = 'Search campaigns'
    // #swagger.description = 'Search campaigns by various filters'

    /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Search filters',
        required: true,
        schema: {
            createdip: 'string' ,
            remark: 'string' ,
            actived: 'boolean' ,
            campaignname: 'string' ,
            pagesize: 'integer' ,
            currentpage: 'integer'
        }
    } */

    /* #swagger.responses[200] = {
          description: 'Search results fetched successfully',
          schema: {
              data: [{ id: 1, campaignname: 'string', active: true }],
              isresponse: true,
              responsestatus: 'Success',
              errorcode: null,
              suberrorcode: 0,
              errormsg: 'Search results fetched successfully'
          }
    } */
    
    /* #swagger.responses[400] = {
          description: 'Invalid User ID',
          schema: {
              isresponse: false,
              responsestatus: 'Invalid User ID',
              errorcode: 'Invalid User ID',
              suberrorcode: 400,
              errormsg: 'Invalid User ID'
          }
    } */
    
    /* #swagger.responses[500] = {
          description: 'Internal Server Error',
          schema: {
              isresponse: false,
              responsestatus: 'Error',
              errorcode: 'ECC_584',
              suberrorcode: 500,
              errormsg: 'Internal Server Error'
          }
    } */

    try {
        const model = req.body;
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
