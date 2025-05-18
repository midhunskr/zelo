// const { Server } = require('socket.io')

// let io;
// const onlineUsers = new Map(); // userId -> socket.id

// function initSocket(server) {
//     io = new Server(server, {
//         path: '/socket.io',
//         cors: {
//             origin: "http://localhost:3003",
//             methods: ["GET", "POST"],
//             credentials: true
//         },
//         transports: ['websocket'],
//     });

//     io.on('connection', (socket) => {
//         console.log('Client connected:', socket.id);

//         // Handle join event with userId
//         socket.on('join', (room, userId) => {
//             socket.join(room);
//             console.log(`${userId} joined room: ${room}`);

//             // Mark user as online
//             onlineUsers.set(userId, socket.id);
//             io.emit('user:online', { userId }); // notify everyone
//         });

//         // Typing indicators (existing)
//         socket.on('typing:start', ({ senderId, receiverId }) => {
//             io.to(`user:${receiverId}`).emit('typing:start', { senderId });
//         });

//         socket.on('typing:stop', ({ senderId, receiverId }) => {
//             io.to(`user:${receiverId}`).emit('typing:stop', { senderId });
//         });

//         // Chat messages (existing)
//         socket.on('chat:message', (data) => {
//             io.to(`user:${data.receiverId}`).emit('message:receive', data);
//             io.to(`user:${data.senderId}`).emit('message:sent', data);
//         });

//         // Disconnect handler
//         socket.on('disconnect', () => {
//             const userId = [...onlineUsers.entries()].find(([_, sid]) => sid === socket.id)?.[0];
//             if (userId) {
//                 onlineUsers.delete(userId);
//                 io.emit('user:offline', { userId, lastSeen: new Date() });
//                 console.log(`${userId} went offline`);
//             }
//         });
//     });

//     return io;
// }

// function getIO() {
//     if (!io) {
//         throw new Error('Socket.IO not initialized');
//     }
//     return io;
// }

// module.exports = { initSocket, getIO };


import { Server } from 'socket.io';

let io;
const onlineUsers = new Map(); // userId -> socket.id

export function initSocket(server) {
    io = new Server(server, {
        path: '/socket.io',
        cors: {
            origin: "http://localhost:3003",
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['websocket'],
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Handle join event with userId
        socket.on('join', (room, userId) => {
            socket.join(room);
            console.log(`${userId} joined room: ${room}`);

            // Mark user as online
            onlineUsers.set(userId, socket.id);
            io.emit('user:online', { userId }); // notify everyone
        });

        // Typing indicators
        socket.on('typing:start', ({ senderId, receiverId }) => {
            io.to(`user:${receiverId}`).emit('typing:start', { senderId });
        });

        socket.on('typing:stop', ({ senderId, receiverId }) => {
            io.to(`user:${receiverId}`).emit('typing:stop', { senderId });
        });

        // Chat messages
        socket.on('chat:message', (data) => {
            io.to(`user:${data.receiverId}`).emit('message:receive', data);
            io.to(`user:${data.senderId}`).emit('message:sent', data);
        });

        // Disconnect handler
        socket.on('disconnect', () => {
            const userId = [...onlineUsers.entries()].find(([_, sid]) => sid === socket.id)?.[0];
            if (userId) {
                onlineUsers.delete(userId);
                io.emit('user:offline', { userId, lastSeen: new Date() });
                console.log(`${userId} went offline`);
            }
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