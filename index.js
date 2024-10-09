const express = require("express");
const app = express();
const prisma = require('./prisma/client');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const userController = require('./src/Controller/userController');
const POSOperationConrtroller = require('./src/Controller/POSOperationController');
const campaignController = require('./src/Controller/campaignController');
const DashboardController = require('./src/Controller/DashboardController');

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: '*' })); // Allow all origins for testing purposes

// Use the userController routes
app.use('/api/UserOperation', userController);
app.use('/api/POSOperation', POSOperationConrtroller);
app.use('/api/CampaignOperation', campaignController);
app.use('/api/Dashboard', DashboardController )

// Start the server and check the Prisma client connection
const startApp = async () => {
    try {
        // Test the database connection
        const result = await prisma.$queryRaw`SELECT 1`;
        console.log('Connection successful:', result);

        // Start the Express server
        const port = 3000;
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Error starting the app:', error);
    }
};

startApp();