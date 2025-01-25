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

### 5. List File Types
```bash
filetomarkdown-filetypes
```
Shows all supported file types and their descriptions.

## API Server

Start the server:
```bash
npm run start:api  # Runs on http://localhost:3000
```

For detailed API documentation and examples, see [API Documentation](API.md). 