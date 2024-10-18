const IncomingSocketMsgModel = require('./IncomingSocketMsgModel');
const OutSocketMsgModel = require('./OutSocketMsgModel');
const prisma = require('../prisma/client'); // Prisma client

class MyWebSocketBehavior {
    constructor(wss) {
        this.wss = wss; // WebSocket Server instance
        this.clients = new Map(); // Map of clients with their respective connections
    }

    // Function to send data to connected clients (POS devices)
    sendToClients(posResult, data) {
        console.log('Sending data to POS devices:', posResult.data.map(pos => pos.ApiKey));  // Log the ApiKeys

        posResult.data.forEach((pos) => {
            const clientKey = `${pos.MerchantId}-${pos.Id}`; // Adjust to use MerchantId and PosName
            const socket = this.clients.get(clientKey);  // Retrieve the socket using the unique key

            console.log('Socket:', socket);  // Log the socket found in the clients Map

            if (socket) {
                console.log(`Sending data to POS device: ${clientKey}, Data: ${JSON.stringify(data)}`);
                socket.send(JSON.stringify(data));  // Send data to WebSocket client using `send`
            } else {
                console.log(`No WebSocket client found for POS device: ${clientKey}`);
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

            const clientKey = `${incomingMsg.merchantName}-${incomingMsg.posName}`; // Store clientKey for future use

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
                await this.handleLogin(socket, incomingMsg, clientKey); // Pass clientKey to login
            } else if (action === 'ping') {
                console.log('Processing ping action...');
                this.handlePing(socket);
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

    handlePing(socket) {
        const pingResponse = new OutSocketMsgModel("ping", true, "PONG");
        console.log('Ping successful');
        socket.send(JSON.stringify(pingResponse)); // Use `send` to send PONG response
    }

    // Login handler using Prisma to search for a POS entry
    async handleLogin(socket, result, clientKey) {
        console.log('Handling login for:', result);

        try {
            // Query the POS record from the database
            const posRecord = await prisma.postbl.findFirst({
                where: {
                    MerchantId: result.merchantName,
                    ApiKey: result.key,
                    Id: result.posName,
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

            // Store the socket with the unique clientKey
            this.clients.set(clientKey, socket);
            console.log(`POS device connected: ${clientKey}`);

            // Success login response
            const successResponse = new OutSocketMsgModel("login", true, "Login successful", [], []);
            socket.send(JSON.stringify(successResponse)); // Use `send` to send success response
        } catch (error) {
            console.error("Error querying POS table:", error);
            const errorResponse = new OutSocketMsgModel("login", false, "Error processing login request");
            socket.send(JSON.stringify(errorResponse)); // Use `send` to send processing error
        }
    }

    // Handle new connection
    handleConnection(socket) {
        console.log('-------------------------------Client connected----------------------------------');

        // Handle disconnection and clean up
        socket.on('close', () => {
            console.log(`Socket disconnected`);
            const clientKey = Array.from(this.clients.keys()).find(key => this.clients.get(key) === socket);
            this.onClose(socket, clientKey); // Pass the clientKey to the onClose method
        });
    }

    onClose(socket, clientKey) {
        console.log(`Socket disconnected for client: ${clientKey}`);
        if (this.clients.has(clientKey)) {
            this.clients.delete(clientKey); // Remove the client from the map
            console.log(`Client ${clientKey} removed from map.`);
        } else {
            console.log(`Client ${clientKey} was not found in the map.`);
        }
    }
}

module.exports = MyWebSocketBehavior;
