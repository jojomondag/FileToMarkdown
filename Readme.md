# FileToMarkdown

A powerful Node.js utility that converts files into Markdown. This tool supports conversion of:
- PDF files
- Word documents (docx)
- PowerPoint presentations (pptx)
- Excel spreadsheets (xlsx)
- Text files
- Code files
- ZIP and 7ZIP archives

## Installation

```bash
npm install filetomarkdown
```

## Running Tests

To run the test suite:

```bash
npm run filetomarkdown-test
```

## CLI Usage

You can use FileToMarkdown directly from the command line:

```bash
markitdown-convert <input-file> [output-file]
```

### How to use:
```bash
# Basic usage - converts file in current directory
markitdown-convert "example.xlsx"

# Convert with custom output path
markitdown-convert "documents/report.pdf" "output/report.md"

# Convert files from different folders
markitdown-convert "downloads/presentation.pptx"
markitdown-convert "projects/source_code.py"
markitdown-convert "desktop/archive.zip"
```

The converted markdown file will be created in the same directory as the input file unless an output path is specified. For example:
- Input: `documents/yearly-plan.xlsx`
- Default output: `documents/yearly-plan.md`

## Supported File Types
- PDF (.pdf)
- Word Documents (.docx)
- PowerPoint Presentations (.pptx)
- Excel Spreadsheets (.xlsx)
- Text Files (.txt)
- Source Code Files (various extensions)
- ZIP Archives (.zip)
- 7ZIP Archives (.7z)
