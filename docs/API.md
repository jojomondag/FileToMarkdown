# FileToMarkdown API

## Endpoints
`GET /api/filetypes`
- Gets list of all supported file types
- Returns file extensions

`POST /api/convert`
- Converts uploaded file to markdown
- Input: File via form-data with field name `file`
- Returns: Converted markdown content
- Automatically cleans up after conversion

## Quick Start

Start the API server:
```bash
npm run start:api
```

## Detailed Documentation

### 1. List Supported File Types
```
GET /api/filetypes
```

Returns list of supported file types.

**Response Example:**
```json
{
  "fileTypes": ["pdf", "txt", "docx", "pptx", "xlsx", "7z", "zip"]
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