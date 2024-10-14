const express = require("express");
const http = require("http"); // To create a server for Express and Socket.IO
const { Server } = require("socket.io"); // Import Socket.IO
const prisma = require('./prisma/client');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Import your controllers
const userController = require('./src/Controller/userController');
const POSOperationController = require('./src/Controller/POSOperationController');
const campaignController = require('./src/Controller/campaignController');
const DashboardController = require('./src/Controller/DashboardController');
const campaigninfoController = require('./src/Controller/campaigninfoController');
const audioController = require('./src/Controller/audioController');

// WebSocket behavior class
const MyWebSocketBehavior = require('./src/MyWebSocketBehavior'); // Import the WebSocket behavior class

// Create an Express application
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: '*' })); // Allow all origins for testing purposes
app.use(cors({
  origin: 'http://localhost:9501', // Allow requests from Swagger UI hosted at 9501
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

// Use your route controllers
app.use('/api/UserOperation', userController);
app.use('/api/POSOperation', POSOperationController);
app.use('/api/CampaignOperation', campaignController);
app.use('/api/Dashboard', DashboardController);
app.use('/api/CampaignInfoOperation', campaigninfoController);
app.use('/api/AudioOperation', audioController);

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (adjust as needed)
    methods: ["GET", "POST"]
  }
});

// Initialize the WebSocket behavior
const myWebSocket = new MyWebSocketBehavior(io);

// Start the main server at port 9500
const startApp = async () => {
  try {
    // Test the database connection
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('Connection successful:', result);

    // Start the server (both Express and WebSocket on the same port)
    const port = 9500;
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

    // WebSocket events (socket.io)
    io.on("connection", (socket) => {
      console.log(`New client connected: ${socket.id}`);

      // Listen for messages
      socket.on("message", (data) => {
        myWebSocket.onMessage(socket, data);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
        myWebSocket.onClose(socket);
      });
    });

  } catch (error) {
    console.error('Error starting the app:', error);
  }
};

startApp();
