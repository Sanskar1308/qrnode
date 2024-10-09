const express = require('express');
const prisma = require('../../prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenProvider = { secret: 'your-secret-key' };
const router = express.Router();

BigInt.prototype.toJSON = function() {
    return this.toString();
};
router.post('/Insert', async (req, res) => {
    try {
        const model = req.body;
        model.CreatedBy = "User";
        model.Ip = req.ip;
        model.Source = "web";
        
        // Extract UserId from the request heade
        model.UserId = parseInt(req.headers['user-id'], 10);

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
                UserId: model.UserId,
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

        // Return the inserted record (BigInt fields will be automatically serialized as strings)
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
        model.UserId = parseInt(req.headers['user-id'], 10);

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


module.exports = router;