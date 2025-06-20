#!/usr/bin/env node

// Use the src/server.js directly instead of the dist version
const path = require('path');
const fs = require('fs');
const express = require('express');

console.log('\n🔔 IMPORTANT: This command only starts the API server.\n');

// Check if we should use the development version (src) or the built version (dist)
const srcServerPath = path.join(__dirname, '../src/server/setup.js');
const distServerPath = path.join(__dirname, '../dist/server/setup.js');

let serverModule;
if (fs.existsSync(srcServerPath)) {
    console.log('Using development server setup from src/server/setup.js');
    serverModule = require('../src/server/setup');
} else if (fs.existsSync(distServerPath)) {
    console.log('Using built server setup from dist/server/setup.js');
    serverModule = require('../dist/server/setup');
} else {
    console.error('Error: Could not find server setup script in either src or dist directory');
    process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
let sourceFilePath = '';
let outputFilePath = '';
let outputFileName = '';
let serveStaticPath = '';

for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if ((arg === '-f' || arg === '--file') && i + 1 < args.length) {
        sourceFilePath = path.resolve(args[i + 1]);
        i++;
    } else if ((arg === '-o' || arg === '--output') && i + 1 < args.length) {
        outputFilePath = path.resolve(args[i + 1]);
        i++;
    } else if ((arg === '-n' || arg === '--name') && i + 1 < args.length) {
        outputFileName = args[i + 1];
        i++;
    } else if (arg === '--serve-static' && i + 1 < args.length) {
        serveStaticPath = path.resolve(args[i + 1]);
        i++;
    } else {
        console.error(`Unknown or incomplete argument: ${arg}`);
        process.exit(1);
    }
}

// Serve static files if path is provided
if (serveStaticPath) {
    if (fs.existsSync(serveStaticPath)) {
        const app = express();
        app.use(express.static(serveStaticPath));
        console.log(`Serving static files from ${serveStaticPath}`);
    } else {
        console.error(`Static file path not found: ${serveStaticPath}`);
        process.exit(1);
    }
}

// Create server options
const options = {
    sourceFilePath,
    outputFilePath,
    outputFileName,
    serveStaticPath
};

// Create and start server
const { createServer } = serverModule;
const server = createServer(options);
server.start()
    .then(() => {
        console.log('✅ Server started successfully');
    })
    .catch(err => {
        console.error('Failed to start server:', err);
        process.exit(1);
    }); 