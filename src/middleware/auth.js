const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify JWT
const authmiddleware = (req, res, next) => {
    const token = req.headers['x-authorization']; // Get token from 'x-authorization'

    if (!token) {
        console.log('No token provided');
        return res.status(403).json({
            isresponse: false,
            responsestatus: "FAIL",
            errorcode: "TOKEN_MISSING",
            suberrorcode: 403,
            errormsg: "No token provided."
        });
    }

    // Verify the token using secret from .env
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Token verification failed:', err); // Log the error if token verification fails
            return res.status(401).json({
                isresponse: false,
                responsestatus: "FAIL",
                errorcode: "TOKEN_INVALID",
                suberrorcode: 401,
                errormsg: "Failed to authenticate token."
            });
        }

        // Store userId from token in request object for further use
        req.userId = decoded.userId;
        next(); // Continue to next middleware or route handler
    });
};

module.exports = authmiddleware;
