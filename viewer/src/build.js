/**
 * Build script for FileToMarkdown viewer
 * 
 * This script will combine the individual module files into a single bundle.js file.
 * To use: 
 * 1. Install Node.js
 * 2. Run: node build.js
 */

const fs = require('fs');
const path = require('path');

// Files to include in the bundle
const files = [
    'utils/constants.js',
    'utils/domUtils.js',
    'components/BaseComponent.js',
    'utils/fileSync.js',
    'utils/fileManager.js',
    'components/FileList.js',
    'utils/renderer.js',
    'app.js'  // Main app file (to be created)
];

// Output bundle file
const bundlePath = path.join(__dirname, 'bundle.js');

// Create the bundle
let bundleContent = `// FileToMarkdown Viewer Bundle - ${new Date().toISOString()}\n\n`;

// Function to process a file and extract its exported content
function processFile(filePath) {
    console.log(`Processing ${filePath}...`);
    try {
        let content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
        content = content.replace(/import .* from .*/g, '');
        content = content.replace(/export (const|let|var|class) (\w+)/g, '$1 $2');
        content = content.replace(/export default (\w+)/g, '// export $1');
        return content;
    } catch (err) {
        console.error(`ERROR reading file ${filePath}: ${err.message}`);
        console.error(`File path attempted: ${path.join(__dirname, filePath)}`);
        console.error(err.stack);
        throw err;
    }
}

// Process each file
files.forEach(file => {
    try {
        console.log(`Starting to process file: ${file}`);
        bundleContent += `// File: ${file}\n`;
        bundleContent += processFile(file);
        bundleContent += '\n';
        console.log(`Successfully processed file: ${file}`);
    } catch (err) {
        console.error(`FATAL ERROR processing ${file}: ${err.message}`);
    }
});

// Add exports at the end
bundleContent += `
// Export all modules for global use
window.FileManager = FileManager;
window.FileList = FileList;
window.DOMUtils = DOMUtils;
window.BrowserRenderer = BrowserRenderer;
window.FileSync = FileSync;
window.FileToMarkdownViewer = FileToMarkdownViewer;
`;

// Write the bundle file
try {
    fs.writeFileSync(bundlePath, bundleContent);
    console.log(`Bundle created at ${bundlePath}`);
} catch (err) {
    console.error(`Error writing bundle file: ${err.message}`);
    console.error(err.stack);
} 