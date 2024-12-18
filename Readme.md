# MarkItDown.js

MarkItDown.js is a Node.js-based utility package that converts various file formats into Markdown (.md) format. Designed for simplicity and versatility, it allows developers to effortlessly extract content from common file types and standardize it in Markdown for easier consumption.

## Features

Wide File Format Support:

- Plain Text (.txt)
- PDF (.pdf)
- Word Documents (.docx)
- Excel Spreadsheets (.xlsx)
- PowerPoint Presentations (.pptx)
- Images (EXIF metadata and OCR)
- Audio Files (Metadata and transcription if supported libraries are available)
- HTML (including special handling for Wikipedia and structured web pages)
- ZIP Archives (Recursively processes and converts contained files)

## Installation

```bash
npm install markit
```

## Usage

```javascript
const MarkItDown = require('markit');

// Convert a text file to Markdown
const converter = new MarkItDown();
converter.convertToMarkdown('path/to/file.txt')
  .then(markdown => {
    console.log(markdown);
  })
  .catch(err => {
    console.error('Conversion failed:', err);
  });
```

### Text Conversion Features

The text to markdown converter supports:

- Automatic heading detection using underlining (=== and ---)
- List conversion (both ordered and unordered)
- Code block detection (4+ spaces or tab indentation)
- Paragraph preservation
- Basic formatting cleanup

Example input:
```text
Title
=====
Subtitle
--------

* List item
* Another item

    Code block
    More code
```

Will be converted to:
```markdown
# Title
## Subtitle

- List item
- Another item

```
Code block
More code
```
```

[Rest of README remains the same...]