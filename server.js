// const http = require('http')
// const next = require('next')
// const { initSocket } = require('./lib/socket')

// // Development configuration
// const dev = process.env.NODE_ENV !== 'production'

// // Initialize Next.js (it will run on port 3000 by default)
// const app = next({ dev })
// const handle = app.getRequestHandler()

// app.prepare().then(() => {
//     const server = http.createServer((req, res) => {
//         // Handle Next.js requests
//         handle(req, res)
//     })

//     // Initialize Socket.IO using the module
//     initSocket(server)

//     // Start the server
//     server.listen(3003, (err) => {
//         if (err) throw err
//         console.log('> Ready on http://localhost:3003')
//     })
// })


import http from 'http';
import next from 'next';
import { initSocket } from './lib/socket.js';

// Development configuration
const dev = process.env.NODE_ENV !== 'production';

// Initialize Next.js (it will run on port 3000 by default)
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = http.createServer((req, res) => {
        // Handle Next.js requests
        handle(req, res);
    });

    // Initialize Socket.IO using the module
    initSocket(server);

    // Start the server
    server.listen(3003, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3003');
    });
});