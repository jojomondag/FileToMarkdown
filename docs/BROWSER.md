# FileToMarkdown Browser Usage

## Installation

### CDN (Recommended)
```html
<script src="https://unpkg.com/filetomarkdown/dist/filetomarkdown.browser.js"></script>
```

### NPM
```bash
npm install filetomarkdown
```

```javascript
import FileToMarkdown from 'filetomarkdown';
```

## API Reference

### `FileToMarkdown.fileTypes`
Array of supported file extensions
```javascript
console.log(FileToMarkdown.fileTypes);  // ['pdf', 'txt', 'docx', ...]
```

### `FileToMarkdown.convert(file)`
Convert a file to markdown
- Input: File object from input or drag & drop
- Returns: Promise<string> with markdown content
```javascript
const markdown = await FileToMarkdown.convert(file);
```

### `FileToMarkdown.render(markdown)`
Render markdown to HTML with syntax highlighting
- Input: Markdown string
- Returns: Promise<string> with HTML content
```javascript
const html = await FileToMarkdown.render(markdown);
```

## Examples

### Basic Conversion
```javascript
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
    try {
        const markdown = await FileToMarkdown.convert(e.target.files[0]);
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

fileInput.addEventListener('change', async (e) => {
    try {
        const markdown = await FileToMarkdown.convert(e.target.files[0]);
        const html = await FileToMarkdown.render(markdown);
        output.innerHTML = html;
    } catch (error) {
        console.error('Operation failed:', error);
    }
});
```

For supported file types and features, see [Converters Documentation](CONVERTERS.md). 