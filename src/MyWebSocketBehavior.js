const IncomingSocketMsgModel = require('./IncomingSocketMsgModel');
const OutSocketMsgModel = require('./OutSocketMsgModel');
const prisma = require('../prisma/client'); // Prisma client

class MyWebSocketBehavior {
    constructor(wss, clients) {
        this.wss = wss; // WebSocket Server instance
        this.clients = clients; // Map of clients with their respective connections
    }

    // Function to send data to connected clients (POS devices)
    sendToClients(posResult, data) {
        console.log('Sending data to POS devices:', posResult.data.map(pos => pos.ApiKey));  // Log the ApiKeys
        
        posResult.data.forEach((pos) => {
            // Use pos.ApiKey to match the WebSocket client stored in the clients Map
            const socket = this.clients.get(pos.ApiKey); // Ensure pos.ApiKey matches what was used during connection
            console.log('Socket:', socket);  // Log the socket found in the clients Map
            
            if (socket) {
                console.log(`Sending data to POS device: ${pos.ApiKey}, Data: ${JSON.stringify(data)}`);
                socket.send(JSON.stringify(data));  // Send data to WebSocket client using `send`
            } else {
                console.log(`No WebSocket client found for POS device: ${pos.ApiKey}`);
            }
        });
    }
    
    // Message handler
    async onMessage(socket, data) {
        try {
           console.log('Received message:', data); // Log incoming message
     
           // Parse and validate the incoming message
           const incomingMsg = new IncomingSocketMsgModel(
               data.Action || "",
               data.MerchantName || "",
               data.Key || "",
               data.PosName || "",
               data.Msg || ""
           );
     
           // Log parsed data
           console.log('Parsed incoming message:', incomingMsg);
     
           // Check if action is provided
           if (!incomingMsg.action) {
               console.log('No action provided');
               const errorResponse = new OutSocketMsgModel("error", true, "Invalid action");
               socket.send(JSON.stringify(errorResponse)); // Use `send` to send error response
               socket.close(); // Close the socket connection
               return;
           }
     
           const action = incomingMsg.action.toLowerCase().trim();
     
           if (action === 'login') {
               console.log('Processing login action...');
               await this.handleLogin(socket, incomingMsg);
           } else {
               console.log('Invalid action:', action);
               const errorResponse = new OutSocketMsgModel("error", false, "Invalid action");
               socket.send(JSON.stringify(errorResponse)); // Use `send` to send invalid action error
               socket.close(); // Close the socket connection
           }
        } catch (error) {
           console.error("Error handling message:", error);
           const errorResponse = new OutSocketMsgModel("error", false, "Error processing message");
           socket.send(JSON.stringify(errorResponse)); // Use `send` to send processing error
        }
     }

    // Login handler using Prisma to search for a POS entry
    async handleLogin(socket, result) {
        console.log('Handling login for:', result);
     
        if (!result.merchantName || !result.key || !result.posName || !result.msg) {
           const errorResponse = new OutSocketMsgModel("login", false, "Invalid login data");
           console.log('Invalid login data:', result); // Log invalid data
           socket.send(JSON.stringify(errorResponse)); // Use `send` to send error response
           return;  // No need to close the connection immediately, let the client handle this
        }
     
        try {
           // Query the POS record from the database
           const posRecord = await prisma.postbl.findFirst({
              where: {
                 MerchantId: result.merchantName,
                 ApiKey: result.key,
                 PosName: result.posName,
              }
           });
           console.log('POS Record found:', posRecord); // Log to ensure the record is fetched correctly
     
           // Check if no matching POS record is found
           if (!posRecord) {
              const errorResponse = new OutSocketMsgModel("login", false, "No matching POS record found");
              console.log('No matching POS record found for:', result);
              socket.send(JSON.stringify(errorResponse)); // Use `send` to send error response
              return;
           }
     
           // Success login response
           const successResponse = new OutSocketMsgModel("login", true, "Login successful", [], []);
           console.log('Login successful for:', result);
           socket.send(JSON.stringify(successResponse)); // Use `send` to send success response
     
        } catch (error) {
           console.error("Error querying POS table:", error);
           const errorResponse = new OutSocketMsgModel("login", false, "Error processing login request");
           socket.send(JSON.stringify(errorResponse)); // Use `send` to send processing error
        }
     }

    // Handle Ping
    handlePing(socket, result) {
        const pingResponse = new OutSocketMsgModel("ping", true, "PONG");
        socket.send(JSON.stringify(pingResponse)); // Use `send` to send PONG response
    }

    // Handle new connection (from `index.js`)
    handleConnection(socket) {
        const merchantName = socket.handshake.query.merchantName;
        const posName = socket.handshake.query.posName;

        // Assuming PosId is a unique identifier, e.g., retrieved from your database
        const posId = socket.handshake.query.PosId || `${merchantName}-${posName}`; // Use PosId if available

        // Store the socket in the clients Map
        this.clients.set(posId, socket);
        console.log(`POS device connected: ${posId}`);

        // Handle disconnection
        socket.on('close', () => { // Use `close` instead of `disconnect` for WebSocket
            console.log(`POS device disconnected: ${posId}`);
            this.clients.delete(posId); // Remove from clients Map
        });
    }

    onClose(socket) {
        console.log(`Socket disconnected: ${socket.id}`);
    }
}

module.exports = MyWebSocketBehavior;
