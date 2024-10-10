const express = require("express");
const prisma = require('./prisma/client');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const userController = require('./src/Controller/userController');
const POSOperationController = require('./src/Controller/POSOperationController');
const campaignController = require('./src/Controller/campaignController');
const DashboardController = require('./src/Controller/DashboardController');
const campaigninfoController = require('./src/Controller/campaigninfoController');
const audioController = require('./src/Controller/audioController');

// Middleware
const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: '*' })); // Allow all origins for testing purposes
app.use(cors({
  origin: 'http://localhost:9501', // Allow requests from Swagger UI hosted at 9501
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow credentials if necessary
}));

// Use the userController routes
app.use('/api/UserOperation', userController);
app.use('/api/POSOperation', POSOperationController);
app.use('/api/CampaignOperation', campaignController);
app.use('/api/Dashboard', DashboardController);
app.use('/api/CampaignInfoOperation', campaigninfoController);
app.use('/api/AudioOperation', audioController)

// Start the main server at port 9500
const startApp = async () => {
  try {
    // Test the database connection
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('Connection successful:', result);

    // Start the Express server
    const port = 9500;
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error starting the app:', error);
  }
};

startApp();
