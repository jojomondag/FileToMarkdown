# FileToMarkdown with Two-Way File Sync

This project is a Markdown viewer with two-way file synchronization between the browser and the file system. It allows you to:

1. Open Markdown files from your file system
2. Edit them in the browser
3. Save changes back to the original files
4. Automatically see updates when files are changed outside the browser

## Features

- 🔄 Two-way file synchronization
- 📝 Built-in Markdown editor
- 🔍 Markdown preview
- 📂 File browser
- 🔗 Internal link navigation between files

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14+)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Usage

1. Start the server:

```bash
npm start
```

2. Open your browser at http://localhost:9876

3. Click "Open from Disk" to select Markdown files from your file system

4. Edit files using the "Edit" button and save changes with the "Save" button or Ctrl+S

## Technical Details

The application uses:

- Express.js for the server
- WebSockets for real-time file updates
- Chokidar for file system monitoring
- Browser File System Access API for file handling

## Keyboard Shortcuts

- `Ctrl+B` or `Cmd+B`: Toggle sidebar
- `Ctrl+S` or `Cmd+S`: Save current file (when in edit mode)

## License

MIT 