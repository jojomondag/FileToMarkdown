#!/usr/bin/env node

const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

async function createViewer(targetDir = process.cwd()) {
    try {
        // Get paths
        const packageRoot = path.join(__dirname, '..');
        const viewerSource = path.join(packageRoot, 'src', 'viewer.html');
        const viewerDest = path.join(targetDir, 'viewer.html');
        const rendererSource = path.join(packageRoot, 'dist', 'renderer.bundle.js');
        
        // Create dist directory
        const distDir = path.join(targetDir, 'dist');
        if (!fsSync.existsSync(distDir)) {
            await fs.mkdir(distDir, { recursive: true });
        }

        // Copy and update viewer.html
        if (fsSync.existsSync(viewerSource)) {
            await fs.copyFile(viewerSource, viewerDest);
            let viewerContent = await fs.readFile(viewerDest, 'utf8');
            viewerContent = viewerContent.replace('../dist/renderer.bundle.js', './dist/renderer.bundle.js');
            await fs.writeFile(viewerDest, viewerContent);
            console.log('✓ Created viewer.html');
        } else {
            throw new Error('Could not find viewer.html in package');
        }

        // Copy renderer bundle
        if (fsSync.existsSync(rendererSource)) {
            await fs.copyFile(rendererSource, path.join(distDir, 'renderer.bundle.js'));
            console.log('✓ Created dist/renderer.bundle.js');
        } else {
            throw new Error('Could not find renderer.bundle.js in package');
        }

        console.log('\nViewer created successfully!');
        console.log('To use:');
        console.log('1. Open viewer.html in your browser');
        console.log('2. Drop your markdown files onto it or use the browse button');

    } catch (error) {
        console.error('Error creating viewer:', error.message);
        process.exit(1);
    }
}

// If directory is provided as argument, use it
const targetDir = process.argv[2] || process.cwd();
createViewer(targetDir); 