const express = require('express');
const prisma = require('../../prisma/client');
const authmiddleware = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Multer config to save file in "uploads" folder
const upload = multer({ dest: 'uploads/' });

router.post('/Insert', upload.single('file'),authmiddleware, async (req, res) => {
    try {
        const model = req.body;
        model.file = req.file;

        if (!model.file) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'ECC_651',
                ErrorMsg: 'File is required',
                SubErrorCode: 'ECC_651'
            });
        }

        if (!model.Name || model.Name.trim() === "") {
            model.Name = "";
        }

        model.CreatedBy = "User";
        model.Ip = req.ip;
        model.Source = "web";
        model.UserId = parseInt(req.headers['user-id'], 10);

        if (model.UserId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        const audioSavePath = '/path/to/save'; // Replace with actual save path
        const audioDownloadUrl = '/url/to/download'; // Replace with actual download URL

        if (!fs.existsSync(audioSavePath)) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'ECC_653',
                ErrorMsg: 'Save path does not exist',
                SubErrorCode: 'ECC_653'
            });
        }

        const directoryPath = path.join(audioSavePath, model.UserId.toString());
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        const originalFileName = model.file.originalname;
        const systemFileName = `${model.UserId}_${Date.now()}_${originalFileName}`;
        const filePath = path.join(directoryPath, systemFileName);
        const fileSize = model.file.size;

        // Move the file from temp location to final destination
        fs.renameSync(model.file.path, filePath);

        model.DownloadPath = `${audioDownloadUrl}/${model.UserId}/${systemFileName}`;

        // Insert into the database using Prisma
        const insertResult = await prisma.audiotbl.create({
            data: {
                UserId: BigInt(model.UserId),
                Name: model.Name,
                OrgFileName: originalFileName,
                SystemFileName: systemFileName,
                FileSize: fileSize.toString(),
                DownloadPath: model.DownloadPath,
                CreatedBy: model.CreatedBy,
                CreatedDate: new Date(),
                CreatedIP: model.Ip,
                CreatedSource: model.Source,
                Active: true // You can change this based on your logic
            }
        });

        // Return the inserted record
        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: insertResult,
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


module.exports = router;
