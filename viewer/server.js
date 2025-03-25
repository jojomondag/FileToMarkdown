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

// Set port
const PORT = 9876;

// File changes store to track modifications
const fileChanges = new Map();

// Serve static files
app.use(express.static(__dirname));
app.use(express.json());

// Root route to serve the viewer.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'viewer.html'));
});

// Route for bundle.js
app.get('/src/bundle.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'bundle.js'), {
        headers: {
            'Content-Type': 'application/javascript'
        }
    });
});

// API endpoint to get file content
app.get('/api/file', (req, res) => {
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

// API endpoint to save file content
app.post('/api/file', (req, res) => {
    const { path: filePath, content } = req.body;
    
    if (!filePath || content === undefined) {
        return res.status(400).json({ error: 'File path and content are required' });
    }
    
    try {
        // Mark this file as being edited by the web app
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

// Set up WebSocket for real-time updates
wss.on('connection', (ws) => {
    console.log('Client connected');
    
    // Send initial message to confirm connection
    ws.send(JSON.stringify({ type: 'connection', status: 'connected' }));
    
    // Handle messages from client
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'watch' && data.paths && data.paths.length > 0) {
                setupFileWatcher(data.paths, ws);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
    
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Set up file watcher
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
    
    // Handle client disconnection
    ws.on('close', () => {
        watcher.close();
    });
}

// Start server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}); 