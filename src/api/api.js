const express = require('express');
const cors = require('cors');
const { getSupportedTypes } = require('../index');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// API endpoint to get supported file types
app.get('/api/filetypes', (req, res) => {
  try {
    const supportedTypes = getSupportedTypes();
    res.json({
      fileTypes: Object.keys(supportedTypes),
      version: require('../../package.json').version
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});

module.exports = app; 