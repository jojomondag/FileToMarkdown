# FileToMarkdown

Node.js utility that converts files into Markdown. This tool supports conversion of:
- PDF files
- Word documents (docx)
- PowerPoint presentations (pptx)
- Excel spreadsheets (xlsx)
- Text files
- Code files
- ZIP and 7ZIP archives

## Installation

For CLI usage, install globally:
```bash
npm install -g filetomarkdown
```

For programmatic usage in your project:
```bash
npm install filetomarkdown
```

## Running Tests

You can run tests in two ways:

1. If you have the package installed globally:
```bash
filetomarkdown-test
```

2. Without installation (using npx):
```bash
npx filetomarkdown-test
```

This will create a project structure in your current directory:
```
src/
├── viewer.html            # Markdown viewer (open in browser)
├── exampleFiles/          # Original files
│   ├── code/             # Code examples
│   └── [example files]   # Other example files
└── outputAfterConversion/ # All converted markdown files
    ├── code/             # Converted code files
    └── [converted files] # Other converted files
```

To view the converted files:
1. Navigate to the `src/` directory
2. Open `viewer.html` in your browser
3. Select a markdown file from the dropdown to view it

## CLI Usage

You can use FileToMarkdown directly from the command line:

```bash
filetomarkdown-convert <input-file> [output-file]
```

### How to use:
```bash
# Basic usage - converts file in current directory
filetomarkdown-convert "documents/example.xlsx"

# Convert with custom output path
filetomarkdown-convert "documents/report.pdf" "output/report.md"

# Convert files from different folders
filetomarkdown-convert "downloads/presentation.pptx"
filetomarkdown-convert "projects/source_code.py"
filetomarkdown-convert "desktop/archive.zip"
```

The converted markdown file will be created in the same directory as the input file unless an output path is specified. For example:
- Input: `documents/yearly-plan.xlsx`
- Default output: `documents/yearly-plan.md`

## Example Files

You can find example files and their converted markdown outputs in our GitHub repository:
- Example Files: [github.com/jojomondag/FileToMarkdown/tree/main/src/exampleFiles](https://github.com/jojomondag/FileToMarkdown/tree/main/src/exampleFiles)
- Converted Examples: [github.com/jojomondag/FileToMarkdown/tree/main/src/exampleFiles/outputAfterConversion](https://github.com/jojomondag/FileToMarkdown/tree/main/src/exampleFiles/outputAfterConversion)

## Supported File Types
- PDF (.pdf)
- Word Documents (.docx)
- PowerPoint Presentations (.pptx)
- Excel Spreadsheets (.xlsx)
- Text Files (.txt)
- Source Code Files (various extensions)
- ZIP Archives (.zip)
- 7ZIP Archives (.7z)
