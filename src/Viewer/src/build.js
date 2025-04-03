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

// Files to include in the bundle - ORDER MATTERS for dependencies
const files = [
    'utils/constants.js',
    'utils/domUtils.js',
    'utils/eventEmitter.js',    // Add EventEmitter before components that depend on it
    'components/BaseComponent.js',
    'utils/renderer.js',
    'utils/fileManager.js',
    'utils/stateManager.js',    // Add StateManager after FileManager
    'utils/tooltipManager.js',  // Add TooltipManager for preset button tooltips
    'components/FileList.js',   
    'components/Header.js',
    'components/Editor.js',
    'components/Preview.js',
    'app.js'  // Main app file last
];

// CSS files to bundle
const styleFiles = [
    'styles/base.css',
    'styles/sidebar.css',
    'styles/filetree.css',
    'styles/fileList.css',      // Add new FileList styles
    'styles/content.css',
    'styles/styles.css'         // Main styles last
];

// Output files
const bundlePath = path.join(__dirname, 'bundle.js');
const cssPath = path.join(__dirname, 'bundle.css');

// Create the bundle
let bundleContent = `// FileToMarkdown Viewer Bundle - ${new Date().toISOString()}\n\n`;

// Add polyfills or global utilities if needed
bundleContent += `// Ensure global objects exist
if (typeof window.FileToMarkdownViewer === 'undefined') {
    window.FileToMarkdownViewer = null;
}

`;

// Function to process a file and extract its exported content
function processFile(filePath) {
    try {
        let content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
        
        // Handle different types of imports
        content = content.replace(/import .* from ['"](.*)['"];?/g, '// import from $1');
        
        // Handle different types of exports
        content = content.replace(/export (const|let|var|class) (\w+)/g, '$1 $2');
        content = content.replace(/^export default /m, '');
        
        // Handle named function exports
        content = content.replace(/export function (\w+)/g, 'function $1');
        
        return content;
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err.message);
        return `// Error loading ${filePath}\nconsole.error("Failed to load ${filePath}");\n`;
    }
}

// Process each JS file
files.forEach(file => {
    try {
        const filePath = path.join(__dirname, file);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.warn(`Warning: File ${file} not found, skipping.`);
            bundleContent += `// Warning: File ${file} not found\n\n`;
            return;
        }
        
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
window.FileManager = typeof FileManager !== 'undefined' ? FileManager : null;
window.FileList = typeof FileList !== 'undefined' ? FileList : null;
window.EventEmitter = typeof EventEmitter !== 'undefined' ? EventEmitter : null;
window.BrowserRenderer = typeof BrowserRenderer !== 'undefined' ? BrowserRenderer : null;
window.createElementWithAttributes = typeof createElementWithAttributes !== 'undefined' ? createElementWithAttributes : null;
window.FileToMarkdownViewer = typeof FileToMarkdownViewer !== 'undefined' ? FileToMarkdownViewer : null;

// Comment out the duplicate initialization that was causing double event handlers
/* 
// Initialize the application - this initializes the global app instance
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app from bundle');
    if (typeof FileToMarkdownViewer === 'undefined') {
        console.error('FileToMarkdownViewer class not found in bundle!');
    } else {
        window.app = new FileToMarkdownViewer();
    }
});
*/
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
        const filePath = path.join(__dirname, file);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.warn(`Warning: CSS file ${file} not found, skipping.`);
            cssBundle += `/* Warning: CSS file ${file} not found */\n\n`;
            return;
        }
        
        const cssContent = fs.readFileSync(filePath, 'utf8');
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