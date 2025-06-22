**[Commands](docs/COMMANDS.md)** • **[API Reference](docs/API.md)** • **[Browser Usage](docs/BROWSER.md)** • **[TypeScript](docs/TYPESCRIPT.md)** • **[File Types](docs/CONVERTERS.md)**
# FileToMarkdown

Convert files to Markdown format with **full TypeScript support**. Supports Office documents, PDFs, code files, and archives.

## Quick Start

### Install
```bash
npm install -g filetomarkdown
```

## Usage

### Command Line
```bash
# Test conversions with example files
filetomarkdown-test

# Convert single file
filetomarkdown input.docx output.md

# Start API server
filetomarkdown-server

# List supported file types
filetomarkdown-filetypes

# Download and launch Markdown Viewer (auto-installs)
filetomarkdown-viewer
```

### Node.js API

#### JavaScript
```javascript
const { convertToMarkdown } = require('filetomarkdown');

// Convert to string
const markdown = await convertToMarkdown('document.pdf');

// Convert to file
await convertToMarkdown('document.pdf', 'output.md');
```

#### TypeScript
```typescript
import { MarkitDown, convertToMarkdown } from 'filetomarkdown';
import type { MarkitDownOptions } from 'filetomarkdown';

// Using the class with options
const options: MarkitDownOptions = { collapsible: true };
const converter = new MarkitDown(options);
const markdown: string = await converter.convertToMarkdown('document.pdf');

// Using the convenience function
const result: string = await convertToMarkdown('document.pdf', 'output.md');
```

### Browser (API Client)
```html
<script src="https://unpkg.com/filetomarkdown"></script>
<script>
  // Create client instance (requires filetomarkdown-server running)
  const client = new FileToMarkdown.FileToMarkdownClient();
  client.baseURL = 'http://localhost:3000';
  
  // Convert file via API
  client.convertFile(file).then(result => {
    console.log(result.markdown);
  });
</script>
```

## TypeScript Support

FileToMarkdown includes complete TypeScript type definitions for enhanced development experience:

```typescript
// All major interfaces are fully typed
import { 
  MarkitDown, 
  convertToMarkdown, 
  getFileTypes,
  FileToMarkdownClient 
} from 'filetomarkdown';
import type { 
  MarkitDownOptions, 
  ConvertResponse,
  FileTypeDescriptions 
} from 'filetomarkdown';

// Type-safe file operations
const fileTypes: string[] = getFileTypes();
const descriptions: FileTypeDescriptions = getFileTypeDescriptions();

// Server API with full typing
const client = new FileToMarkdownClient({ baseURL: 'http://localhost:3000' });
const response: ConvertResponse = await client.convertFile(file);
```

### Benefits
- 🎯 **IntelliSense Support** - Complete autocomplete in VS Code, WebStorm, etc.
- 🛡️ **Type Safety** - Catch errors at compile time
- 📚 **Rich Documentation** - JSDoc comments in IDE tooltips
- 🏢 **Enterprise Ready** - Professional TypeScript integration

## Available Commands

After installation, you get these commands:

- **`filetomarkdown`** - Convert files to markdown
- **`filetomarkdown-server`** - Start API server on port 3000  
- **`filetomarkdown-test`** - Run conversion tests with example files
- **`filetomarkdown-filetypes`** - List all supported file formats
- **`filetomarkdown-viewer`** - Download and launch standalone Markdown Viewer

## Features

- ✅ **TypeScript Support** - Full type definitions for enhanced development experience
- ✅ Preserves formatting (tables, lists, headings)
- ✅ Syntax highlighting for code
- ✅ Archive extraction and conversion
- ✅ CLI and API support
- ✅ Browser compatible
- ✅ 60+ file formats supported

## Markdown Viewer

For viewing and editing the converted markdown files, use our standalone **Markdown Viewer** application:

- 🚀 **Quick Install & Launch**: `filetomarkdown-viewer` (auto-downloads and runs)
- 📱 **Manual Download**: [Download Latest Release](https://github.com/jojomondag/Markdown-Viewer/releases/latest)
- 🎯 **Features**: File browser, live preview, syntax highlighting, and editing capabilities
- 💻 **Platform**: Windows executable (no installation required)
- 🔗 **Repository**: [Markdown-Viewer](https://github.com/jojomondag/Markdown-Viewer)
- 🔄 **Auto-updates**: The viewer command automatically downloads the latest version

**Easiest way**: Just run `filetomarkdown-viewer` after installing the package - it installs and launches automatically!

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

## License

MIT