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

    async handleLogin(socket, result) {
        // Your login logic goes here
        socket.emit('message', JSON.stringify({ success: true, message: 'Login successful' }));
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
