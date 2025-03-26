const express = require('express');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const http = require('http');
const WebSocket = require('ws');

// Create Express app
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Get port from environment variable or use default
const PORT = process.env.PORT || 9877;

// File changes store to track modifications
const fileChanges = new Map();

/**
 * Configuration for the server
 */
const CONFIG = {
    staticDir: __dirname,
    apiEndpoints: {
        file: '/api/file'
    },
    headers: {
        cors: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        },
        javascript: {
            'Content-Type': 'application/javascript'
        }
    }
};

// Serve static files
app.use(express.static(CONFIG.staticDir));
app.use(express.json());

// Enable CORS for File System API support
app.use((req, res, next) => {
    Object.entries(CONFIG.headers.cors).forEach(([header, value]) => {
        res.header(header, value);
    });
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// Root route to serve the viewer.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(CONFIG.staticDir, 'viewer.html'));
});

// Route for bundle.js
app.get('/src/bundle.js', (req, res) => {
    res.sendFile(path.join(CONFIG.staticDir, 'src', 'bundle.js'), {
        headers: CONFIG.headers.javascript
    });
});

/**
 * API endpoint to get file content
 * This serves as a fallback when the File System API is not available or fails
 */
app.get(CONFIG.apiEndpoints.file, (req, res) => {
    const filePath = req.query.path;
    
    if (!filePath) {
        return res.status(400).json({ error: 'No file path provided' });
    }
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.json({ content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * API endpoint to save file content
 * This serves as a fallback when the File System API is not available or fails
 */
app.post(CONFIG.apiEndpoints.file, (req, res) => {
    const { path: filePath, content } = req.body;
    
    if (!filePath || content === undefined) {
        return res.status(400).json({ error: 'File path and content are required' });
    }
    
    try {
        // Mark this file as being edited by the web app to prevent watcher loops
        fileChanges.set(filePath, true);
        
        fs.writeFileSync(filePath, content, 'utf8');
        
        // Release the mark after a short delay
        setTimeout(() => {
            fileChanges.delete(filePath);
        }, 500);
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * WebSocket server for file watching
 * This complements the File System API which doesn't have built-in file watching
 */
wss.on('connection', (ws) => {
    console.log('Client connected');
    let watcher = null;
    
    // Send initial message to confirm connection
    ws.send(JSON.stringify({ type: 'connection', status: 'connected' }));
    
    // Handle messages from client
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'watch' && data.paths && data.paths.length > 0) {
                // Close any existing watcher before creating a new one
                if (watcher) {
                    watcher.close();
                }
                watcher = setupFileWatcher(data.paths, ws);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
    
    ws.on('close', () => {
        console.log('Client disconnected');
        // Ensure we clean up the watcher when client disconnects
        if (watcher) {
            watcher.close();
            watcher = null;
        }
    });
});

/**
 * Set up file watcher for the specified file paths
 * @param {Array<string>} filePaths - Paths to watch
 * @param {WebSocket} ws - WebSocket connection
 * @returns {chokidar.FSWatcher} The watcher instance
 */
function setupFileWatcher(filePaths, ws) {
    // Initialize watcher
    const watcher = chokidar.watch(filePaths, {
        persistent: true,
        ignoreInitial: true
    });
    
    // Handle file changes
    watcher.on('change', (filePath) => {
        // Skip if the file was just modified by the web app
        if (fileChanges.has(filePath)) {
            return;
        }
        
        try {
            // Read the updated file content
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Send update to client
            ws.send(JSON.stringify({
                type: 'fileChange',
                path: filePath,
                content
            }));
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
        }
    });
    
    return watcher;
}

// Start server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Supports dual mode: File System API (modern browsers) + Server API (fallback)`);
}); 