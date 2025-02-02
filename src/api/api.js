const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const os = require('os');
const { MarkitDown, getFileTypes, getFileTypeDescriptions } = require('../index');
const MarkdownRenderer = require('../renderer/markdown');

// Direct API methods for programmatic use
const api = {
    /**
     * Convert a file to markdown
     * @param {string|Buffer} file - File path or buffer to convert
     * @returns {Promise<string>} Markdown content
     */
    async convertToMarkdown(file) {
        const converter = new MarkitDown();
        return converter.convertToMarkdown(file);
    },

    /**
     * Render markdown to HTML
     * @param {string} markdown - Markdown content to render
     * @returns {string} HTML content
     */
    renderMarkdown(markdown) {
        const renderer = new MarkdownRenderer({ highlight: true, loadLanguages: true });
        return renderer.render(markdown);
    },

    /**
     * Get supported file types
     * @returns {Object} Supported file types and their descriptions
     */
    getFileTypes() {
        return {
            fileTypes: getFileTypes(),
            descriptions: getFileTypeDescriptions()
        };
    }
};

function createServer(options = {}) {
    const app = express();
    const PORT = options.port || process.env.PORT || 3000;
    const staticPath = options.staticPath || path.join(__dirname, '..', 'dist');
    const viewerPath = options.viewerPath || path.join(staticPath, 'Viewer', 'viewer.html');

    // Default CORS configuration for cross-origin API access
    const corsOptions = options.cors || {
        origin: options.allowedOrigins || '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 86400
    };

    // Enhanced error handling
    process.on('uncaughtException', (err) => {
        console.error('❗ Uncaught Exception:', err);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('❗ Unhandled Rejection at:', promise, 'Reason:', reason);
    });

    // Configuration
    console.log('⚙️  Configuration:');
    console.log('Static Path:', staticPath);
    console.log('Viewer Path:', viewerPath);
    console.log('CORS Settings:', corsOptions);

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

    // Apply CORS middleware
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.text());

    // Serve static files with CORS headers
    app.use(express.static(staticPath, {
        setHeaders: (res) => {
            res.set('Access-Control-Allow-Origin', corsOptions.origin);
        }
    }));
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
        }),
        limits: {
            fileSize: options.maxFileSize || 50 * 1024 * 1024 // 50MB default limit
        }
    });

    // API endpoints
    app.get('/api/filetypes', (_req, res) => {
        try {
            const result = api.getFileTypes();
            res.json({ ...result, status: 200 });
        } catch (error) {
            res.status(500).json({ error: error.message, status: 500 });
        }
    });

    app.post('/api/render', async (req, res) => {
        try {
            const markdown = req.body;
            if (!markdown || (typeof markdown !== 'string' && !(markdown instanceof Buffer))) {
                return res.status(400).json({ error: 'No markdown content provided', status: 400 });
            }

            console.log('Rendering markdown:', markdown.slice(0, 100) + '...');
            const html = api.renderMarkdown(markdown.toString());
            
            if (!html) {
                throw new Error('Failed to generate HTML output');
            }

            res.json({ html, status: 200 });
        } catch (error) {
            console.error('Render error:', error);
            res.status(500).json({ error: error.message, status: 500 });
        }
    });

    app.post('/api/convert', upload.single('file'), async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded', status: 400 });
        }

        try {
            const markdown = await api.convertToMarkdown(req.file.path);
            await fs.unlink(req.file.path);
            res.json({ markdown, status: 200 });
        } catch (error) {
            if (req.file) await fs.unlink(req.file.path).catch(() => {});
            res.status(500).json({ error: error.message, status: 500 });
        }
    });

    // Health check endpoint
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok' });
    });

    return {
        app,
        start: () => {
            return new Promise((resolve, reject) => {
                const server = app.listen(PORT, () => {
                    console.log(`\n🚀 API server running on port ${PORT}`);
                    console.log(`👉 Access at: http://localhost:${PORT}`);
                    console.log(`📡 API endpoints:`);
                    console.log(`   GET  /api/filetypes - List supported file types`);
                    console.log(`   POST /api/render    - Render markdown to HTML`);
                    console.log(`   POST /api/convert   - Convert file to markdown`);
                    console.log(`   GET  /health       - Server health check\n`);
                    resolve(server);
                }).on('error', (err) => {
                    console.error('❗ Server failed to start:', err);
                    reject(err);
                });
            });
        }
    };
}

// Export both the API methods and server creator
module.exports = {
    ...api,
    createServer
};