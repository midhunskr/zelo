import { Server } from 'socket.io';

let io;

export function initSocket(server) {
    io = new Server(server, {
        path: '/socket.io',
        cors: {
            origin: "http://localhost:3003",
            methods: ["GET", "POST"],
            credentials: true,
            transports: ['websocket', 'polling']
        },
        allowEIO3: true,
        pingTimeout: 60000,
        pingInterval: 25000,
        connectTimeout: 45000,
        maxHttpBufferSize: 1e8
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Handle joining user's personal room
        socket.on('join', (room) => {
            socket.join(room);
            console.log(`Client ${socket.id} joined room: ${room}`);
        });

        // Handle chat messages
        socket.on('chat:message', (data) => {
            console.log('Chat message received:', data);

            // Send to the receiver's room
            io.to(`user:${data.receiverId}`).emit('message', {
                ...data,
                isSender: false,
                timestamp: new Date().toISOString()
            });

            // Send to sender's room as confirmation
            io.to(`user:${data.senderId}`).emit('message', {
                ...data,
                isSender: true,
                timestamp: new Date().toISOString()
            });
            console.log(`Sending message to rooms user:${data.senderId} and user:${data.receiverId}`)
        });

        // Handle friend request notifications
        socket.on('friend:invitation', (data) => {
            console.log('Friend invitation received:', data);
            if (data && data.receiverId) {
                io.to(`user:${data.receiverId}`).emit('FRIEND_REQUEST', {
                    type: 'FRIEND_REQUEST',
                    data
                });
            } else {
                console.error('Invalid friend invitation data received:', data);
            }
        });

        // Typing indicators
        socket.on('typing:start', (data) => {
            console.log(`User ${data.senderId} typing to ${data.receiverId}`);
            io.to(`user:${data.receiverId}`).emit('typing:start', {
                senderId: data.senderId
            });
        });

        socket.on('typing:stop', (data) => {
            console.log(`User ${data.senderId} stopped typing to ${data.receiverId}`);
            io.to(`user:${data.receiverId}`).emit('typing:stop', {
                senderId: data.senderId
            });
        });

        socket.on('disconnect', (reason) => {
            console.log('Client disconnected:', socket.id, 'Reason:', reason);
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        // Send a welcome message to confirm connection
        socket.emit('message', {
            content: 'Welcome to the chat!',
            senderId: 'system',
            senderName: 'System',
            timestamp: new Date().toISOString(),
        });
    });

    return io;
}

export function getIO() {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
} 