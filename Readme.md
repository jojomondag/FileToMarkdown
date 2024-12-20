# FileToMarkdown

A Node.js utility that converts various file types to Markdown:
- PDF, Word (docx), PowerPoint (pptx), Excel (xlsx)
- Text and code files
- ZIP/7ZIP archives

## Install

```bash
npm install -g filetomarkdown
```

## Usage

Basic command format:
```bash
filetomarkdown-convert <input-file> [output-file]
```

Examples:
```bash
# Convert a PDF file (creates report.md in same folder)
filetomarkdown-convert "documents/report.pdf"

# Convert Excel file with custom output location
filetomarkdown-convert "data/budget.xlsx" "converted/budget.md"

# Convert from any location
filetomarkdown-convert "/full/path/to/presentation.pptx"
```

## Try the Converter

Want to see how different file types are converted? Run our test command to try it with example files:

```bash
npx filetomarkdown-test --github
```

This will:
1. Create a `src` folder in your current directory
2. Download example files from our GitHub repository
3. Convert them to markdown automatically

The created folder structure:
```
src/
├── exampleFiles/           # Original test files
│   ├── code/              # Sample code files (.js, .py, etc)
│   ├── documents/         # Sample documents (PDF, DOCX, etc)
│   └── archives/          # Sample ZIP/7Z files
│
├── outputAfterConversion/ # Converted markdown files
│   └── code/             # Converted code examples
│
└── viewer.html           # Web-based markdown viewer
```

To view the results:
1. Navigate to the `src` folder
2. Open `viewer.html` in your web browser
3. Browse through the converted files in the viewer