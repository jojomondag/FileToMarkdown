# FileToMarkdown

Convert various file types to Markdown with a single command.

## Documentation
- [API Documentation](docs/API.md) - REST API endpoints and usage for server integration
- [Browser Usage](docs/BROWSER.md) - JavaScript API for browser-side file conversion
- [Supported Converters](docs/CONVERTERS.md) - Detailed information about file format converters and their capabilities

## Supported Formats
- Documents: PDF, DOCX, PPTX, XLSX, TXT
- Code: JS (JSX), TS (TSX), PY, JAVA, CS, HTML, CPP, C, GO, SQL, PHP, SWIFT, CSS, RUBY,
        RUST, KOTLIN, LUA, MATLAB, SHELL, VUE, SVELTE
- Archives: ZIP, 7Z

## Quick Test
```bash
# Install
  npm install filetomarkdown

# Try example conversions
npx filetomarkdown-test --github

# Convert a file
filetomarkdown-convert "document.pdf"
```

## Usage Options
1. **Command Line**
   ```bash
   filetomarkdown-convert "input.pdf" "output.md"
   ```

2. **API Server**
   ```bash
   npm run start:api   # Runs on http://localhost:3000
   ```
<div align="center">
  <a href="https://youtu.be/UkGT3DDPTGI">
    <img src="https://img.youtube.com/vi/UkGT3DDPTGI/mqdefault.jpg" width="320" alt="Demo Video" />
  </a>
</div>