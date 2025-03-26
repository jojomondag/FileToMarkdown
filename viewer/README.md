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
- 🔒 Secure local file access with File System Access API
- 🔄 Server fallback for older browsers

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14+)
- Modern browser with [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) support (Chrome, Edge, Opera) for the best experience

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

3. Click on the drop zone to open files:
   - In supported browsers, the File System Access API will be used, allowing direct access to local files
   - In other browsers, a traditional file input will be used as a fallback

4. Edit files using the "Edit" button and save changes with the "Save" button or Ctrl+S

## How it Works

The application uses a dual approach for file handling:

### Modern Browsers (Chrome, Edge, Opera)
- Uses the File System Access API to directly read and write files on your system
- Requests permission to access files when you select them
- Maintains file handles for continued access
- Provides a more native experience with direct file access

### Fallback for Other Browsers
- Uses the traditional approach of uploading files to the server
- Server handles file operations and sends changes back to the browser
- WebSockets keep files in sync when they change on disk

## Technical Details

The application uses:

- Express.js for the server
- WebSockets for real-time file updates
- Chokidar for file system monitoring
- Browser File System Access API for file handling
- Progressive enhancement for broad browser support

## Keyboard Shortcuts

- `Ctrl+B` or `Cmd+B`: Toggle sidebar
- `Ctrl+S` or `Cmd+S`: Save current file (when in edit mode)

## Browser Compatibility

- Full functionality (with File System Access API): Chrome 86+, Edge 86+, Opera 72+
- Basic functionality (server-based): Firefox, Safari, and older browsers

## License

MIT 