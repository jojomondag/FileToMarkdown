# FileToMarkdown

Convert files to Markdown format. Supports Office documents, PDFs, code files, and archives.

## Quick Start

### Install
```bash
npm install -g filetomarkdown
```

### Convert a file
```bash
filetomarkdown document.pdf output.md
```

## Supported Files

| Type | Formats |
|------|---------|
| **Office** | `.pdf` `.docx` `.pptx` `.xlsx` |
| **LibreOffice** | `.odt` `.ods` `.odp` |
| **Code** | `.js` `.py` `.java` `.cs` `.html` + 60+ more |
| **Archives** | `.zip` `.7z` |
| **Text** | `.txt` `.md` |

## Usage

### Command Line
```bash
# Convert single file
filetomarkdown input.docx output.md

# Start API server
filetomarkdown-server

# Test conversions with example files
filetomarkdown-test

# List supported file types
filetomarkdown-filetypes

# Launch Markdown Viewer (downloads automatically)
filetomarkdown-viewer
```

### Node.js API
```javascript
const { convertToMarkdown } = require('filetomarkdown');

// Convert to string
const markdown = await convertToMarkdown('document.pdf');

// Convert to file
await convertToMarkdown('document.pdf', 'output.md');
```

### Browser
```html
<script src="https://unpkg.com/filetomarkdown"></script>
<script>
  FileToMarkdown.convertFile(file).then(markdown => {
    console.log(markdown);
  });
</script>
```

## Available Commands

After installation, you get these commands:

- **`filetomarkdown`** - Convert files to markdown
- **`filetomarkdown-server`** - Start API server on port 3000  
- **`filetomarkdown-test`** - Run conversion tests with example files
- **`filetomarkdown-filetypes`** - List all supported file formats
- **`filetomarkdown-viewer`** - Launch standalone Markdown Viewer

## Features

- ✅ Preserves formatting (tables, lists, headings)
- ✅ Syntax highlighting for code
- ✅ Archive extraction and conversion
- ✅ CLI and API support
- ✅ Browser compatible
- ✅ 60+ file formats supported

## Markdown Viewer

For viewing and editing the converted markdown files, use our standalone **Markdown Viewer** application:

- 🚀 **Quick Launch**: `filetomarkdown-viewer` (auto-downloads and runs)
- 📱 **Manual Download**: [Download Latest Release](https://github.com/jojomondag/Markdown-Viewer/releases/latest)
- 🎯 **Features**: File browser, live preview, syntax highlighting, and editing capabilities
- 💻 **Platform**: Windows executable (no installation required)
- 🔗 **Repository**: [Markdown-Viewer](https://github.com/jojomondag/Markdown-Viewer)
- 🔄 **Auto-updates**: The viewer command automatically downloads the latest version

**Easiest way**: Just run `filetomarkdown-viewer` after installing the package!

## Examples

### PDF → Markdown
```bash
filetomarkdown report.pdf report.md
```

### Word Document → Markdown
```bash
filetomarkdown presentation.docx presentation.md
```

### ZIP Archive → Multiple Files
```bash
filetomarkdown archive.zip
# Creates markdown files for each supported file in the archive
```

### Start API Server
```bash
filetomarkdown-server
# Server runs on http://localhost:3000
# API endpoints: /api/convert, /api/filetypes, /health
```

## Documentation

- [CLI Commands](docs/COMMANDS.md) - All command options
- [API Reference](docs/API.md) - Complete API guide
- [Browser Usage](docs/BROWSER.md) - Frontend integration
- [File Types](docs/CONVERTERS.md) - Supported formats

## License

MIT