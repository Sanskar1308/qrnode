const express = require("express");
const http = require("http");
const WebSocket = require("ws"); // Native WebSocket
const prisma = require('./prisma/client');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer'); // For file uploads
const jwt = require('jsonwebtoken'); // JWT for authentication
const path = require('path');
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

// Repositories
const campaignInfoRepository = require('./src/Repositories/campaignInfoRepository');
const posRepository = require('./src/Repositories/posRepository');
const campaignRepository = require('./src/Repositories/campaignRepository');
const audioRepository = require('./src/Repositories/audioRepository');

// WebSocket behavior class
const MyWebSocketBehavior = require('./src/MyWebSocketBehavior');
const authmiddleware = require("./src/middleware/auth");

// Create an Express application
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Serve static files from /opt/qrnode/infoimage
app.use('/images', express.static('/opt/qrnode/infoimage'));
app.use('/audios', express.static('/opt/qrnode/audiodata'));


// Set up file upload with multer
const upload = multer({ dest: 'uploads/' });

// JWT authorization middleware
const jwtAuthorizationFilterFactory = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token missing from Authorization header' });
  }

  // Verify the JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Set the userId from the decoded token for further use in the request
    req.userId = decoded.userId;
    next();
  });
};

// Validation middleware (Example)
const validateModel = (req, res, next) => {
  const { body } = req;
  console.log(body)
  if (!body || body.CampaignId <= 0  || body.AudioId <= 0) {
    console.log("invalid body")
    return res.status(400).json({ message: 'Invalid CampaignId' });
  }

  if (!body.MerchantName || body.MerchantName.trim() === "") {
    return res.status(400).json({ message: 'MerchantName is required' });
  }
  
  next();
};

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Initialize WebSocket server (Native WebSocket)
const wss = new WebSocket.Server({ server });

// const clients = new Map();

// Initialize the WebSocket behavior
const myWebSocket = new MyWebSocketBehavior(wss);

// Instantiate the SendToDeviceController with repositories and WebSocket behavior
const sendToDeviceController = new SendToDeviceController(
  campaignInfoRepository, 
  campaignRepository, 
  posRepository, 
  audioRepository, 
  myWebSocket // Pass the WebSocket behavior instance here
);

// Use your route controllers
app.use('/api/UserOperation', userController);
app.use('/api/POSOperation', POSOperationController);
app.use('/api/CampaignOperation', campaignController);
app.use('/api/Dashboard', DashboardController);
app.use('/api/CampaignInfoOperation', campaigninfoController);
app.use('/api/AudioOperation', audioController);

// Define routes for SendToDevice functionality (Preserved as per request)
app.post('/api/SendToDevice/Campaign', validateModel, authmiddleware, (req, res) => sendToDeviceController.campaign(req, res));
app.post('/api/SendToDevice/Separate', validateModel, jwtAuthorizationFilterFactory, upload.single('file'), (req, res) => sendToDeviceController.separate(req, res));
app.post('/api/SendToDevice/Audio', validateModel, authmiddleware, (req, res) => sendToDeviceController.audio(req, res));

// WebSocket connection handler
wss.on('connection', (socket, req) => {
  // const apiKey = req.url.split('?apiKey=')[1]; // Extract the API key from the URL
  
  // if (apiKey) {
    try {
      myWebSocket.handleConnection(socket); // Pass to the WebSocket handler
  } catch (error) {
      console.error('Error processing connection:', error);
      socket.send(JSON.stringify({ msg: 'Error processing connection' }));
  }
  
    // clients.set(apiKey, socket);  // Store the WebSocket connection
  // } else {
  //   console.log('No ApiKey provided, client not stored');
  // }

  // Handle incoming messages from the WebSocket
  socket.on('message', async (data) => {
    console.log('Received message:', data);
    
    try {
      const parsedData = JSON.parse(data); // Ensure it's valid JSON
      await myWebSocket.onMessage(socket, parsedData); // Pass to the WebSocket handler
    } catch (error) {
      console.error('Error processing message:', error);
      socket.send(JSON.stringify({ msg: 'Error processing message' }));
    }
  });

  // Handle WebSocket disconnection
  socket.on('close', () => {
    myWebSocket.onClose(socket); // Pass merchantName and posName on close
  });
});

// Start the main server at port 9500
const startApp = async () => {
  try {
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection successful:', result);

    const port = process.env.PORT || 9500;
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error starting the app:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    prisma.$disconnect();
  });
});

startApp();
