const prisma = require('../prisma/client'); // Make sure to import the Prisma client

class MyWebSocketBehavior {
    constructor(io) {
        this.io = io;
        this.clients = new Map();
    }

    async onMessage(socket, data) {
        try {
            const result = data;
            if (!result || !result.Action) {
                socket.emit('message', JSON.stringify({ success: false, message: 'invalid action' }));
                socket.disconnect();
                return;
            }

            const action = result.Action.toLowerCase().trim();
            if (action === 'login') {
                await this.handleLogin(socket, result);
            } else if (action === 'ping') {
                this.handlePing(socket, result);
            } else {
                socket.emit('message', JSON.stringify({ success: false, message: 'invalid action' }));
                socket.disconnect();
            }
        } catch (error) {
            console.error("Error handling message:", error);
            socket.emit('message', JSON.stringify({ success: false, message: 'Error processing message' }));
        }
    }

    // Login handler using Prisma to search for a POS entry
    async handleLogin(socket, result) {
        // Validate input
        if (!result.MerchantName || !result.Key || !result.PosName || !result.Msg) {
            socket.emit('message', JSON.stringify({ success: false, message: 'invalid login data' }));
            socket.disconnect();
            return;
        }

        try {
            // Query the POS table using Prisma
            const posRecord = await prisma.postbl.findFirst({
                where: {
                    MerchantId: result.MerchantName,
                    ApiKey: result.Key,
                    PosName: result.PosName,
                }
            });

            if (!posRecord) {
                // If no matching record is found
                socket.emit('message', JSON.stringify({ success: false, message: 'No matching POS record found' }));
                socket.disconnect();
                return;
            }

            // If the POS record is found, you can perform additional checks here if needed

            // Emit a successful login response
            socket.emit('message', JSON.stringify({ success: true, message: 'Login successful', posData: posRecord }));

        } catch (error) {
            console.error("Error querying POS table:", error);
            socket.emit('message', JSON.stringify({ success: false, message: 'Error processing login request' }));
        }
    }

    handlePing(socket, result) {
        socket.emit('message', JSON.stringify({ success: true, message: 'PONG' }));
    }

    onClose(socket) {
        // Handle socket disconnection here
        console.log(`Socket disconnected: ${socket.id}`);
    }
}

module.exports = MyWebSocketBehavior;
