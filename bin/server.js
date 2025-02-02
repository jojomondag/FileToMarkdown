#!/usr/bin/env node

const createServer = require('../dist/server');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--port' && i + 1 < args.length) {
        options.port = parseInt(args[i + 1], 10);
        i++;
    } else if (arg === '--static-path' && i + 1 < args.length) {
        options.staticPath = args[i + 1];
        i++;
    } else if (arg === '--viewer-path' && i + 1 < args.length) {
        options.viewerPath = args[i + 1];
        i++;
    }
}

// Create and start server
const server = createServer(options);
server.start()
    .then(() => {
        // Server started successfully
    })
    .catch(err => {
        console.error('Failed to start server:', err);
        process.exit(1);
    }); 