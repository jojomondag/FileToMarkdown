# FileToMarkdown API Usage

[← Back to Main Documentation](../Readme.md)

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

Then initialize the client. Note that the client usually connects to an API server instance (see [API Documentation](API.md)).
```javascript
const client = new FileToMarkdown.FileToMarkdownClient('http://localhost:3000'); // Default server URL
```

## Standalone Viewer

FileToMarkdown includes a standalone viewer that works directly in your browser without requiring a server. It allows you to open, view, and even edit Markdown files using the File System Access API (in compatible browsers).

To **create** the viewer files, use the `filetomarkdown-viewer` command as described in the [CLI Commands documentation](COMMANDS.md).

Once created (e.g., in `my-directory/examples/viewer/`), simply open the `viewer.html` file in your browser:
```
my-directory/examples/viewer/viewer.html
```

The viewer provides:
- Full markdown rendering with syntax highlighting
- File and folder navigation
- Direct file editing with File System Access API (Chrome, Edge, Opera)
- Drag and drop file loading

## Using the JavaScript Client API

To interact programmatically with the conversion and rendering features (usually via the API server), use the `FileToMarkdownClient`.

### Starting the Server (Required for Client)

The JavaScript client needs to connect to a running `filetomarkdown-server` instance. You can start the server using the command described in the [CLI Commands documentation](COMMANDS.md). By default, it runs on `http://localhost:3000`.

See the [API Documentation](API.md) for details about the server endpoints the client interacts with.

### `client.convertFile(file)`
Convert a file to markdown by sending it to the API server's `/api/convert` endpoint.
- Input: File object from input or drag & drop
- Returns: Promise<{ markdown: string, status: number }>
```javascript
const { markdown } = await client.convertFile(file);
```

### `client.renderMarkdown(content)`
Render markdown string to HTML by sending it to the API server's `/api/render` endpoint.
- Input: Markdown string
- Returns: Promise<{ html: string, status: number }>
```javascript
const { html } = await client.renderMarkdown(markdown);
```

### `client.getSupportedTypes()`
Get the list of supported file types from the API server's `/api/filetypes` endpoint.
- Returns: Promise<{ fileTypes: string[], descriptions: Object, status: number }>
```javascript
const { fileTypes, descriptions } = await client.getSupportedTypes();
```

## Complete Example

Here's a simple example showing how to use the client to convert a file selected by the user and render the result:

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
        // Assumes the API server is running on http://localhost:3000
        const client = new FileToMarkdown.FileToMarkdownClient('http://localhost:3000');
        const output = document.getElementById('output');

        document.getElementById('fileInput').addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                output.textContent = 'Converting...'; // Provide user feedback
                try {
                    // Convert the file via the API server
                    const { markdown } = await client.convertFile(file);
                    // Render the resulting markdown via the API server
                    const { html } = await client.renderMarkdown(markdown);
                    output.innerHTML = html;
                } catch (error) {
                    console.error('Error:', error); // Log error details
                    output.textContent = 'Error: ' + (error.message || 'Conversion/Rendering failed');
                }
            }
        });
    </script>
</body>
</html>
```

For the list of supported file types and conversion features, see [Converters Documentation](CONVERTERS.md). 

---

[← Back to Main Documentation](../Readme.md) 