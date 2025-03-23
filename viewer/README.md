# FileToMarkdown Viewer

A lightweight viewer for Markdown files with syntax highlighting and file navigation.

## Features

- View multiple Markdown files
- Files tree navigation 
- Syntax highlighting for code blocks
- Support for internal links between Markdown files
- Drag and drop file loading

## Project Structure

```
viewer/
├── viewer.html       # Main HTML file
├── src/
│   ├── bundle.js     # Combined JavaScript (generated)
│   ├── build.js      # Build script
│   ├── app.js        # Main application logic
│   ├── components/   # UI components
│   │   ├── BaseComponent.js
│   │   └── FileList.js
│   ├── utils/        # Utility modules
│   │   ├── constants.js
│   │   ├── domUtils.js
│   │   ├── fileManager.js
│   │   └── renderer.js
│   └── styles/       # CSS styles
│       ├── main.css
│       └── filetree.css
```

## Development

### Setup

1. Clone the repository
2. Navigate to the viewer directory
3. No additional dependencies are required for development

### Build Process

The project uses a simple build system to bundle the modular JavaScript files into a single `bundle.js` file. 

To build the project:

```bash
# Navigate to the src directory
cd src

# Run the build script
node build.js
```

### Code Organization

- **Components**: Reusable UI components reside in the `src/components/` directory.
- **Utils**: Helper functions and utilities are in the `src/utils/` directory.
- **Styles**: CSS styles are in the `src/styles/` directory.
- **App**: The main application logic is in `src/app.js`.

### Important Notes

1. **Avoid editing bundle.js directly** - Always edit the source files and then rebuild.
2. **CSS Naming** - The project uses a minimal CSS naming convention with short class names.

## Usage

Open `viewer.html` in a web browser and either:
- Drag and drop Markdown files onto the designated drop zone
- Click the drop zone to browse for files

## License

MIT 