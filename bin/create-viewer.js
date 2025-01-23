#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

async function createViewer(targetDir = process.cwd()) {
    try {
        const packageRoot = path.resolve(__dirname, '..');
        const sourceFiles = {
            viewer: path.join(packageRoot, 'src', 'Viewer', 'viewer.html')
        };

        // Verify source files exist
        Object.entries(sourceFiles).forEach(([name, path]) => {
            if (!fs.existsSync(path)) {
                throw new Error(`Missing required file: ${name} (${path})`);
            }
        });

        // Create target directory
        fs.mkdirSync(targetDir, { recursive: true });

        // Copy files with better error handling
        Object.entries(sourceFiles).forEach(([name, sourcePath]) => {
            const destPath = path.join(targetDir, path.basename(sourcePath));
            fs.copyFileSync(sourcePath, destPath);
            console.log(`✓ Copied ${name} to ${destPath}`);
        });

        console.log('\n✅ Viewer setup completed at:', path.resolve(targetDir));

    } catch (error) {
        console.error('\n❌ Error creating viewer:', error.message);
        console.log('Verify these files exist in your project:');
        console.log('- src/Viewer/viewer.html');
        console.log('- src/renderer/markdown.js');
        process.exit(1);
    }
}

// Handle arguments with better validation
const targetDir = process.argv[2] 
    ? path.resolve(process.cwd(), process.argv[2])
    : process.cwd();

// Verify target directory exists
if (!fs.existsSync(targetDir)) {
    console.log(`Creating directory: ${targetDir}`);
    fs.mkdirSync(targetDir, { recursive: true });
}

createViewer(targetDir);