# FileToMarkdown Viewer

A lightweight markdown viewer that works directly in the browser using the File System Access API.

## Features

- Open and edit markdown files directly from your computer
- Modern file access using the File System Access API
- Directory navigation with folder structure
- Syntax highlighting for code blocks
- Responsive design for all screen sizes
- Dark/light theme support

## Browser Compatibility

The viewer requires browsers that support the File System Access API:
For other browsers, files can be loaded using drag and drop or file input, but direct saving to disk is not supported.

## Usage

Simply open the `viewer.html` file in a compatible browser. You can:

1. Click on the dropzone to select folders with markdown files
2. Drag and drop markdown files or folders onto the viewer
3. Edit files directly in the editor
4. Save changes back to disk (in supported browsers)

## File System Access

The viewer uses the File System Access API to enable direct file editing:

- For browsers that support it, you can directly open and save files back to disk
- For browsers that don't support it, files will be loaded in memory only
- No server or installation required
- Everything happens locally in your browser

## Customization

The viewer is built with a modular design that can be customized:

- Edit the CSS in the `src/styles` directory
- Modify the rendering in `src/utils/renderer.js`
- Add new components in `src/components`

## Building

To build the viewer:

1. Navigate to the Viewer directory
2. Run the build script:

```
node src/build.js
```

This will create `bundle.js` and `bundle.css` in the src directory.

## License

MIT 