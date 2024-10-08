const express = require('express');
const prisma = require('../../prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const AppLogger = require('./logger'); // assuming logger is in a separate file
const tokenProvider = { secret: 'your-secret-key' }; // Replace with your actual secret

const router = express.Router();

// Register API
router.post('/Register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        });

        res.json({
            IsResponse: true,
            ResponseStatus: 'User Registered',
            ErrorCode: null,
            ErrorMsg: null,
            SubErrorCode: null
        });
    } catch (error) {
        // AppLogger.error('ECC_6', 'Error message', 'userController.js', 'UserOperation', 'Register', 'POST', error);
        res.status(500).json({
            IsResponse: false,
            ResponseStatus: 'Error',
            ErrorCode: 'ECC_6',
            ErrorMsg: 'Internal Server Error',
            SubErrorCode: 'ECC_6'
        });
    }
});

// Login API
router.post('/VerifyCredential', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({
                token: "",
                userid: -1,
                isresponse: false,
                responsestatus: "FAIL",
                errorcode: "UR",
                suberrorcode: 60,
                errormsg: "User credentials do not match. Please ensure that you enter the correct information."
            });
        }

        const token = jwt.sign({ userId: user.id }, tokenProvider.secret, { expiresIn: '1d' });
        res.setHeader('x-authorization', token);

        return res.json({
            token: token,
            userid: user.id,
            isresponse: true,
            responsestatus: "SUCCESS",
            errorcode: "UR",
            suberrorcode: 200,
            errormsg: "success"
        });
    } catch (error) {
        // AppLogger.error('ECC_5', 'Error message', 'userController.js', 'UserOperation', 'VerifyCredential', 'POST', error);
        return res.status(500).json({
            token: "",
            userid: -1,
            isresponse: false,
            responsestatus: "FAIL",
            errorcode: "ECC_5",
            suberrorcode: 500,
            errormsg: "Internal Server Error"
        });
    }
});

module.exports = router;
