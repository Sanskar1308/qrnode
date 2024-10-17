const express = require('express');
const prisma = require('../../prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

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

        // JWT_SECRET is fetched from the environment variables
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.setHeader('X-Authorization', token);  // Changed to X-Authorization

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
