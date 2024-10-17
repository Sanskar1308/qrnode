const express = require("express");
const http = require("http"); // To create a server for Express and Socket.IO
const { Server } = require("socket.io"); // Import Socket.IO
const prisma = require('./prisma/client');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer'); // For file uploads
const jwt = require('jsonwebtoken'); // For JWT authentication
require('dotenv').config();

// Import your controllers
const userController = require('./src/Controller/userController');
const POSOperationController = require('./src/Controller/POSOperationController');
const campaignController = require('./src/Controller/campaignController');
const DashboardController = require('./src/Controller/DashboardController');
const campaigninfoController = require('./src/Controller/campaigninfoController');
const audioController = require('./src/Controller/audioController');

// Import the SendToDeviceController
const SendToDeviceController = require('./src/SendToDeviceController');

// Repositories (assuming they are available)
const campaignInfoRepository = require('./src/Repositories/campaignInfoRepository');
const posRepository = require('./src/Repositories/posRepository');
const campaignRepository = require('./src/Repositories/campaignRepository');
const audioRepository = require('./src/Repositories/audioRepository');

// WebSocket behavior class
const MyWebSocketBehavior = require('./src/MyWebSocketBehavior'); // Import the WebSocket behavior class
const authmiddleware = require("./src/middleware/auth");

// Create an Express application
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' })); // Allow specific origin or all if not specified

// Set up file upload with multer
const upload = multer({ dest: 'uploads/' });

// JWT authorization middleware (Placeholder)
const jwtAuthorizationFilterFactory = (req, res, next) => {
  // Validate JWT token logic here
  next();
};

// Validation middleware (Placeholder)
const validateModel = (req, res, next) => {
  // Validation logic here
  next();
};

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "*", // Allow all origins or define in environment
    methods: ["GET", "POST"]
  }
});

// Initialize the WebSocket behavior
const myWebSocket = new MyWebSocketBehavior(io);

// Instantiate the SendToDeviceController with repositories and WebSocket behavior
const sendToDeviceController = new SendToDeviceController(
  campaignInfoRepository, 
  campaignRepository, 
  posRepository, 
  audioRepository, 
  myWebSocket
);

// Use your route controllers
app.use('/api/UserOperation', userController);
app.use('/api/POSOperation', POSOperationController);
app.use('/api/CampaignOperation', campaignController);
app.use('/api/Dashboard', DashboardController);
app.use('/api/CampaignInfoOperation', campaigninfoController);
app.use('/api/AudioOperation', audioController);

// Define routes for SendToDevice functionality
app.post('/api/SendToDevice/Campaign', validateModel, authmiddleware, (req, res) => sendToDeviceController.campaign(req, res));
app.post('/api/SendToDevice/Separate', validateModel, jwtAuthorizationFilterFactory, upload.single('file'), (req, res) => sendToDeviceController.separate(req, res));
app.post('/api/SendToDevice/Audio', validateModel, authmiddleware, (req, res) => sendToDeviceController.audio(req, res));

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle messages from the client
  socket.on('message', async (data) => {
    console.log('Received message:', data); // Log the received data (it should already be an object)

    try {
      // Assuming data is already an object, no need to parse it
      // Check if the action is 'login' and handle it
      if (data.Action && data.Action.toLowerCase() === 'login') {
        await myWebSocket.handleLogin(socket, data); // Call handleLogin if the action is 'login'
      } else if (data.Action && data.Action.toLowerCase() === 'ping') {
        await myWebSocket.handlePing(socket, data); // Call handleLogout if the action is 'logout'
      } else {
        // Handle other actions here if needed
        socket.emit('message', JSON.stringify({ msg: 'Unknown action' }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('message', JSON.stringify({ msg: 'Error processing message' }));
    }
  });
  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the main server at port 9500
const startApp = async () => {
  try {
    // Test the database connection
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection successful:', result);

    // Start the server (both Express and WebSocket on the same port)
    const port = process.env.PORT || 9500;
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error starting the app:', error);
    process.exit(1); // Exit if critical error occurs
  }
};

// Graceful shutdown on process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    prisma.$disconnect(); // Disconnect from Prisma
  });
});

startApp();
