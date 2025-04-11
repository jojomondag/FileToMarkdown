# FileToMarkdown

Convert Files to Markdown. Supports Office documents, code files, and Ziparchives in the browser or as CLI Node.js integration.

## Documentation

FileToMarkdown comes with comprehensive documentation:

| Document | Description |
|----------|-------------|
| [CLI Commands](docs/COMMANDS.md) | All available commands and usage |
| [API Reference](docs/API.md) | REST API endpoints and integration |
| [Browser Usage](docs/BROWSER.md) | JavaScript API for browsers |
| [Converters](docs/CONVERTERS.md) | Supported file types and features |

## Features

*   🚀 Converts various file types to Markdown
*   📄 Supports PDF, DOCX, PPTX, XLSX, ZIP, 7z
*   💻 Converts common code files with syntax highlighting (JS, Python, Java, C#, HTML)
*   ⚙️ Simple CLI interface
*   🔧 API for programmatic use
*   📦 Bundled for both Node.js and browser environments

## Demo Video
<div align="center">
  <a href="https://youtu.be/UkGT3DDPTGI">
    <img src="https://img.youtube.com/vi/UkGT3DDPTGI/mqdefault.jpg" width="320" alt="Demo Video" />
  </a>
</div>

## Installation

```bash
npm install -g filetomarkdown
```

## Usage

### CLI

```bash
# Convert a single file
filetomarkdown -f path/to/your/file.pdf -o path/to/output.md

# Convert and specify output name (directory must exist)
filetomarkdown -f path/to/your/file.docx -o output/dir -n myDocument

# Start the conversion API server
filetomarkdown-server --port 8080

# Start the conversion API server and serve static files from a directory
filetomarkdown-server --port 8080 --serve-static ./public_html
```

See [CLI Commands](docs/COMMANDS.md) for more details.

### API

```javascript
const { convertToMarkdown } = require('filetomarkdown');

async function convert() {
  try {
    const markdown = await convertToMarkdown('path/to/your/file.pptx');
    console.log(markdown);
    // Or save to a file:
    // await convertToMarkdown('path/to/your/file.pptx', 'output/path/file.md');
  } catch (error) {
    console.error('Conversion failed:', error);
  }
}

convert();
```

See [API Documentation](docs/API.md) for details.

## Supported Formats

See [Supported Formats & Converters](docs/CONVERTERS.md).

## Browser Usage

See [Browser Usage Guide](docs/BROWSER.md).

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

## License

MIT