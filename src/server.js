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

app.use(express.static(path.join(__dirname)));

app.listen(port, () => {
    console.log(`Viewer server running at http://localhost:${port}`);
});