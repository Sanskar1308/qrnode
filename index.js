const express = require("express");
const app = express();
const prisma = require('./prisma/client');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerDocument = require('./swagger-output.json');

const userController = require('./src/Controller/userController');
const POSOperationConrtroller = require('./src/Controller/POSOperationController');
const campaignController = require('./src/Controller/campaignController');

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: '*' })); // Allow all origins for testing purposes

// Swagger definition options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Campaign API',
      version: '1.0.0',
      description: 'API documentation for Campaign Operations',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
    ],
  },
  apis: ['./src/Controller/*.js'], // Points to your API route files
};

// Initialize swagger-jsdoc and generate Swagger docs dynamically
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve the Swagger docs via Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api-docs1', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Use the userController routes
app.use('/api/UserOperation', userController);
app.use('/api/POSOperation', POSOperationConrtroller);
app.use('/api/CampaignOperation', campaignController);

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
            console.log(`Swagger docs are available at http://localhost:${port}/api-docs`);
        });
    } catch (error) {
        console.error('Error starting the app:', error);
    }
};

startApp();
