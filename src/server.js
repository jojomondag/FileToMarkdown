// src/server.js
const express = require('express');
const path = require('path');
const api = require('./api/api');

function createServer(options = {}) {
    return api.createServer(options);
}

module.exports = {
    createServer
};

const app = express();
const port = 3001;

// First, serve from the project root to find 'viewer' directory where test-conversion.js places files
app.use(express.static(path.join(process.cwd())));

// Then serve from src directory as fallback
app.use(express.static(path.join(__dirname)));

// Route for the root, redirecting to viewer.html
app.get('/', (req, res) => {
    res.redirect('/examples/viewer/viewer.html');
});

app.listen(port, () => {
    console.log(`Viewer server running at http://localhost:${port}`);
    console.log(`Access viewer at: http://localhost:${port}/examples/viewer/viewer.html`);
});