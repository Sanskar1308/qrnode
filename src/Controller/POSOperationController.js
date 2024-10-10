const express = require('express');
const prisma = require('../../prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenProvider = { secret: 'your-secret-key' };
const router = express.Router();
const authmiddleware = require('../middleware/auth');

// Add BigInt serialization support
BigInt.prototype.toJSON = function() {
    return this.toString();
};

// Insert API
router.post('/Insert',authmiddleware, async (req, res) => {
    // #swagger.tags = ['POSOperation']
    // #swagger.summary = 'Insert new POS record'
    // #swagger.description = 'Inserts a new POS record for the user.'

    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            PosName: 'string',
            active: 'boolean',
            remark: 'string',
            merchantid: 'string',
            key: 'string'
        }
    } */

    /* #swagger.responses[200] = {
        description: 'POS record successfully inserted',
        schema: {
            Id: 'bigint',
            UserId: 'bigint',
            PosName: 'string',
            Active: 'boolean',
            Remark: 'string',
            MerchantId: 'string',
            ApiKey: 'string',
            CreatedDate: 'date',
            CreatedIP: 'string',
            CreatedSource: 'string',
            CreatedBy: 'string'
        }
    } */

    /* #swagger.responses[500] = {
        description: 'Internal Server Error',
        schema: {
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        }
    } */

    try {
        const model = req.body;
        model.CreatedBy = "User";
        model.Ip = req.ip;
        model.Source = "web";
        model.UserId = parseInt(req.headers['userid'] || req.headers['UserId'], 10);

        const insertResult = await prisma.postbl.create({
            data: {
                UserId: model.UserId,
                PosName: model.posname,
                Active: model.active,
                Remark: model.remark,
                CreatedDate: new Date(),
                CreatedIP: model.Ip,
                CreatedSource: model.Source,
                CreatedBy: model.CreatedBy,
                MerchantId: model.merchantid,
                ApiKey: model.key
            }
        });

        res.json(insertResult);
    } catch (error) {
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        });
    }
});

// Update API
router.post('/Update',authmiddleware, async (req, res) => {
    // #swagger.tags = ['POSOperation']
    // #swagger.summary = 'Update existing POS record'
    // #swagger.description = 'Updates an existing POS record.'

    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            id: 'bigint',
            PosName: 'string',
            active: { type: 'boolean', description: 'true for active, false for inactive' } ,
            remark: 'string',
            merchantid: 'string',
            key: 'string'
        }
    } */

    /* #swagger.responses[200] = {
        description: 'POS record successfully updated',
        schema: {
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: {
                Id: 'bigint',
                PosName: 'string',
                Active: 'boolean',
                Remark: 'string',
                MerchantId: 'string',
                ApiKey: 'string',
                LastModifiedBy: 'string',
                LastModifiedDate: 'date'
            }
        }
    } */

    /* #swagger.responses[500] = {
        description: 'Internal Server Error',
        schema: {
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        }
    } */

    try {
        const model = req.body;
        model.ModifiedBy = "User";
        model.Ip = req.ip;
        model.Source = "web";
        model.UserId = parseInt(req.headers['userid'] || req.headers['UserId'], 10);

        const updateResult = await prisma.postbl.update({
            where: { Id: model.id },
            data: {
                PosName: model.posname,
                MerchantId: model.merchantid,
                ApiKey: model.key,
                Remark: model.remark,
                Active: model.active,
                LastModifiedBy: model.ModifiedBy,
                LastModifiedIP: model.Ip,
                LastModifiedSource: model.Source,
                LastModifiedDate: new Date()
            }
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: updateResult
        });
    } catch (error) {
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        });
    }
});

// Delete API
router.post('/Delete',authmiddleware, async (req, res) => {
    // #swagger.tags = ['POSOperation']
    // #swagger.summary = 'Delete POS record'
    // #swagger.description = 'Deletes a POS record for the given User ID and POS ID.'

    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            id: 'bigint'
        }
    } */

    /* #swagger.responses[200] = {
        description: 'POS record successfully deleted',
        schema: {
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: { Id: 'bigint' }
        }
    } */

    /* #swagger.responses[500] = {
        description: 'Internal Server Error',
        schema: {
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        }
    } */

    try {
        const model = req.body;
        model.UserId = parseInt(req.headers['userid'] || req.headers['UserId'], 10);

        const deleteResult = await prisma.postbl.delete({
            where: { Id: model.Id },
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: deleteResult
        });
    } catch (error) {
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        });
    }
});

router.post('/UpdateStatus/Active', authmiddleware, async (req, res) => {
    // #swagger.tags = ['POSOperation']
    // #swagger.summary = 'Activate POS record'
    // #swagger.description = 'Sets the Active status of a POS record to true.'

    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            id: 'bigint'
        }
    } */

    /* #swagger.responses[200] = {
        description: 'POS status successfully updated to Active',
        schema: {
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: { Id: 'bigint', Active: 'boolean' }
        }
    } */

    /* #swagger.responses[500] = {
        description: 'Internal Server Error',
        schema: {
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        }
    } */
    
    try {
        const model = req.body;
        model.ModifiedBy = "User";
        model.Operation = "Active";
        model.Ip = req.ip;
        model.Source = "web";
        model.UserId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);

        // Validate UserId
        if (isNaN(model.UserId) || model.UserId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid User ID',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        const updateStatusResult = await prisma.postbl.update({
            where: { Id: model.Id },
            data: {
                Active: true,
                LastModifiedBy: model.ModifiedBy,
                LastModifiedIP: model.Ip,
                LastModifiedSource: model.Source,
                LastModifiedDate: new Date()
            }
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: updateStatusResult
        });
    } catch (error) {
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        });
    }
});



// Update Status Deactive API
router.post('/UpdateStatus/Deactive',authmiddleware, async (req, res) => {
    // #swagger.tags = ['POSOperation']
    // #swagger.summary = 'Deactivate POS record'
    // #swagger.description = 'Sets the Active status of a POS record to false.'

    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            id: 'bigint'
        }
    } */

    /* #swagger.responses[200] = {
        description: 'POS status successfully updated to Deactive',
        schema: {
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: { Id: 'bigint', Active: 'boolean' }
        }
    } */

    /* #swagger.responses[500] = {
        description: 'Internal Server Error',
        schema: {
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        }
    } */
    
    try {
        const model = req.body;
        model.ModifiedBy = "User";
        model.Operation = "Deactive";
        model.Ip = req.ip;
        model.Source = "web";
        model.UserId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);

        // Validate UserId
        if (isNaN(model.UserId) || model.UserId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid User ID',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        const updateStatusResult = await prisma.postbl.update({
            where: { Id: model.Id },
            data: {
                Active: false,
                LastModifiedBy: model.ModifiedBy,
                LastModifiedIP: model.Ip,
                LastModifiedSource: model.Source,
                LastModifiedDate: new Date()
            }
        });

        // Return the updated record
        return res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: updateStatusResult
        });
    } catch (error) {
        // Respond with a standardized error message
        return res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        });
    }
});



// Get API

router.post('/Get',authmiddleware, async (req, res) => {
    // #swagger.tags = ['POSOperation']
    // #swagger.summary = 'Get a specific POS record'
    // #swagger.description = 'Retrieve a specific POS record based on the User ID and POS ID.'

    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            id: 'bigint'
        }
    } */

    /* #swagger.responses[200] = {
        description: 'POS record successfully retrieved',
        schema: {
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: {
                Id: 'bigint',
                PosName: 'string',
                Active: 'boolean',
                MerchantId: 'string',
                ApiKey: 'string',
                CreatedDate: 'date',
                CreatedIP: 'string',
                CreatedSource: 'string',
                CreatedBy: 'string'
            }
        }
    } */

    /* #swagger.responses[500] = {
        description: 'Internal Server Error',
        schema: {
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        }
    } */

    try {
        const model = req.body;
        model.UserId = parseInt(req.headers['userid'] || req.headers['UserId'], 10);

        const getResult = await prisma.postbl.findFirst({
            where: {
                Id: model.Id,
                UserId: model.UserId
            }
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: getResult
        });
    } catch (error) {
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        });
    }
});

// Search API
router.post('/Search',authmiddleware, async (req, res) => {
    // #swagger.tags = ['POSOperation']
    // #swagger.summary = 'Search POS records'
    // #swagger.description = 'Search POS records based on provided criteria.'

    /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            posname: 'string',
            merchantid: 'string',
            key: 'string',
            active: 'boolean',
            applycreateddate: 'boolean',
            fromcreateddate: 'date',
            endcreateddate: 'date',
            currentpageno: 'integer',
            pagesize: 'integer'
        }
    } */

    /* #swagger.responses[200] = {
        description: 'POS records successfully retrieved',
        schema: {
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: [{ PosName: 'string', MerchantId: 'string', Active: 'boolean' }],
            totalRecords: 'integer',
            pageSize: 'integer',
            currentPage: 'integer'
        }
    } */

    /* #swagger.responses[500] = {
        description: 'Internal Server Error',
        schema: {
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        }
    } */

    try {
        const model = req.body;
        model.UserId = parseInt(req.headers['userid'] || req.headers['UserId'], 10);

        const searchConditions = {
            UserId: model.UserId,
            ...(model.id && model.id > 0 && { Id: model.id }),
            ...(model.posname && { PosName: { contains: model.posname, mode: 'insensitive' } }),
            ...(model.merchantid && { MerchantId: { contains: model.merchantid, mode: 'insensitive' } }),
            ...(model.key && { ApiKey: { contains: model.key, mode: 'insensitive' } }),
            ...(model.active && model.active !== "" && { Active: model.active })
        };

        const pageSize = model.pagesize;
        const currentPage = model.currentpageno || 0;
        const skip = currentPage * pageSize;

        const result = await prisma.postbl.findMany({
            where: searchConditions,
            skip: skip,
            take: pageSize,
            orderBy: { CreatedDate: 'desc' }
        });

        const totalRecords = await prisma.postbl.count({ where: searchConditions });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: result,
            totalRecords,
            pageSize,
            currentPage
        });
    } catch (error) {
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        });
    }
});

// Get Distinct API
router.get('/GetDistinct/:by',authmiddleware, async (req, res) => {
    // #swagger.tags = ['POSOperation']
    // #swagger.summary = 'Get distinct values based on a specific field'
    // #swagger.description = 'Fetch distinct values of a specific field like POSName or MerchantId, optionally filtering by active or inactive status.'

    /* #swagger.parameters['by'] = {
        in: 'path',
        description: 'Enter a value from the list: posname, merchantid, posname_active, merchantid_active, posname_deactive, merchantid_deactive',
        required: true,
        type: 'string'
    } */

    /* #swagger.responses[200] = {
        description: 'Successfully retrieved distinct values',
        schema: {
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: [{ value: 'distinct_value' }]
        }
    } */

    /* #swagger.responses[500] = {
        description: 'Internal Server Error',
        schema: {
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        }
    } */

    try {
        const by = req.params.by;

        const allowedValues = [
            "posname", 
            "merchantid", 
            "posname_active", 
            "merchantid_active", 
            "posname_deactive", 
            "merchantid_deactive"
        ];

        if (!allowedValues.includes(by)) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid parameter',
                ErrorCode: 'Invalid parameter',
                ErrorMsg: 'Invalid parameter',
                SubErrorCode: 'Invalid parameter',
                AllowedValues: allowedValues
            });
        }

        const userId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);

        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid User ID',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        const columnMap = {
            "posname": "PosName",
            "merchantid": "MerchantId",
            "posname_active": { column: "PosName", condition: { Active: true } },
            "merchantid_active": { column: "MerchantId", condition: { Active: true } },
            "posname_deactive": { column: "PosName", condition: { Active: false } },
            "merchantid_deactive": { column: "MerchantId", condition: { Active: false } }
        };

        const queryCondition = columnMap[by];
        let searchCondition = { UserId: userId };

        if (typeof queryCondition === 'object') {
            searchCondition = { ...searchCondition, ...queryCondition.condition };
        }

        const distinctResult = await prisma.postbl.findMany({
            where: searchCondition,
            distinct: typeof queryCondition === 'object' ? queryCondition.column : queryCondition,
            select: { [typeof queryCondition === 'object' ? queryCondition.column : queryCondition]: true }
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: distinctResult
        });
    } catch (error) {
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        });
    }
});

// Get Distinct with Merchant ID API
router.get('/GetDistinct/:by/:merchantId',authmiddleware, async (req, res) => {
    // #swagger.tags = ['POSOperation']
    // #swagger.summary = 'Get distinct values based on a specific field and Merchant ID'
    // #swagger.description = 'Fetch distinct values of a specific field like POSName or MerchantId, filtered by MerchantId and optionally active or inactive status.'

    /* #swagger.parameters['by'] = {
        in: 'path',
        description: 'Enter a value from the list: posname, merchantid, posname_active, merchantid_active, posname_deactive, merchantid_deactive',
        required: true,
        type: 'string'
    } */

    /* #swagger.parameters['merchantId'] = {
        in: 'path',
        description: 'The Merchant ID to filter the results',
        required: true,
        type: 'string'
    } */

    /* #swagger.responses[200] = {
        description: 'Successfully retrieved distinct values based on Merchant ID',
        schema: {
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: [{ value: 'distinct_value' }]
        }
    } */

    /* #swagger.responses[500] = {
        description: 'Internal Server Error',
        schema: {
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        }
    } */

    try {
        const by = req.params.by;
        const merchantId = req.params.merchantId;

        // Validate 'by' parameter
        const allowedValues = [
            "posname", 
            "merchantid", 
            "posname_active", 
            "merchantid_active", 
            "posname_deactive", 
            "merchantid_deactive"
        ];

        if (!allowedValues.includes(by)) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid parameter',
                ErrorCode: 'Invalid parameter',
                ErrorMsg: 'Invalid parameter',
                SubErrorCode: 'Invalid parameter',
                AllowedValues: allowedValues
            });
        }

        const userId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);

        // Validate UserId and MerchantId
        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid User ID',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        if (!merchantId) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid Merchant ID',
                ErrorCode: 'Invalid Merchant ID',
                ErrorMsg: 'The "merchantId" parameter is missing',
                SubErrorCode: 'INVALID_MERCHANT_ID'
            });
        }

        const columnMap = {
            "posname": "PosName",
            "merchantid": "MerchantId",
            "posname_active": { column: "PosName", condition: { Active: true } },
            "merchantid_active": { column: "MerchantId", condition: { Active: true } },
            "posname_deactive": { column: "PosName", condition: { Active: false } },
            "merchantid_deactive": { column: "MerchantId", condition: { Active: false } }
        };

        const queryCondition = columnMap[by];
        let searchCondition = { MerchantId: merchantId, UserId: userId };

        if (typeof queryCondition === 'object') {
            searchCondition = { ...searchCondition, ...queryCondition.condition };
        }

        const distinctResult = await prisma.postbl.findMany({
            where: searchCondition,
            distinct: typeof queryCondition === 'object' ? queryCondition.column : queryCondition,
            select: { [typeof queryCondition === 'object' ? queryCondition.column : queryCondition]: true }
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: distinctResult
        });
    } catch (error) {
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        });
    }
});


module.exports = router;
