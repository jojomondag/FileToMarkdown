#!/usr/bin/env node

// Use the src/server.js directly instead of the dist version
const path = require('path');
const fs = require('fs');

console.log('\n🔔 IMPORTANT: This command only starts the API server.\n');

// Check if we should use the development version (src) or the built version (dist)
const srcServerPath = path.join(__dirname, '../src/server.js');
const distServerPath = path.join(__dirname, '../dist/server.js');

let serverModule;
if (fs.existsSync(srcServerPath)) {
    console.log('Using development server from src/server.js');
    serverModule = require('../src/server');
} else if (fs.existsSync(distServerPath)) {
    console.log('Using built server from dist/server.js');
    serverModule = require('../dist/server');
} else {
    console.error('Error: Could not find server.js in either src or dist directory');
    process.exit(1);
}

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
        i++;
    }
}

// Create and start server
const server = serverModule.createServer(options);
server.start()
    .then(() => {
        // Server started successfully
    })
    .catch(err => {
        console.error('Failed to start server:', err);
        process.exit(1);
    }); 