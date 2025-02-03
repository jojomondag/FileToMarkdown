# FileToMarkdown API Usage

## Installation

### NPM
```bash
npm install filetomarkdown
```

### Browser Setup

Include the browser bundle in your HTML:
```html
<script src="node_modules/filetomarkdown/dist/filetomarkdown.browser.js"></script>
```

Then initialize the client:
```javascript
const client = new FileToMarkdown.FileToMarkdownClient('http://localhost:3000');
```

## Starting the Server

Start the server using the CLI command:
```bash
npx filetomarkdown-server
```

This will start a server with the following configuration:
- Port: 3000 (default)
- CORS: Enabled for all origins
- Endpoints:
  - GET  /api/filetypes - List supported file types
  - POST /api/render    - Render markdown to HTML
  - POST /api/convert   - Convert file to markdown
  - GET  /health       - Server health check

## API Reference

### `client.convertFile(file)`
Convert a file to markdown
- Input: File object from input or drag & drop
- Returns: Promise<{ markdown: string, status: number }>
```javascript
const { markdown } = await client.convertFile(file);
```

### `client.renderMarkdown(content)`
Render markdown to HTML with syntax highlighting
- Input: Markdown string
- Returns: Promise<{ html: string, status: number }>
```javascript
const { html } = await client.renderMarkdown(markdown);
```

### `client.getSupportedTypes()`
Get list of supported file types
- Returns: Promise<{ fileTypes: string[], descriptions: Object, status: number }>
```javascript
const { fileTypes, descriptions } = await client.getSupportedTypes();
```

## Complete Example

Here's a simple example showing how to use the package:

### HTML
```html
<!DOCTYPE html>
<html>
<head>
    <title>File to Markdown</title>
    <style>
        #output {
            border: 1px solid #ccc;
            padding: 10px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <input type="file" id="fileInput">
    <div id="output"></div>
    
    <script src="node_modules/filetomarkdown/dist/filetomarkdown.browser.js"></script>
    <script>
        const client = new FileToMarkdown.FileToMarkdownClient('http://localhost:3000');
        const output = document.getElementById('output');

        document.getElementById('fileInput').addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                try {
                    const { markdown } = await client.convertFile(e.target.files[0]);
                    const { html } = await client.renderMarkdown(markdown);
                    output.innerHTML = html;
                } catch (error) {
                    output.textContent = 'Error: ' + error.message;
                }
            }
        });
    </script>
</body>
</html>
```

For supported file types and features, see [Converters Documentation](CONVERTERS.md). 