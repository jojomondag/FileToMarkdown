# FileToMarkdown

Convert various file types to Markdown with a single command. Supports documents, code files, and archives with browser and Node.js integration.

## Documentation
- [CLI Commands](docs/COMMANDS.md) - All available commands and usage
- [API Reference](docs/API.md) - REST API endpoints and integration
- [Browser Usage](docs/BROWSER.md) - JavaScript API for browsers
- [Converters](docs/CONVERTERS.md) - Supported file types and features

## Quick Start
```bash
# Install globally
npm install -g filetomarkdown

# Convert a file
filetomarkdown-convert input.pdf output.md

# Or start the API server
npm run start:api
```

## Features
- Convert multiple file types to markdown
- Browser & Node.js support
- API server with REST endpoints
- Markdown viewer with syntax highlighting
- Extensive file type support

## Usage Options

### 1. Command Line
```bash
# Convert a file
filetomarkdown-convert input.pdf output.md

# View supported file types
filetomarkdown-filetypes

# Test the package
filetomarkdown-test --github
```

### 2. Browser
```javascript
// Via CDN
<script src="https://unpkg.com/filetomarkdown/dist/filetomarkdown.browser.js"></script>

// Convert a file
const markdown = await FileToMarkdown.convert(file);
```

### 3. API Server
```bash
# Start server
npm run start:api

# Convert via API
curl -X POST -F "file=@input.pdf" http://localhost:3000/api/convert
```

## Demo Video
<div align="center">
  <a href="https://youtu.be/UkGT3DDPTGI">
    <img src="https://img.youtube.com/vi/UkGT3DDPTGI/mqdefault.jpg" width="320" alt="Demo Video" />
  </a>
</div>