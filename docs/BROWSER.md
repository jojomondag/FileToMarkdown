# FileToMarkdown API Usage

## Installation

### NPM
```bash
npm install filetomarkdown
```

### Client Setup

```javascript
import { FileToMarkdownClient } from 'filetomarkdown/client';

// Initialize client (defaults to window.location.origin if in browser)
const client = new FileToMarkdownClient('http://localhost:3000');
```

## Starting the Server

You can start the API server programmatically or using the CLI:

```javascript
// Programmatic server start
const { createServer } = require('filetomarkdown/api');

const server = createServer({
    port: 3000, // optional, defaults to 3000
    cors: {     // optional CORS configuration
        origin: '*',
        methods: ['GET', 'POST']
    }
});

server.start();
```

Or using CLI:
```bash
npx filetomarkdown-server
```

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

## Examples

### Basic Conversion
```javascript
const fileInput = document.querySelector('input[type="file"]');
const client = new FileToMarkdownClient();

fileInput.addEventListener('change', async (e) => {
    try {
        const { markdown } = await client.convertFile(e.target.files[0]);
        console.log(markdown);
    } catch (error) {
        console.error('Conversion failed:', error);
    }
});
```

### Convert and Render
```javascript
const fileInput = document.querySelector('input[type="file"]');
const output = document.querySelector('#output');
const client = new FileToMarkdownClient();

fileInput.addEventListener('change', async (e) => {
    try {
        const { markdown } = await client.convertFile(e.target.files[0]);
        const { html } = await client.renderMarkdown(markdown);
        output.innerHTML = html;
    } catch (error) {
        console.error('Operation failed:', error);
    }
});
```

For supported file types and features, see [Converters Documentation](CONVERTERS.md). 