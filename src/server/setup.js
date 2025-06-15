const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const api = require('../api/api');
const { registerRoutes } = require('./routes');

function createServer(options = {}) {
    const app = express();
    const PORT = options.port || process.env.PORT || 3000;
    const staticPath = options.staticPath || path.join(__dirname, '..', 'dist');

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
    console.log('CORS Settings:', corsOptions);

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
        res.send(`
            <html>
                <head>
                    <title>FileToMarkdown API</title>
                    <style>
                        body {
                            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 2rem;
                            line-height: 1.6;
                        }
                        h1 { color: #333; }
                        .info {
                            background-color: #e3f2fd;
                            border-radius: 4px;
                            padding: 1rem;
                            margin-top: 1rem;
                        }
                        code {
                            background: #f1f1f1;
                            padding: 2px 4px;
                            border-radius: 3px;
                        }
                    </style>
                </head>
                <body>
                    <h1>FileToMarkdown API</h1>
                    <div class="info">
                        <p>Available endpoints:</p>
                        <ul>
                            <li><code>GET /api/filetypes</code> - List supported file types</li>
                            <li><code>POST /api/render</code> - Render markdown to HTML</li>
                            <li><code>POST /api/convert</code> - Convert file to markdown</li>
                            <li><code>GET /health</code> - Health check</li>
                        </ul>
                    </div>
                </body>
            </html>
        `);
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

    // Register all application routes
    registerRoutes(app, api, upload);

    return {
        app,
        start: () => {
            return new Promise((resolve, reject) => {
                const server = app.listen(PORT, () => {
                    console.log(`\n🚀 API server running on port ${PORT}`);
                    console.log(`👉 Access at: http://localhost:${PORT}`);
                    console.log(`📡 API endpoints:`);
                    console.log(`   GET  /api/filetypes - List supported file types`);
                    console.log(`   POST /api/convert   - Convert file to markdown`);
                    console.log(`   GET  /health       - Server health check\n`);
                    console.log(`ℹ️  The markdown renderer has been moved to: http://localhost:3000\n`);
                    resolve(server);
                }).on('error', (err) => {
                    console.error('❗ Server failed to start:', err);
                    reject(err);
                });
            });
        }
    };
}

// Export the server creator
module.exports = {
    createServer
}; 