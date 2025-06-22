**[Commands](COMMANDS.md)** • **[API Reference](API.md)** • **[Browser Usage](BROWSER.md)** • **[TypeScript](TYPESCRIPT.md)** • **[File Types](CONVERTERS.md)**
# Supported Converters

FileToMarkdown supports **60+ file formats** across multiple categories:

## Document Converters

### Office Documents
- **PDF** (.pdf) - PDF documents with text extraction and formatting preservation
- **Word** (.docx) - Microsoft Word documents with headings, lists, tables, and links
- **PowerPoint** (.pptx) - Presentations converted to structured markdown sections
- **Excel** (.xlsx) - Spreadsheets converted to markdown tables with multiple sheet support

### LibreOffice Documents  
- **Writer** (.odt) - LibreOffice Writer documents
- **Impress** (.odp) - LibreOffice presentations
- **Calc** (.ods) - LibreOffice spreadsheets

### Text Files
- **Plain Text** (.txt) - Basic text files
- **Markdown** (.md) - Markdown files with standardization and GitHub Flavored Markdown support

## Code File Converters

Supports syntax highlighting for **40+ programming languages**:

### Web Development
- **JavaScript** (.js, .jsx) - With ES6+ syntax support
- **TypeScript** (.ts, .tsx) - Full TypeScript support
- **HTML** (.html, .htm) - Web markup
- **CSS** (.css, .scss, .less) - Stylesheets and preprocessors
- **Vue** (.vue) - Vue.js single file components
- **Svelte** (.svelte) - Svelte components
- **Astro** (.astro) - Astro components

### Backend Languages
- **Python** (.py) - Python scripts and modules
- **Java** (.java) - Java source files
- **C#** (.cs) - C# source files
- **PHP** (.php) - PHP scripts
- **Go** (.go) - Go source files
- **Rust** (.rs) - Rust source files
- **Swift** (.swift) - Swift source files
- **Kotlin** (.kt) - Kotlin source files
- **Scala** (.scala) - Scala source files
- **Dart** (.dart) - Dart source files

### System Languages
- **C/C++** (.c, .cpp, .h, .hpp) - C and C++ source files
- **Ruby** (.rb) - Ruby scripts
- **Perl** (.pl) - Perl scripts
- **Lua** (.lua) - Lua scripts
- **R** (.r) - R statistical scripts
- **MATLAB** (.m) - MATLAB scripts

### Shell & Scripting
- **Bash** (.sh, .bash, .zsh) - Shell scripts
- **PowerShell** (.ps1) - PowerShell scripts  
- **Batch** (.bat, .cmd) - Windows batch files

### Database
- **SQL** (.sql, .pgsql, .mysql) - SQL scripts for various databases

### Configuration & Data
- **JSON** (.json) - JavaScript Object Notation
- **YAML** (.yml, .yaml) - YAML configuration files
- **TOML** (.toml) - TOML configuration files
- **XML** (.xml) - XML markup
- **INI** (.ini, .conf) - Configuration files
- **Docker** (.dockerfile, .docker) - Docker configuration
- **GraphQL** (.graphql, .gql) - GraphQL schemas and queries
- **LaTeX** (.tex) - LaTeX documents

## Archive Converters

- **ZIP** (.zip) - Standard ZIP archives
- **7-Zip** (.7z) - 7-Zip compressed archives

**Archive Features:**
- Extracts and converts contained files
- Creates directory structure in markdown
- Handles nested archives
- Preserves file hierarchy
- Recursively processes supported files within archives

## Conversion Features

### All Converters
- ✅ **Syntax highlighting** using Prism.js
- ✅ **Language detection** for code files
- ✅ **Proper formatting** with fenced code blocks
- ✅ **File structure preservation** for archives
- ✅ **Error handling** with graceful fallbacks

### Document Converters
- ✅ **Table preservation** in Word and Excel files
- ✅ **Heading structure** maintenance
- ✅ **List formatting** preservation
- ✅ **Link extraction** and formatting
- ✅ **Multi-sheet support** for spreadsheets

### Code Converters
- ✅ **Language-specific highlighting** 
- ✅ **Comment preservation**
- ✅ **Indentation maintenance**
- ✅ **Special character handling**

Use `filetomarkdown-filetypes` to see the complete list of supported extensions.

---

[← Back to Main Documentation](../Readme.md) 