const IncomingSocketMsgModel = require('./IncomingSocketMsgModel');
const OutSocketMsgModel = require('./OutSocketMsgModel');
const prisma = require('../prisma/client'); // Make sure to import the Prisma client

class MyWebSocketBehavior {
    constructor(io) {
        this.io = io;
        this.clients = new Map();
    }

    async onMessage(socket, data) {
        try {
            // Parse and validate the incoming message using the IncomingSocketMsgModel
            const incomingMsg = new IncomingSocketMsgModel(
                data.Action || "",
                data.MerchantName || "",
                data.Key || "",
                data.PosName || "",
                data.Msg || ""
            );

            // Check if action is provided and process accordingly
            if (!incomingMsg.action) {
                const errorResponse = new OutSocketMsgModel("error", true, "Invalid action");
                socket.emit('message', JSON.stringify(errorResponse));
                socket.disconnect();
                return;
            }

            const action = incomingMsg.action.toLowerCase().trim();

            if (action === 'login') {
                await this.handleLogin(socket, incomingMsg);
            } else if (action === 'ping') {
                this.handlePing(socket, incomingMsg);
            } else {
                const errorResponse = new OutSocketMsgModel("error", true, "Invalid action");
                socket.emit('message', JSON.stringify(errorResponse));
                socket.disconnect();
            }
        } catch (error) {
            console.error("Error handling message:", error);
            const errorResponse = new OutSocketMsgModel("error", true, "Error processing message");
            socket.emit('message', JSON.stringify(errorResponse));
        }
    }

    // Login handler using Prisma to search for a POS entry
    async handleLogin(socket, result) {
        if (!result.merchantName || !result.key || !result.posName || !result.msg) {
            const errorResponse = new OutSocketMsgModel("login", false, "Invalid login data");
            socket.emit('message', JSON.stringify(errorResponse));
            socket.disconnect();
            return;
        }

        try {
            const posRecord = await prisma.postbl.findFirst({
                where: {
                    MerchantId: result.merchantName,
                    ApiKey: result.key,
                    PosName: result.posName,
                }
            });

            if (!posRecord) {
                const errorResponse = new OutSocketMsgModel("login", false, "No matching POS record found");
                socket.emit('message', JSON.stringify(errorResponse));
                socket.disconnect();
                return;
            }

            // If the POS record is found, you can perform additional checks here if needed
            const successResponse = new OutSocketMsgModel("login", true, "Login successful", [], []);
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

    onClose(socket) {
        console.log(`Socket disconnected: ${socket.id}`);
    }
}

module.exports = MyWebSocketBehavior;
