# FileToMarkdown Browser Usage

## Features
`FileToMarkdown.fileTypes`
- Get list of supported file types
- Returns array of extensions (e.g., ['pdf', 'txt', 'docx', ...])

`FileToMarkdown.convert(file)`
- Convert a file to markdown
- Input: File object from input or drag & drop
- Returns: Promise with markdown content

## Quick Setup

### CDN (Simplest)
```html
<script src="https://unpkg.com/filetomarkdown/dist/markitdown.js"></script>
```

### NPM
```bash
npm install filetomarkdown
```

## Usage Examples

### Basic Example
```javascript
// Check supported files
console.log(FileToMarkdown.fileTypes);  // ['pdf', 'txt', 'docx', ...]

// Convert a file
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    try {
        const markdown = await FileToMarkdown.convert(file);
        console.log(markdown);
    } catch (error) {
        console.error('Conversion failed:', error);
    }
});
```

### Import with NPM
```javascript
import FileToMarkdown from 'filetomarkdown';

// Use same methods as CDN version
console.log(FileToMarkdown.fileTypes);
```

For complete implementation examples, see our [example HTML files](../test.html). 