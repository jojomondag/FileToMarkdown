#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

async function createViewer(targetDir = process.cwd()) {
    try {
        // Get package root path
        const packageRoot = path.resolve(__dirname, '..');
        
        // Source files
        const viewerSource = path.join(packageRoot, 'src', 'Viewer', 'viewer.html');
        const markdownSource = path.join(packageRoot, 'src', 'Viewer', 'markdown.js');

        // Create target directory if needed
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Copy files using Windows-friendly methods
        fs.copyFileSync(viewerSource, path.join(targetDir, 'viewer.html'));
        fs.copyFileSync(markdownSource, path.join(targetDir, 'markdown.js'));

        console.log('✓ Viewer files created at:', path.resolve(targetDir));

    } catch (error) {
        console.error('Error creating viewer:', error.message);
        process.exit(1);
    }
}

// Handle arguments
const targetDir = process.argv[2] || process.cwd();
createViewer(targetDir);