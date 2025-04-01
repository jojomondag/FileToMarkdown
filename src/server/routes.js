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
            const { markdown, options = {} } = req.body;
            if (!markdown || (typeof markdown !== 'string' && !(markdown instanceof Buffer))) {
                return res.status(400).json({ error: 'No markdown content provided', status: 400 });
            }

            console.log('Rendering markdown:', String(markdown).slice(0, 100) + '...');
            const html = api.renderMarkdown(String(markdown), options);
            
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