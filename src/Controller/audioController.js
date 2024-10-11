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
        model.UserId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);

        if (model.UserId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        const audioSavePath = '/opt/qrcode/audiodata'; // Replace with actual save path
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
        console.log('Model:', model);
        console.log('File Save Path:', filePath);
        
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

router.post('/UpdateFile', upload.single('file'), authmiddleware, async (req, res) => {
    try {
        const model = req.body;
        model.file = req.file;

        if (!model.file) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'ECC_666',
                ErrorMsg: 'File is required',
                SubErrorCode: 'ECC_666'
            });
        }

        if (model.Id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'ECC_665',
                ErrorMsg: 'Invalid ID',
                SubErrorCode: 'ECC_665'
            });
        }

        model.ModifiedBy = "User";
        model.Ip = req.ip;
        model.Source = "web";
        model.UserId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);

        if (model.UserId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        const audioSavePath = '/opt/qrcode/audiodata'; // Replace with actual path
        const audioDownloadUrl = '/url/to/download'; // Replace with actual URL

        if (!fs.existsSync(audioSavePath)) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'ECC_668',
                ErrorMsg: 'Save path does not exist',
                SubErrorCode: 'ECC_668'
            });
        }

        const directoryPath = path.join(audioSavePath, model.UserId.toString());
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        const fileName = `${model.UserId}_${Date.now()}_${model.file.originalname}`;
        const filePath = path.join(directoryPath, fileName);

        // Move the file from temp location to final destination
        fs.renameSync(model.file.path, filePath);

        model.FilePath = `${audioDownloadUrl}/${model.UserId}/${fileName}`;
        

        // Update the file information in the database using Prisma
        const updateResult = await prisma.audiotbl.update({
            where: {
                Id: BigInt(model.Id), // Ensure this is the correct field name and data type in the schema
            },
            data: {
                UserId: BigInt(model.UserId),
                DownloadPath: model.FilePath,  // Change FilePath to DownloadPath to match your schema
                LastModifiedBy: model?.ModifiedBy,
                LastModifiedDate: new Date(),
                LastModifiedIP: model.Ip,
                LastModifiedSource: model.Source,
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

        model.ModifiedBy = "User";
        model.Ip = req.ip;
        model.Source = "web";
        model.UserId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);

        if (model.UserId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        if (model.Id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid ID',
                ErrorMsg: 'Invalid ID',
                SubErrorCode: 'Invalid ID'
            });
        }

        // Update the database using Prisma
        const updateResult = await prisma.audiotbl.update({
            where: {
                Id: BigInt(model.Id), // Ensure this matches your schema
            },
            data: {
                UserId: BigInt(model.UserId),
                LastModifiedBy: model.ModifiedBy,
                LastModifiedDate: new Date(),
                LastModifiedIP: model.Ip,
                LastModifiedSource: model.Source,
                Active: model.Active, // assuming you're updating Active field
                Name: model.Name, // assuming you're updating Name field
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

router.post('/Delete', authmiddleware, async (req, res) => {
    try {
        const model = req.body;
        model.UserId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);


        if (model.UserId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        if (model.Id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid ID',
                ErrorMsg: 'Invalid ID',
                SubErrorCode: 'Invalid ID'
            });
        }

        // Use Prisma to delete the record by Id
        const deleteResult = await prisma.audiotbl.delete({
            where: {
                Id: BigInt(model.Id), // Make sure this matches your schema
            }
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: deleteResult,
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

router.get('/Get/:id', authmiddleware, async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const userId = parseInt(req.headers['userid'] || req.headers['user-id'], 10);

        if (userId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        if (id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid ID',
                ErrorMsg: 'Invalid ID',
                SubErrorCode: 'Invalid ID'
            });
        }

        // Use Prisma to fetch the record by Id
        const getResult = await prisma.audiotbl.findUnique({
            where: {
                Id: BigInt(id), // Ensure this matches your schema
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
            Data: getResult,
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

router.post('/UpdateStatus/Active', authmiddleware, async (req, res) => {
    try {
        const model = req.body;

        if (model.UserId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        if (model.Id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid ID',
                ErrorMsg: 'Invalid ID',
                SubErrorCode: 'Invalid ID'
            });
        }

        // Use Prisma to update the "Active" status of the record
        const updateStatusResult = await prisma.audiotbl.update({
            where: {
                Id: BigInt(model.Id), // Ensure this matches your schema
            },
            data: {
                Active: true // Set the Active status to true
            }
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: updateStatusResult,
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

router.post('/UpdateStatus/Deactive', authmiddleware, async (req, res) => {
    try {
        const model = req.body;

        if (model.UserId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        if (model.Id <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid ID',
                ErrorMsg: 'Invalid ID',
                SubErrorCode: 'Invalid ID'
            });
        }

        // Use Prisma to update the "Active" status of the record
        const updateStatusResult = await prisma.audiotbl.update({
            where: {
                Id: BigInt(model.Id), // Ensure this matches your schema
            },
            data: {
                Active: false // Set the Active status to true
            }
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: updateStatusResult,
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

router.get('/GetDistinct/:by', authmiddleware, async (req, res) => {
    try {
        const by = req.params.by;

        if (!by || by.trim() === "") {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid parameter',
                ErrorMsg: 'Invalid parameter',
                SubErrorCode: 'Invalid parameter'
            });
        }

        // Validate the "by" parameter to ensure it's one of the allowed fields
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

        let distinctField;
        let condition = {};

        // Handle different cases for the "by" parameter
        switch (by) {
            case 'name':
                distinctField = 'Name';
                break;
            case 'name_active':
                distinctField = 'Name';
                condition = { Active: true }; // Only active names
                break;
            case 'name_deactive':
                distinctField = 'Name';
                condition = { Active: false }; // Only deactive names
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

        // Use Prisma to find distinct values
        const getDistinctResult = await prisma.audiotbl.findMany({
            where: condition,
            distinct: [distinctField], // Prisma's distinct query
            select: {
                [distinctField]: true // Select only the distinct field
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

        if (model.UserId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        // Construct the filter condition dynamically
        const filterConditions = {};

        if (model.name) {
            filterConditions.Name = {
                contains: model.name, // Search for partial match
            };
        }

        if (model.active !== undefined) {
            filterConditions.Active = model.active === 'true'; // Check for active status
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

        // Perform the search using Prisma
        const searchResult = await prisma.audiotbl.findMany({
            where: filterConditions,
            skip: skip,
            take: pageSize,
            orderBy: {
                CreatedDate: 'desc',
            },
        });

        // Optional: total records for pagination
        const totalRecords = await prisma.audiotbl.count({
            where: filterConditions,
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'Success',
            Data: searchResult,
            TotalRecords: totalRecords,
            ErrorCode: null,
            ErrorMsg: null,
            SubErrorCode: null,
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
