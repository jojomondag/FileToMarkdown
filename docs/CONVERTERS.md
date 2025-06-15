# Supported Converters

[← Back to Main Documentation](../Readme.md)

## Document Converters
- **PDF** (.pdf)
  - Converts PDF documents to markdown
  - Preserves text content and basic formatting
  - Maintains document structure
  
- **Word** (.docx)
  - Converts Microsoft Word documents
  - Supports headings, lists, and basic formatting
  - Preserves tables and links
  
- **PowerPoint** (.pptx)
  - Converts presentations to markdown
  - Each slide becomes a section
  - Maintains slide titles and content structure
  
- **Excel** (.xlsx)
  - Converts spreadsheets to markdown tables
  - Preserves cell formatting and alignment
  - Supports multiple sheets

- **Markdown** (.md)
  - Converts between markdown formats
  - Standardizes markdown syntax
  - Preserves formatting and structure
  - Supports GitHub Flavored Markdown

## Code Converters

Supports common programming languages:

*   JavaScript (`.js`, `.jsx`, `.ts`, `.tsx`)
*   Python (`.py`)
*   Java (`.java`)
*   C# (`.cs`)
*   HTML (`.html`, `.htm`)
*   CSS (`.css`)
*   ...and potentially others detected by `highlight.js`.

**Features:**

*   Syntax highlighting using `highlight.js`.
*   Outputs code within a fenced code block with the detected language tag.
*   Line numbering (optional, if supported by renderer).

## Archive Converters
- **ZIP** (.zip)
- **7-Zip** (.7z)
  - Extracts and converts contained files
  - Creates a directory structure in markdown
  - Handles nested archives
  - Preserves file hierarchy 

---

[← Back to Main Documentation](../Readme.md) 