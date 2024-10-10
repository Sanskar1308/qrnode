const express = require('express');
const prisma = require('../../prisma/client');
const fs = require('fs');
const path = require('path');
const multer = require('multer'); // Import multer

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
router.post('/Insert', upload.single('file'), async (req, res) => {
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

module.exports = router;
