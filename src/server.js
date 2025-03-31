// src/server.js
const express = require('express');
const path = require('path');

function createServer(options = {}) {
    const app = express();
    const port = options.port || process.env.PORT || 3000;
    
    app.get('/', (req, res) => {
        res.send(`
            <html>
                <head>
                    <title>FileToMarkdown API Server</title>
                    <style>
                        body {
                            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 2rem;
                            line-height: 1.6;
                        }
                        h1 { color: #333; }
                        .message {
                            background-color: #f8f9fa;
                            border-left: 4px solid #007bff;
                            padding: 1rem;
                            margin: 1rem 0;
                        }
                        .info {
                            background-color: #e3f2fd;
                            border-radius: 4px;
                            padding: 1rem;
                            margin-top: 2rem;
                        }
                        code {
                            background: #f1f1f1;
                            padding: 2px 4px;
                            border-radius: 3px;
                        }
                    </style>
                </head>
                <body>
                    <h1>FileToMarkdown API Server</h1>
                    <div class="info">
                        <p>API Endpoints:</p>
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
    
    return {
        app,
        start: () => {
            return new Promise((resolve) => {
                const server = app.listen(port, () => {
                    console.log(`FileToMarkdown API server running at http://localhost:${port}`);
                    resolve(server);
                });
            });
        }
    };
}

module.exports = {
    createServer
};

// Only run this if this file is called directly
if (require.main === module) {
    const server = createServer();
    server.start();
}