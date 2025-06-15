# CLI Commands

[← Back to Main Documentation](../Readme.md)

The `filetomarkdown` package provides several command-line tools:

1.  `filetomarkdown` (Main Alias)
2.  `filetomarkdown-convert`
3.  `filetomarkdown-server`
4.  `filetomarkdown-test`
5.  `filetomarkdown-filetypes`

## Command Details

### 1. Convert File (`filetomarkdown` or `filetomarkdown-convert`)

Converts a single file to Markdown.

```bash
filetomarkdown -f <input-path> [-o <output-path>] [-n <output-name>]
# OR
filetomarkdown-convert <input-path> [<output-path>]
```

*   `<input-path>`: Path to the source file.
*   `<output-path>`: (Optional) Path to the output Markdown file. If omitted, outputs to console.
*   `-f, --file`: Specify the input file path (alternative syntax).
*   `-o, --output`: Specify the output file path (alternative syntax).
*   `-n, --name`: Specify the base name for the output file (e.g., `myDoc` results in `myDoc.md`). The directory specified by `-o` must exist.

### 2. Start API Server (`filetomarkdown-server`)

Starts a local API server for file conversions.

```bash
filetomarkdown-server [--port <number>] [--serve-static <path>]
```

*   `--port <number>`: (Optional) Port number for the server (default: 3000).
*   `--serve-static <path>`: (Optional) Serve static files from the specified directory path.

See [API Documentation](API.md) for endpoint details.

### 3. Run Test Conversion (`filetomarkdown-test`)

Downloads example files and runs conversions, useful for testing the installation.

```bash
filetomarkdown-test [--github]
```

*   `--github`: Use example files directly from the GitHub repository.

Creates `examples/exampleFiles` and `examples/outputAfterConversion` directories.

### 4. List Supported Filetypes (`filetomarkdown-filetypes`)

Lists the file extensions supported by the converters.

```bash
filetomarkdown-filetypes
```

---

[← Back to Main Documentation](../Readme.md) 