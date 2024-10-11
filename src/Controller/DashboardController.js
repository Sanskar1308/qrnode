const express = require('express');
const prisma = require('../../prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenProvider = { secret: 'your-secret-key' };
const router = express.Router();
const authmiddleware = require('../middleware/auth')

router.get('/TotalDevice',authmiddleware, async (req, res) => {
 
    try {
        const userId = parseInt(req.headers['userid'] || req.headers['UserId'], 10);

        // Validate userId
        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid User ID',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        // Fetch total devices for the user
        let total = 0;
        let connected = 0;

        try {
            const result = await prisma.postbl.count({
                where: {
                    UserId: userId
                }
            });
            total = result || 0;
        } catch (err) {
            total = 0;
        }

        // Calculate connected devices based on global.clients
        try {
            if (global.clients) {
                connected = Object.values(global.clients).filter(client => client.UserId === userId).length;
            }
        } catch (err) {
            connected = 0;
        }

        // Return the response
        res.json({
            Connected: connected,
            DisConnected: total - connected,
            Total: total,
            IsResponse: true,
            ResponseStatus: 'Success',
            ErrorCode: 'DC_SUCCESS',
            ErrorMsg: 'Success',
            SubErrorCode: 'DC_SUCCESS'
        });
    } catch (error) {
        // Log error and return a 500 response
        AppLogger.error('ECC_634', 'Error during TotalDevice API', 'fullPath', 'namespace', 'className', 'methodName', error);
        res.status(500).json({
            Connected: 0,
            DisConnected: 0,
            Total: 0,
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_634',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_634'
        });
    }
});

router.get('/ConnectedList',authmiddleware, async (req, res) => {
 
    try {
        // Extract and validate userId
        const userId = parseInt(req.headers['userid'] || req.headers['UserId'], 10);
        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid User ID',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        // Get the connected client IDs
        const clientIds = Object.values(global.clients)
            .filter(client => client.UserId === userId)
            .map(client => client.Id);

        // Fetch the connected POS models based on the client IDs
        const connectedPosModels = Object.entries(global.posModel)
            .filter(([key, value]) => clientIds.includes(key))
            .map(([key, value]) => value);

        // Check if connected POS models exist and return them
        if (connectedPosModels.length > 0) {
            res.json({
                List: connectedPosModels,
                IsResponse: true,
                ResponseStatus: 'Success',
                ErrorCode: 'DC_SUCCESS',
                ErrorMsg: 'Success',
                SubErrorCode: 'DC_SUCCESS'
            });
        } else {
            // If no connected devices were found
            res.status(404).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'ECC_637',
                ErrorMsg: 'No connected devices found',
                SubErrorCode: 'ECC_637'
            });
        }
    } catch (error) {
        // Log the error and return a 500 response
        AppLogger.error('ECC_635', 'Error during ConnectedList API', 'fullPath', 'namespace', 'className', 'methodName', error);
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_635',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_635'
        });
    }
});

router.get('/DisconnectedList',authmiddleware, async (req, res) => {
 
    try {
        // Extract and validate userId from headers
        const userId = parseInt(req.headers['userid'] || req.headers['UserId'], 10);
        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({
                IsResponse: false,
                ResponseStatus: 'Invalid User ID',
                ErrorCode: 'Invalid User ID',
                ErrorMsg: 'Invalid User ID',
                SubErrorCode: 'Invalid User ID'
            });
        }

        // Log to debug userId and the current state of global.clients and global.posModel
        console.log("User ID:", userId);
        console.log("Clients:", global.clients);
        console.log("POS Models:", global.posModel);

        // Get the IDs of connected clients
        const connectedClientIds = Object.values(global.clients)
            .filter(client => client.UserId === userId)
            .map(client => client.Id);

        console.log("Connected Client IDs:", connectedClientIds);

        // Get all POS models for the user, but only those that are disconnected
        const disconnectedPosModels = Object.entries(global.posModel)
            .filter(([key, value]) => !connectedClientIds.includes(key) && value.UserId === userId)
            .map(([key, value]) => value);

        console.log("Disconnected POS Models:", disconnectedPosModels);

        // Check if disconnected POS models exist and return them
        if (disconnectedPosModels.length > 0) {
            res.json({
                List: disconnectedPosModels,
                IsResponse: true,
                ResponseStatus: 'Success',
                ErrorCode: 'DC_SUCCESS',
                ErrorMsg: 'Success',
                SubErrorCode: 'DC_SUCCESS'
            });
        } else {
            // If no disconnected devices were found
            res.status(404).json({
                IsResponse: false,
                ResponseStatus: 'Error',
                ErrorCode: 'ECC_640',
                ErrorMsg: 'No disconnected devices found',
                SubErrorCode: 'ECC_640'
            });
        }
    } catch (error) {
        console.error('Error:', error); // Log the error for debugging
        // Log the error and return a 500 response
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_638',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_638'
        });
    }
});

module.exports = router;