**[Commands](COMMANDS.md)** • **[API Reference](API.md)** • **[Browser Usage](BROWSER.md)** • **[TypeScript](TYPESCRIPT.md)** • **[File Types](CONVERTERS.md)**
# FileToMarkdown API

## Quick Start

Start the API server:
```bash
npx filetomarkdown-server  # Runs on http://localhost:3000
```

## TypeScript Support

FileToMarkdown includes complete TypeScript type definitions for all API responses and client methods. Import types for enhanced development experience:

```typescript
import { FileToMarkdownClient } from 'filetomarkdown';
import type { 
  ConvertResponse, 
  SupportedTypesResponse,
  FileToMarkdownClientOptions 
} from 'filetomarkdown';
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

**JavaScript Example:**
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

**TypeScript Example:**
```typescript
import type { ConvertResponse, SupportedTypesResponse } from 'filetomarkdown';

// Type-safe file conversion
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/convert', {
    method: 'POST',
    body: formData
});

const result: ConvertResponse = await response.json();
console.log(result.markdown);

// Type-safe file types fetching
const typesResponse = await fetch('http://localhost:3000/api/filetypes');
const types: SupportedTypesResponse = await typesResponse.json();
console.log(types.fileTypes);
```

**Using the Built-in Client (Recommended):**
```typescript
import { FileToMarkdownClient } from 'filetomarkdown';
import type { ConvertResponse } from 'filetomarkdown';

const client = new FileToMarkdownClient({ 
    baseURL: 'http://localhost:3000' 
});

// Convert file with full type safety
const result: ConvertResponse = await client.convertFile(file);
console.log(result.markdown);

// Get supported types
const supportedTypes = await client.getSupportedTypes();
console.log(supportedTypes.fileTypes);
```

[← Back to Main Documentation](../Readme.md)