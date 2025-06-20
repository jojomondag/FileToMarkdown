**[Commands](COMMANDS.md)** • **[API Reference](API.md)** • **[Browser Usage](BROWSER.md)** • **[File Types](CONVERTERS.md)**
# CLI Commands

The `filetomarkdown` package provides these command-line tools:

1. `filetomarkdown` - Main conversion command
2. `filetomarkdown-server` - API server
3. `filetomarkdown-test` - Test conversion suite
4. `filetomarkdown-filetypes` - List supported formats
5. `filetomarkdown-viewer` - Launch Markdown Viewer

## Command Details

### 1. Convert File (`filetomarkdown`)

Converts a single file to Markdown.

```bash
filetomarkdown <input-file> [output-file]
```

**Examples:**
```bash
# Convert to same directory with .md extension
filetomarkdown document.pdf

# Convert to specific output file
filetomarkdown document.docx output.md

# Convert with paths
filetomarkdown ./src/code.py ./docs/code.md
```

**Supported formats:** PDF, DOCX, PPTX, XLSX, TXT, ZIP, 7Z, and 60+ code file types.

### 2. Start API Server (`filetomarkdown-server`)

Starts a local API server for file conversions.

```bash
filetomarkdown-server
```

**Features:**
- Runs on `http://localhost:3000`
- API endpoints: `/api/convert`, `/api/filetypes`, `/health`
- CORS enabled for cross-origin requests
- Serves static files

See [API Documentation](API.md) for endpoint details.

### 3. Run Test Conversion (`filetomarkdown-test`)

Downloads example files and runs conversions to test the installation.

```bash
filetomarkdown-test
```

**What it does:**
- Processes example files of all supported types
- Creates `examples/exampleFiles` and `examples/outputAfterConversion` directories
- Shows success/failure status for each conversion
- Displays file sizes and processing results

### 4. List Supported Filetypes (`filetomarkdown-filetypes`)

Lists all file extensions supported by the converters.

```bash
filetomarkdown-filetypes
```

**Output:** Shows 60+ supported file formats including:
- Office documents (PDF, DOCX, PPTX, XLSX)
- LibreOffice files (ODT, ODS, ODP)
- Code files (JS, TS, PY, JAVA, CS, HTML, etc.)
- Archive formats (ZIP, 7Z)
- Configuration files (JSON, YAML, TOML, etc.)

### 5. Launch Markdown Viewer (`filetomarkdown-viewer`)

Downloads and launches the standalone Markdown Viewer application.

```bash
filetomarkdown-viewer [options]
```

**Options:**
- `-h, --help` - Show help message
- `-u, --update` - Force update/re-download the viewer
- `--version` - Check version and launch viewer

**Features:**
- Auto-downloads from GitHub releases
- Caches viewer locally (`~/.filetomarkdown/`)
- Automatically checks for updates
- Launches Windows executable

---

[← Back to Main Documentation](../Readme.md) 