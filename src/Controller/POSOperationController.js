const express = require('express');
const prisma = require('../../prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenProvider = { secret: 'your-secret-key' };
const router = express.Router();
const authmiddleware = require('../middleware/auth');

BigInt.prototype.toJSON = function() {
    return this.toString();
};
router.post('/Insert', async (req, res) => {
    try {
        const model = req.body;
        model.CreatedBy = "User";
        model.Ip = req.ip;
        model.Source = "web";

        // Handle both 'UserId' and 'userid' by normalizing the header lookup to lowercase
        model.UserId = parseInt(req.headers['userid'] || req.headers['UserId'], 10);

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

        // Insert data directly using Prisma
        const insertResult = await prisma.postbl.create({
            data: {
                UserId: model.UserId,  // Refers to 'UserId' in your MySQL table
                PosName: model.posname,
                Active: model.active,
                Remark: model.remark,
                CreatedDate: new Date(), // Current date
                CreatedIP: model.Ip,
                CreatedSource: model.Source,
                CreatedBy: model.CreatedBy,
                MerchantId: model.merchantid,
                ApiKey: model.key
            }
        });

        // Return the inserted record
        res.json(insertResult);
    } catch (error) {
        console.error("Error during insertion:", error);
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        });
    }
});

router.post('/Update', async (req, res) => {
    try {
        const model = req.body;
        model.ModifiedBy = "User";
        model.Ip = req.ip;
        model.Source = "web";
        model.UserId = parseInt(req.headers['userid'] || req.headers['UserId'], 10);

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

        // Validate ID of the POS to be updated
        if (isNaN(model.id) || model.id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid ID',
                ErrorCode: 'Invalid ID',
                ErrorMsg: 'Invalid ID',
                SubErrorCode: 'Invalid ID'
            });
        }

        // Fetch the record based on both UserId and Id
        const existingRecord = await prisma.postbl.findFirst({
            where: {
                Id: model.id,
                UserId: model.UserId
            }
        });

        // Check if the record exists
        if (!existingRecord) {
            return res.status(404).json({
                IsResponse: false,
                ResponseStatus: 'Record Not Found',
                ErrorCode: 'Record Not Found',
                ErrorMsg: 'No record found for the given User ID and POS ID',
                SubErrorCode: 'Record Not Found'
            });
        }

        // Update the record using Prisma
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
                LastModifiedDate: new Date(), // Set current date for the last modified date
            }
        });

        // Return the updated record
        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            ErrorCode: null,
            ErrorMsg: null,
            SubErrorCode: null,
            Data: updateResult
        });
    } catch (error) {
        console.error('Error during update:', error);
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        });
    }
});

router.post('/Delete', async (req, res) => {
    try {
        const model = req.body;
        model.UserId = parseInt(req.headers['userid'] || req.headers['UserId'], 10);

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

        // Validate POS ID to be deleted
        if (isNaN(model.Id) || model.Id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid ID',
                ErrorCode: 'Invalid ID',
                ErrorMsg: 'Invalid ID',
                SubErrorCode: 'Invalid ID'
            });
        }

        // Check if the record exists before attempting deletion
        const existingRecord = await prisma.postbl.findFirst({
            where: {
                Id: model.Id,
                UserId: model.UserId, // Ensure the UserId matches
            }
        });

        if (!existingRecord) {
            return res.status(404).json({
                IsResponse: false,
                ResponseStatus: 'Not Found',
                ErrorCode: 'Not Found',
                ErrorMsg: 'POS record not found',
                SubErrorCode: 'NOT_FOUND'
            });
        }

        // Proceed with deletion operation
        const deleteResult = await prisma.postbl.delete({
            where: {
                Id: model.Id,
            }
        });

        // Return success response if the record is deleted
        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            ErrorCode: null,
            ErrorMsg: null,
            SubErrorCode: null,
            Data: deleteResult
        });
    } catch (error) {
        console.error('Error during deletion:', error); // Log the error for debugging
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        });
    }
});

router.post('/UpdateStatus/Active', authmiddleware , async (req, res) => {
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

        // Validate POS Id
        if (isNaN(model.Id) || model.Id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid ID',
                ErrorCode: 'Invalid ID',
                ErrorMsg: 'Invalid ID',
                SubErrorCode: 'Invalid ID'
            });
        }

        // Check if the POS record exists
        const existingRecord = await prisma.postbl.findFirst({
            where: {
                Id: model.Id,
                UserId: model.UserId // Ensure the UserId matches the record
            }
        });

        if (!existingRecord) {
            return res.status(404).json({
                IsResponse: false,
                ResponseStatus: 'Record Not Found',
                ErrorCode: 'Record Not Found',
                ErrorMsg: 'No record found for the given User ID and POS ID',
                SubErrorCode: 'Record Not Found'
            });
        }

        // Update the status of the POS record to Active
        const updateStatusResult = await prisma.postbl.update({
            where: {
                Id: model.Id
            },
            data: {
                Active: true, // Set the POS record to Active
                LastModifiedBy: model.ModifiedBy,
                LastModifiedIP: model.Ip,
                LastModifiedSource: model.Source,
                LastModifiedDate: new Date() // Update the modified date to the current time
            }
        });

        // Return the updated record
        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            ErrorCode: null,
            ErrorMsg: null,
            SubErrorCode: null,
            Data: updateStatusResult
        });
    } catch (error) {
        // Log the error for debugging purposes
        console.error('Error updating POS status:', error);

        // Respond with a standardized error message
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        });
    }
});

router.post('/UpdateStatus/Deactive', authmiddleware, async (req, res) => {
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

        // Validate POS Id
        if (isNaN(model.Id) || model.Id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid ID',
                ErrorCode: 'Invalid ID',
                ErrorMsg: 'Invalid ID',
                SubErrorCode: 'Invalid ID'
            });
        }

        // Check if the POS record exists
        const existingRecord = await prisma.postbl.findFirst({
            where: {
                Id: model.Id,
                UserId: model.UserId // Ensure the UserId matches the record
            }
        });

        if (!existingRecord) {
            return res.status(404).json({
                IsResponse: false,
                ResponseStatus: 'Record Not Found',
                ErrorCode: 'Record Not Found',
                ErrorMsg: 'No record found for the given User ID and POS ID',
                SubErrorCode: 'Record Not Found'
            });
        }

        // Update the status of the POS record to Deactive
        const updateStatusResult = await prisma.postbl.update({
            where: {
                Id: model.Id
            },
            data: {
                Active: false, // Set the POS record to Deactive
                LastModifiedBy: model.ModifiedBy,
                LastModifiedIP: model.Ip,
                LastModifiedSource: model.Source,
                LastModifiedDate: new Date() // Update the modified date to the current time
            }
        });

        // Return the updated record
        return res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            ErrorCode: null,
            ErrorMsg: null,
            SubErrorCode: null,
            Data: updateStatusResult
        });

    } catch (error) {
        // Log the error for debugging purposes
        console.error('Error deactivating POS status:', error);

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


router.post('/Get', async (req, res) => {
    try {
        const model = req.body;
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

        // Validate POS Id
        if (isNaN(model.Id) || model.Id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid ID',
                ErrorCode: 'Invalid ID',
                ErrorMsg: 'Invalid ID',
                SubErrorCode: 'Invalid ID'
            });
        }

        // Fetch the POS record using Prisma, matching both UserId and POS Id
        const getResult = await prisma.postbl.findFirst({
            where: {
                Id: model.Id,
                UserId: model.UserId
            }
        });

        // If the record doesn't exist, return a 404 response
        if (!getResult) {
            return res.status(404).json({
                IsResponse: false,
                ResponseStatus: 'Record Not Found',
                ErrorCode: 'Record Not Found',
                ErrorMsg: 'No POS record found for the given User ID and POS ID',
                SubErrorCode: 'Record Not Found'
            });
        }

        // If the record exists, return it in the response
        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            ErrorCode: null,
            ErrorMsg: null,
            SubErrorCode: null,
            Data: getResult
        });
    } catch (error) {
        // Log the error for further debugging
        console.error('Error fetching POS record:', error);

        // Respond with a standardized error message
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        });
    }
});

router.post('/Search', async (req, res) => {
    try {
        const model = req.body;
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

        // Construct search conditions dynamically based on request body inputs
        const searchConditions = {
            UserId: model.UserId,
            ...(model.id && model.id > 0 && { Id: model.id }), // Filter by ID if provided
            ...(model.posname && { PosName: { contains: model.posname, mode: 'insensitive' } }), // Case-insensitive POS name search
            ...(model.merchantid && { MerchantId: { contains: model.merchantid, mode: 'insensitive' } }),
            ...(model.key && { ApiKey: { contains: model.key, mode: 'insensitive' } }),
            ...(model.active && model.active !== "" && { Active: model.active }), // Filter by Active status if provided
        };

        // Handle created date filtering
        if (model.applycreateddate) {
            if (model.fromcreateddate && model.endcreateddate) {
                searchConditions.CreatedDate = {
                    gte: new Date(model.fromcreateddate),
                    lte: new Date(model.endcreateddate)
                };
            } else if (model.fromcreateddate) {
                searchConditions.CreatedDate = {
                    gte: new Date(model.fromcreateddate)
                };
            } else if (model.endcreateddate) {
                searchConditions.CreatedDate = {
                    lte: new Date(model.endcreateddate)
                };
            }
        }

        // Pagination and sorting setup
        const pageSize = model.pagesize ;
        const currentPage = model.currentpageno || 0;
        const skip = currentPage * pageSize;

        // Define order for pagination
        const orderDirection = model.pagedirection === 'asc' ? 'asc' : 'desc';

        // Query the database using Prisma
        const queryOptions = {
            where: searchConditions,
            ...(model.withoutpagination ? {} : { skip, take: pageSize }), // Skip and take for pagination
            orderBy: {
                CreatedDate: orderDirection
            }
        };

        const result = await prisma.postbl.findMany(queryOptions);

        // If no records are found
        if (result.length === 0) {
            return res.status(404).json({
                IsResponse: false,
                ResponseStatus: 'No Records Found',
                ErrorCode: 'No Records Found',
                ErrorMsg: 'No POS records match the search criteria',
                SubErrorCode: 'No Records Found'
            });
        }

        // If pagination is applied, return the total count of records as well
        let totalRecords = 0;
        if (!model.withoutpagination) {
            totalRecords = await prisma.postbl.count({ where: searchConditions });
        }

        // Return the search results
        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            ErrorCode: null,
            ErrorMsg: null,
            SubErrorCode: null,
            Data: result,
            ...(model.withoutpagination ? {} : { totalRecords, pageSize, currentPage })
        });
    } catch (error) {
        // Log and respond with a standardized error message
        console.error('Error during POS search:', error);

        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        });
    }
});

router.get('/GetDistinct/:by', async (req, res) => {
    try {
        const by = req.params.by;

        // Allowed values for 'by'
        const allowedValues = [
            "posname", 
            "merchantid", 
            "posname_active", 
            "merchantid_active", 
            "posname_deactive", 
            "merchantid_deactive"
        ];

        // Validate 'by' parameter
        if (!by || !allowedValues.includes(by)) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid parameter',
                ErrorCode: 'Invalid parameter',
                ErrorMsg: 'Invalid parameter',
                SubErrorCode: 'Invalid parameter',
                AllowedValues: allowedValues // Include allowed values in response
            });
        }

        const userId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);

        // Validate UserId
        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid User ID',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        // Logic to map 'by' values to repository operations
        const columnMap = {
            "posname": "PosName",
            "merchantid": "MerchantId",
            "posname_active": { column: "PosName", condition: { Active: true } },
            "merchantid_active": { column: "MerchantId", condition: { Active: true } },
            "posname_deactive": { column: "PosName", condition: { Active: false } },
            "merchantid_deactive": { column: "MerchantId", condition: { Active: false } }
        };

        const queryCondition = columnMap[by];
        let searchCondition = {
            UserId: userId
        };

        if (typeof queryCondition === 'object') {
            searchCondition = { ...searchCondition, ...queryCondition.condition };
        }

        const distinctResult = await prisma.postbl.findMany({
            where: searchCondition,
            distinct: typeof queryCondition === 'object' ? queryCondition.column : queryCondition,
            select: {
                [typeof queryCondition === 'object' ? queryCondition.column : queryCondition]: true
            }
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            ErrorCode: null,
            ErrorMsg: null,
            SubErrorCode: null,
            Data: distinctResult
        });
    } catch (error) {
        // Log the error and respond with a standardized error message

        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        });
    }
});

router.get('/GetDistinct/:by/:merchantId', async (req, res) => {
    try {
        const by = req.params.by;
        const merchantId = req.params.merchantId;

        // Validate the 'by' parameter
        if (!by || (['posname', 'merchantid', 'posname_active', 'merchantid_active', 'posname_deactive', 'merchantid_deactive'].indexOf(by) === -1)) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid "by" parameter',
                ErrorCode: 'Invalid parameter',
                ErrorMsg: 'The "by" parameter is invalid or missing',
                SubErrorCode: 'INVALID_BY_PARAMETER'
            });
        }

        // Validate 'merchantId' parameter
        if (!merchantId) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid Merchant ID',
                ErrorCode: 'Invalid Merchant ID',
                ErrorMsg: 'The "merchantId" parameter is missing',
                SubErrorCode: 'INVALID_MERCHANT_ID'
            });
        }

        // Validate 'user-id' header
        const userId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);
        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid User ID',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'The User ID is missing or invalid',
                SubErrorCode: 'INVALID_USER_ID'
            });
        }

        // Use Prisma to query distinct records based on 'PosName' or 'MerchantId'
        let result;
        if (by.startsWith('posname')) {
            // Fetch distinct PosNames
            result = await prisma.postbl.findMany({
                where: { MerchantId: merchantId, UserId: userId },
                distinct: ['PosName'], // Fetch distinct PosName
                select: { PosName: true }, // Only return PosName
            });
        } else if (by.startsWith('merchantid')) {
            // Fetch distinct MerchantIds
            result = await prisma.postbl.findMany({
                where: { MerchantId: merchantId, UserId: userId },
                distinct: ['MerchantId'], // Fetch distinct MerchantId
                select: { MerchantId: true }, // Only return MerchantId
            });
        }

        // If no results found
        if (!result || result.length === 0) {
            return res.status(404).json({
                IsResponse: false,
                ResponseStatus: 'No Records Found',
                ErrorCode: 'NO_RECORDS_FOUND',
                ErrorMsg: 'No distinct records found for the given criteria',
                SubErrorCode: 'NO_RECORDS_FOUND'
            });
        }

        // Success response
        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            ErrorCode: null,
            ErrorMsg: null,
            SubErrorCode: null,
            Data: result
        });
    } catch (error) {
        console.error('Error in GetDistinct API:', error);
        // Log the error and respond with a standard error message
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Internal Server Error',
            ErrorCode: 'ECC_68',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_68'
        });
    }
});

module.exports = router;