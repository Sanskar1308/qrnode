const IncomingSocketMsgModel = require('./IncomingSocketMsgModel');
const OutSocketMsgModel = require('./OutSocketMsgModel');
const prisma = require('../prisma/client'); // Prisma client

class MyWebSocketBehavior {
    constructor(io, clients) {
        this.io = io;
        this.clients = clients;
    }

    sendToClients(posResult, data) {
        console.log('Sending data to POS devices:', posResult.data.map(pos => pos.ApiKey));  // Log the ApiKeys
        
        posResult.data.map((pos) => {
            // Use pos.ApiKey to match the WebSocket client stored in clients Map
            const socket = this.clients.get(pos.ApiKey); // Ensure pos.ApiKey matches what was used during connection
            console.log('Socket:', socket);  // Log the socket found in the clients Map
            
            if (socket) {
                console.log(`Sending data to POS device: ${pos.ApiKey}, Data: ${JSON.stringify(data)}`);
                socket.emit('message', data);  // Send data to WebSocket client
            } else {
                console.log(`No WebSocket client found for POS device: ${pos.ApiKey}`);
            }
        });
    }
    
    
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
               socket.emit('message', JSON.stringify(errorResponse));
               socket.disconnect();
               return;
           }
     
           const action = incomingMsg.action.toLowerCase().trim();
     
           if (action === 'login') {
               console.log('Processing login action...');
               await this.handleLogin(socket, incomingMsg);
           } else {
               console.log('Invalid action:', action);
               const errorResponse = new OutSocketMsgModel("error", false, "Invalid action");
               socket.emit('message', JSON.stringify(errorResponse));
               socket.disconnect();
           }
        } catch (error) {
           console.error("Error handling message:", error);
           const errorResponse = new OutSocketMsgModel("error", false, "Error processing message");
           socket.emit('message', JSON.stringify(errorResponse));
        }
     }
     

    // Login handler using Prisma to search for a POS entry
    async handleLogin(socket, result) {
        console.log('Handling login for:', result);
     
        if (!result.MerchantName || !result.Key || !result.PosName || !result.Msg) {
           const errorResponse = new OutSocketMsgModel("login", false, "Invalid login data");
           console.log('Invalid login data:', result); // Log invalid data
           socket.emit('message', JSON.stringify(errorResponse));
           return;  // No need to disconnect immediately, let the client handle this
        }
     
        try {
           // Query the POS record from the database
           const posRecord = await prisma.postbl.findFirst({
              where: {
                 MerchantId: result.MerchantName,
                 ApiKey: result.Key,
                 PosName: result.PosName,
              }
           });
           console.log('POS Record found:', posRecord); // Log to ensure the record is fetched correctly

     
           // Check if no matching POS record is found
           if (!posRecord) {
              const errorResponse = new OutSocketMsgModel("login", false, "No matching POS record found");
              console.log('No matching POS record found for:', result);
              socket.emit('message', JSON.stringify(errorResponse));
              return;
           }
     
           // Success login response
           const successResponse = new OutSocketMsgModel("login", true, "Login successful", [], []);
           console.log('Login successful for:', result);
           socket.emit('message', JSON.stringify(successResponse));
     
        } catch (error) {
           console.error("Error querying POS table:", error);
           const errorResponse = new OutSocketMsgModel("login", false, "Error processing login request");
           socket.emit('message', JSON.stringify(errorResponse));
        }
     }
               
    

    handlePing(socket, result) {
        const pingResponse = new OutSocketMsgModel("ping", true, "PONG");
        socket.emit('message', JSON.stringify(pingResponse));
    }

    handleConnection(socket) {
        const merchantName = socket.handshake.query.merchantName;
        const posName = socket.handshake.query.posName;

        // Assuming PosId is a unique identifier, e.g., retrieved from your database
        const posId = socket.handshake.query.PosId || `${merchantName}-${posName}`; // Use PosId if available

        // Store the socket in the clients Map
        this.clients.set(posId, socket);
        console.log(`POS device connected: ${posId}`);

        socket.on('disconnect', () => {
            console.log(`POS device disconnected: ${posId}`);
            this.clients.delete(posId);
        });
    }

    onClose(socket) {
        console.log(`Socket disconnected: ${socket.id}`);
    }
}

module.exports = MyWebSocketBehavior;
