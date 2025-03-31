# FileToMarkdown CLI Commands

## Installation
```bash
npm install -g filetomarkdown
```

## Available Commands

### 1. Convert Files
```bash
filetomarkdown-convert <input-file> <output-file>
```
Converts files to markdown format. Output file is optional (defaults to input name with .md).

### 2. Render Markdown
```bash
filetomarkdown-render <input-markdown> <output-html>
```
Renders markdown files to HTML with syntax highlighting.

### 3. Test Package
```bash
filetomarkdown-test --github
```
Tests all converters using example files:
- Downloads fresh examples from GitHub
- Converts the examples to markdown
- Creates a viewer for .md files

### 4. Create Viewer
```bash
filetomarkdown-viewer [target-directory]
```
Creates a standalone viewer application that can:
- Open and display markdown files
- Edit markdown content directly
- Organize files in a folder structure

By default, the viewer is created in an `examples/viewer` directory structure.
Options:
- `--no-examples-structure`: Places viewer files directly in target directory

#### Viewer Usage
The viewer can be used in two ways:

1. **Standalone Mode** - Open the viewer.html file directly in a browser
   - Simple viewing of markdown files
   - Drag & drop files onto the sidebar
   - Limited functionality for file saving

2. **Server Mode (Recommended)** - Run with the server for full functionality
   ```bash
   filetomarkdown-server
   ```
   Then access the viewer at http://localhost:3001/examples/viewer/viewer.html
   
   Server mode provides additional features:
   - Real-time file watching and updates
   - Save files back to disk
   - Better file system integration

### 5. List File Types
```bash
filetomarkdown-filetypes
```
Shows all supported file types and their descriptions.

### 6. Start Server
```bash
filetomarkdown-server [--port 3001]
```
Starts a local server for the viewer application.
Options:
- `--port <number>`: Specify a custom port (default: 3001)
- `--static-path <path>`: Custom static files directory 
- `--viewer-path <path>`: Custom viewer HTML file path

For detailed API documentation and examples, see [API Documentation](API.md). 