const path = require('path');
const fs = require('fs').promises;

const rootRouteHtml = `
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
            .external {
                background-color: #fff8e1;
                border-radius: 4px;
                padding: 1rem;
                margin-top: 1rem;
                border-left: 4px solid #ffc107;
            }
        </style>
    </head>
    <body>
        <h1>FileToMarkdown API</h1>
        <div class="info">
            <p>Available endpoints:</p>
            <ul>
                <li><code>GET /api/filetypes</code> - List supported file types</li>
                <li><code>POST /api/convert</code> - Convert file to markdown</li>
                <li><code>GET /health</code> - Health check</li>
            </ul>
        </div>
        <div class="external">
            <h3>External Renderer Service</h3>
            <p>The markdown renderer has been moved to an external service.</p>
            <p>Please use: <code>http://localhost:3000</code></p>
        </div>
    </body>
</html>
`;

function registerRoutes(app, api, upload) {
    // Root route
    app.get('/', (_req, res) => {
        res.send(rootRouteHtml);
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
            // Return information about the external renderer service
            res.json({ 
                html: '<div><h1>Renderer Service Moved</h1><p>The markdown renderer has been moved to an external service. Please use the service at <a href="http://localhost:3000">http://localhost:3000</a></p></div>', 
                status: 200,
                message: 'Renderer has been moved to an external service at http://localhost:3000'
            });
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
            // Ensure temp file is deleted even on error
            if (req.file && req.file.path) {
                await fs.unlink(req.file.path).catch(unlinkError => {
                    console.error('Failed to delete temp file after error:', unlinkError);
                });
            }
            console.error('Convert error:', error);
            res.status(500).json({ error: error.message, status: 500 });
        }
    });

    // Health check endpoint
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok' });
    });
}

module.exports = { registerRoutes }; 