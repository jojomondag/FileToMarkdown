# FileToMarkdown CLI Commands

[← Back to Main Documentation](../Readme.md)

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
The viewer works entirely in the browser.

1. **Open viewer.html directly in your browser** 
   - Requires Chrome 86+, Edge 86+, or Opera 72+ for full functionality
   - Drag & drop files onto the sidebar
   - Select folders via the dropzone
   - Uses the File System Access API for saving changes directly to files

For browsers that don't support the File System Access API, files can still be viewed but saving will only update the content in memory.

### 5. List File Types
```bash
filetomarkdown-filetypes
```
Shows all supported file types and their descriptions.

### 6. Start API Server
```bash
filetomarkdown-server
```
Starts the API server for programmatic access to conversion functionality:
- Runs on port 3000 by default
- Provides REST API endpoints for file conversions
- Enables programmatic access from other applications

Options:
- `--port <number>`: Specify a custom port
- `--static-path <path>`: Specify a custom path for static files

For detailed API documentation and examples, see [API Documentation](API.md). 

---

[← Back to Main Documentation](../Readme.md) 