#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Destination directory
const targetDir = 'C:\\Users\\Josef\\Desktop\\Viewer';

// Source directory (current workspace)
const sourceDir = process.cwd();

// Files and directories to copy
const filesToCopy = [
    // Main viewer files
    { src: 'src/Viewer/viewer.html', dest: 'viewer.html' },
    { src: 'src/Viewer/createViewer.js', dest: 'createViewer.js' },
    { src: 'bin/create-viewer.js', dest: 'bin/create-viewer.js' },
    { src: 'src/Viewer/package.json', dest: 'package.json' },
    { src: 'src/Viewer/package-lock.json', dest: 'package-lock.json' },
    { src: 'src/Viewer/webpack.config.js', dest: 'webpack.config.js' },
    { src: 'src/Viewer/README.md', dest: 'README.md' },
    
    // Source files
    { src: 'src/Viewer/src/app.js', dest: 'src/app.js' },
    { src: 'src/Viewer/src/index.js', dest: 'src/index.js' },
    { src: 'src/Viewer/src/build.js', dest: 'src/build.js' },
    { src: 'src/Viewer/src/bundle.js', dest: 'src/bundle.js' },
    { src: 'src/Viewer/src/bundle.css', dest: 'src/bundle.css' }
];

// Directories to copy recursively
const dirsToCopy = [
    { src: 'src/Viewer/src/components', dest: 'src/components' },
    { src: 'src/Viewer/src/styles', dest: 'src/styles' },
    { src: 'src/Viewer/src/utils', dest: 'src/utils' }
];

// Create the target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`Created directory: ${targetDir}`);
}

// Copy individual files
filesToCopy.forEach(file => {
    try {
        const srcPath = path.join(sourceDir, file.src);
        const destPath = path.join(targetDir, file.dest);
        
        // Create destination directory if it doesn't exist
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`✓ Copied ${file.src} to ${destPath}`);
        } else {
            console.log(`❌ Source file not found: ${srcPath}`);
        }
    } catch (error) {
        console.error(`Error copying ${file.src}: ${error.message}`);
    }
});

// Function to copy directory recursively
function copyDirRecursive(src, dest) {
    const srcPath = path.join(sourceDir, src);
    const destPath = path.join(targetDir, dest);
    
    if (!fs.existsSync(srcPath)) {
        console.log(`❌ Source directory not found: ${srcPath}`);
        return;
    }
    
    if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
    }
    
    const entries = fs.readdirSync(srcPath, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcEntry = path.join(srcPath, entry.name);
        const destEntry = path.join(destPath, entry.name);
        
        if (entry.isDirectory()) {
            fs.mkdirSync(destEntry, { recursive: true });
            copyDirRecursive(path.join(src, entry.name), path.join(dest, entry.name));
        } else {
            fs.copyFileSync(srcEntry, destEntry);
            console.log(`✓ Copied ${srcEntry} to ${destEntry}`);
        }
    }
}

// Copy directories recursively
dirsToCopy.forEach(dir => {
    try {
        copyDirRecursive(dir.src, dir.dest);
        console.log(`✓ Copied directory ${dir.src} to ${path.join(targetDir, dir.dest)}`);
    } catch (error) {
        console.error(`Error copying directory ${dir.src}: ${error.message}`);
    }
});

// Create a simple README if it doesn't exist in source
const readmePath = path.join(targetDir, 'README.md');
if (!fs.existsSync(readmePath)) {
    const readmeContent = `# FileToMarkdown Viewer

A standalone viewer for markdown files with browser-based file system access.

## Setup

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Build the viewer:
   \`\`\`
   npm run build
   \`\`\`

3. Open \`viewer.html\` in your browser

## Usage

- Click the dropzone to select folders with markdown files
- Navigate through files in the sidebar
- View and edit markdown content in the main panel
`;

    fs.writeFileSync(readmePath, readmeContent);
    console.log(`✓ Created README.md at ${readmePath}`);
}

console.log('\n✅ Extraction completed successfully!');
console.log(`\nViewer files have been extracted to: ${targetDir}`);
console.log('\nTo use the viewer:');
console.log('1. Navigate to the extracted directory');
console.log('2. Run "npm install" to install dependencies');
console.log('3. Run "npm run build" to build the viewer');
console.log('4. Open viewer.html in your browser'); 