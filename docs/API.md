**[Commands](COMMANDS.md)** • **[API Reference](API.md)** • **[Browser Usage](BROWSER.md)** • **[File Types](CONVERTERS.md)**
# FileToMarkdown API

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

[← Back to Main Documentation](../Readme.md)