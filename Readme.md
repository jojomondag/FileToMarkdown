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

## Usage Options

```bash
# Install globally
npm install -g filetomarkdown

## Quick Example after installation

# Create and view test files
filetomarkdown-test --github

# Create a standalone viewer (no server required)
filetomarkdown-viewer my-folder
# Then open my-folder/examples/viewer/viewer.html in your browser

# View supported file types
filetomarkdown-filetypes

# Convert a file
filetomarkdown-convert input.pdf output.md
```

## Features

- 📄 Convert various file formats to Markdown
- 👁️ Standalone viewer that works directly in the browser (no server required)
- 🔍 Syntax highlighting for code blocks
- 📂 File and folder structure navigation
- 🔧 Direct file editing using File System Access API
- 🛠️ Command-line tools for batch processing

## Demo Video
<div align="center">
  <a href="https://youtu.be/UkGT3DDPTGI">
    <img src="https://img.youtube.com/vi/UkGT3DDPTGI/mqdefault.jpg" width="320" alt="Demo Video" />
  </a>
</div>