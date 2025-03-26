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
    'utils/fileManager.js',
    'components/FileList.js',
    'utils/renderer.js',
    'app.js'  // Main app file
];

// CSS files to bundle
const styleFiles = [
    'styles/base.css',
    'styles/sidebar.css',
    'styles/filetree.css',
    'styles/content.css'
];

// Output files
const bundlePath = path.join(__dirname, 'bundle.js');
const cssPath = path.join(__dirname, 'bundle.css');

// Create the bundle
let bundleContent = `// FileToMarkdown Viewer Bundle - ${new Date().toISOString()}\n\n`;

// Function to process a file and extract its exported content
function processFile(filePath) {
    try {
        let content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
        
        // Handle different types of imports
        content = content.replace(/import .* from .*/g, '');
        
        // Handle different types of exports
        content = content.replace(/export (const|let|var|class) (\w+)/g, '$1 $2');
        content = content.replace(/export default (\w+)/g, '// export $1');
        
        // Handle named function exports
        content = content.replace(/export function (\w+)/g, 'function $1');
        
        return content;
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err.message);
        return `// Error loading ${filePath}\n`;
    }
}

// Process each JS file
files.forEach(file => {
    try {
        bundleContent += `// File: ${file}\n`;
        bundleContent += processFile(file);
        bundleContent += '\n\n';
    } catch (err) {
        console.error(`Error including ${file}:`, err.message);
        bundleContent += `// Error including ${file}\n\n`;
    }
});

// Add exports at the end
bundleContent += `
// Export all modules for global use
window.FileManager = FileManager;
window.FileList = FileList;
window.createElementWithAttributes = createElementWithAttributes;
window.sanitizeText = sanitizeText;
window.applyToElements = applyToElements;
window.createFragmentFromHTML = createFragmentFromHTML;
window.BrowserRenderer = BrowserRenderer;
window.FileToMarkdownViewer = FileToMarkdownViewer;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FileToMarkdownViewer();
});
`;

// Write the bundle file
try {
    fs.writeFileSync(bundlePath, bundleContent);
    console.log(`Bundle successfully created at ${bundlePath}`);
} catch (err) {
    console.error('Error writing bundle file:', err.message);
}

// Process and combine CSS files
let cssBundle = `/* FileToMarkdown Viewer CSS Bundle - ${new Date().toISOString()} */\n\n`;

styleFiles.forEach(file => {
    try {
        const cssContent = fs.readFileSync(path.join(__dirname, file), 'utf8');
        cssBundle += `/* File: ${file} */\n${cssContent}\n\n`;
    } catch (err) {
        console.error(`Error including CSS file ${file}:`, err.message);
        cssBundle += `/* Error including ${file} */\n\n`;
    }
});

// Write the CSS bundle file
try {
    fs.writeFileSync(cssPath, cssBundle);
    console.log(`CSS bundle successfully created at ${cssPath}`);
} catch (err) {
    console.error('Error writing CSS bundle file:', err.message);
} 