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
```

## Usage Options
1. **Command Line** (make sure to navigate to your file's directory in cmd first)
   ```bash
   filetomarkdown-convert "input.pdf" "output.md"
   ```

2. **Create Markdown Viewer**
   ```bash
   # Create viewer in current directory
   npx filetomarkdown-viewer

   # Or specify a target directory
   npx filetomarkdown-viewer /path/to/directory
   ```
   This creates a standalone viewer.html that can open and display markdown files without needing a server.

3. **API Server**
   ```bash
   npm run start:api   # Runs on http://localhost:3000
   ```
<div align="center">
  <a href="https://youtu.be/UkGT3DDPTGI">
    <img src="https://img.youtube.com/vi/UkGT3DDPTGI/mqdefault.jpg" width="320" alt="Demo Video" />
  </a>
</div>