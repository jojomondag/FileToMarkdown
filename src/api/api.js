const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const os = require('os');
const { MarkitDown, getFileTypes, getFileTypeDescriptions } = require('../index');
const MarkdownRenderer = require('../renderer/markdown');

const app = express();

// Enhanced error handling
process.on('uncaughtException', (err) => {
    console.error('❗ Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❗ Unhandled Rejection at:', promise, 'Reason:', reason);
});

// Configuration
const PORT = process.env.PORT || 3000;
const staticPath = path.join(__dirname, '..', 'dist');
const viewerPath = path.join(staticPath, 'Viewer', 'viewer.html');

console.log('⚙️  Configuration:');
console.log('Static Path:', staticPath);
console.log('Viewer Path:', viewerPath);

// Verify paths exist
try {
    if (!fsSync.existsSync(viewerPath)) {
        throw new Error(`Missing viewer.html at: ${viewerPath}`);
    }
    console.log('✅ Verified viewer.html exists');
} catch (err) {
    console.error('❌ Path verification failed:', err.message);
    process.exit(1);
}

app.use(cors());
app.use(express.text());

// Serve static files
app.use(express.static(staticPath));
console.log(`🌐 Serving static files from: ${staticPath}`);

// Root route
app.get('/', (_req, res) => {
    console.log('📨 GET / request received');
    try {
        if (!fsSync.existsSync(viewerPath)) {
            throw new Error('viewer.html not found');
        }
        res.sendFile(viewerPath);
        console.log('✅ Sent viewer.html');
    } catch (err) {
        console.error('❌ Failed to send viewer.html:', err);
        res.status(500).send('Server configuration error');
    }
});

// File upload configuration
const upload = multer({
    storage: multer.diskStorage({
        destination: async (_req, _file, cb) => {
            const tempDir = path.join(os.tmpdir(), 'filetomarkdown-uploads');
            try {
                await fs.mkdir(tempDir, { recursive: true });
                console.log(`📂 Created temp directory: ${tempDir}`);
                cb(null, tempDir);
            } catch (err) {
                console.error('❌ Failed to create temp directory:', err);
                cb(err);
            }
        },
        filename: (_req, file, cb) => {
            const filename = `${Date.now()}-${file.originalname}`;
            console.log(`📄 Receiving file: ${filename}`);
            cb(null, filename);
        }
    })
});

// API endpoints
app.get('/api/filetypes', (_req, res) => {
    console.log('📨 GET /api/filetypes');
    try {
        const descriptions = getFileTypeDescriptions();
        res.json({ 
            fileTypes: getFileTypes(), 
            descriptions, 
            status: 200 
        });
    } catch (error) {
        console.error('❌ /api/filetypes error:', error);
        res.status(500).json({ error: error.message, status: 500 });
    }
});

app.post('/api/render', async (req, res) => {
    console.log('📨 POST /api/render');
    try {
        if (!req.body) {
            console.warn('⚠️  No content in render request');
            return res.status(400).json({ error: 'No markdown content provided', status: 400 });
        }
        const renderer = new MarkdownRenderer({ highlight: true, loadLanguages: true });
        const html = renderer.render(req.body);
        res.json({ html, status: 200 });
    } catch (error) {
        console.error('❌ Render error:', error);
        res.status(500).json({ error: error.message, status: 500 });
    }
});

app.post('/api/convert', upload.single('file'), async (req, res) => {
    console.log('📨 POST /api/convert');
    if (!req.file) {
        console.warn('⚠️  No file in convert request');
        return res.status(400).json({ error: 'No file uploaded', status: 400 });
    }

    try {
        console.log(`🔁 Converting file: ${req.file.path}`);
        const markdown = await new MarkitDown().convertToMarkdown(req.file.path);
        await fs.unlink(req.file.path);
        console.log('✅ Conversion successful');
        res.json({ markdown, status: 200 });
    } catch (error) {
        console.error('❌ Conversion failed:', error);
        if (req.file) await fs.unlink(req.file.path).catch(() => {});
        res.status(500).json({ error: error.message, status: 500 });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 API server running on port ${PORT}`);
    console.log(`👉 Access at: http://localhost:${PORT}\n`);
}).on('error', (err) => {
    console.error('❗ Server failed to start:', err);
    process.exit(1);
});

module.exports = app;