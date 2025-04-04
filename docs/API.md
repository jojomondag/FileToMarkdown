# FileToMarkdown API

[← Back to Main Documentation](../Readme.md)

## Quick Start

Start the API server:
```bash
npx filetomarkdown-server  # Runs on http://localhost:3000
```

## Endpoints

### `GET /api/filetypes`
- Gets list of all supported file types and their descriptions
- Returns:
  - `fileTypes`: Array of supported file extensions
  - `descriptions`: Object mapping extensions to human-readable descriptions
  - `status`: HTTP status code
- Error Responses:
  - `500`: Internal server error with error message

### `POST /api/convert`
- Converts uploaded file to markdown
- Input: File via form-data with field name `file`
- Returns:
  - `markdown`: Converted markdown content
  - `status`: HTTP status code
- Error Responses:
  - `400`: No file uploaded
  - `500`: Conversion failed with error message
- Automatically cleans up temporary files after conversion
- Handles all supported file types (use /api/filetypes to see list)

### `POST /api/render`
- Renders markdown content to HTML with syntax highlighting
- Input: Raw markdown content in request body (Content-Type: text/plain)
- Options:
  - `highlight`: Boolean to enable/disable syntax highlighting (default: true)
  - `theme`: Object to customize syntax highlighting colors
- Returns:
  - `html`: Rendered HTML content with syntax highlighting
  - `status`: HTTP status code
- Error Responses:
  - `400`: No markdown content provided
  - `500`: Render failed with error message

### Syntax Highlighting

The `/api/render` endpoint automatically highlights code blocks in your markdown. You can customize the highlighting:

```javascript
{
  "markdown": "your markdown content",
  "options": {
    "highlight": true,  // Enable/disable highlighting
    "theme": {
      "base": {
        "background": "#2d2d2d",
        "color": "#ccc"
      },
      "tokens": {
        "comment": "#999",    // Comments
        "keyword": "#cc99cd", // Language keywords
        "string": "#7ec699",  // String literals
        "function": "#f08d49" // Function names
      }
    }
  }
}
```

**Quick Example:**
```javascript
const markdown = '```javascript\nfunction hello() { return "world"; }\n```';

fetch('http://localhost:3000/api/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        markdown,
        options: { highlight: true }  // Use default theme
    })
})
.then(response => response.json())
.then(data => { document.body.innerHTML = data.html; });
```

The default theme provides syntax highlighting for all common programming languages. Custom themes are optional.

## Static Files
- The server serves static files from the `dist` directory

## Error Handling
- All endpoints include proper error handling
- Errors are returned in JSON format: `{ error: string, status: number }`
- Server logs all errors with detailed information
- Temporary files are cleaned up even if conversion fails

## Detailed Examples

### 1. List Supported File Types
```
GET /api/filetypes
```

Returns list of supported file types with descriptions.

**Response Example:**
```json
{
  "fileTypes": ["pdf", "txt", "docx", "pptx", "xlsx", "7z", "zip", "js", "py"],
  "descriptions": {
    "pdf": "PDF Documents",
    "txt": "Text Files",
    "docx": "Word Documents",
    "js": "JS Source Files",
    "py": "PY Source Files"
  },
  "status": 200
}
```

### 2. Convert File to Markdown
```
POST /api/convert
```

**Simple Usage Example:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:3000/api/convert', {
    method: 'POST',
    body: formData
})
    .then(response => response.json())
    .then(data => console.log(data.markdown))
    .catch(error => console.error('Conversion failed:', error));
```

### 3. Render Markdown to HTML
```
POST /api/render
```

**Simple Usage Example:**
```javascript
const markdown = '# Hello World\nThis is **markdown**';

fetch('http://localhost:3000/api/render', {
    method: 'POST',
    headers: {
        'Content-Type': 'text/plain'
    },
    body: markdown
})
    .then(response => response.json())
    .then(data => {
        document.body.innerHTML = data.html;
    })
    .catch(error => console.error('Render failed:', error));
```

## Complete Example
Here's a complete example that converts a file to markdown and then renders it:

```javascript
// First, convert file to markdown
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:3000/api/convert', {
    method: 'POST',
    body: formData
})
    .then(response => response.json())
    .then(data => {
        // Then render the markdown to HTML
        return fetch('http://localhost:3000/api/render', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: data.markdown
        });
    })
    .then(response => response.json())
    .then(data => {
        // Display the rendered HTML
        document.body.innerHTML = data.html;
    })
    .catch(error => console.error('Operation failed:', error));
```

[← Back to Main Documentation](../Readme.md)