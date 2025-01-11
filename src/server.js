const express = require('express');
const path = require('path');

const app = express();
const port = 3001;

// Serve static files from src directory
app.use(express.static(path.join(__dirname)));

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'viewer.html'));
});

app.listen(port, () => {
    console.log(`Viewer server running at http://localhost:${port}`);
}); 