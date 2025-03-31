#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

async function createViewer(targetDir = process.cwd(), useExamplesStructure = true) {
    try {
        const packageRoot = path.resolve(__dirname, '..');
        const sourceFiles = {
            viewer: path.join(packageRoot, 'src', 'Viewer', 'viewer.html'),
            bundle_js: path.join(packageRoot, 'src', 'Viewer', 'src', 'bundle.js'),
            bundle_css: path.join(packageRoot, 'src', 'Viewer', 'src', 'bundle.css')
        };

        // Verify source files exist
        Object.entries(sourceFiles).forEach(([name, filePath]) => {
            console.log(`Checking if file exists: ${filePath}`);
            if (!fs.existsSync(filePath)) {
                throw new Error(`Missing required file: ${name} (${filePath})`);
            }
        });

        // Determine final target directory based on structure preference
        let viewerDir = targetDir;
        if (useExamplesStructure) {
            viewerDir = path.join(targetDir, 'examples', 'viewer');
        }

        // Create target directory and src subdirectory
        fs.mkdirSync(viewerDir, { recursive: true });
        const srcDir = path.join(viewerDir, 'src');
        fs.mkdirSync(srcDir, { recursive: true });

        // Copy files with better error handling
        Object.entries(sourceFiles).forEach(([name, sourcePath]) => {
            let destPath;
            if (name === 'viewer') {
                destPath = path.join(viewerDir, path.basename(sourcePath));
            } else {
                // Bundle files go in the src directory
                destPath = path.join(srcDir, path.basename(sourcePath));
            }
            console.log(`Copying ${sourcePath} to ${destPath}`);
            fs.copyFileSync(sourcePath, destPath);
            console.log(`✓ Copied ${name} to ${destPath}`);
        });

        console.log('\n✅ Viewer setup completed at:', path.resolve(viewerDir));
        
        if (useExamplesStructure) {
            console.log('\n🔗 Viewer Access:');
            console.log(`   - Run the server: npm run start:viewer`);
            console.log(`   - Then access: http://localhost:3001/examples/viewer/viewer.html`);
        } else {
            console.log('\n🔗 Access the viewer by opening the HTML file directly in your browser.');
        }

    } catch (error) {
        console.error('\n❌ Error creating viewer:', error.message);
        console.error('Stack trace:', error.stack);
        console.log('Verify these files exist in your project:');
        console.log('- src/Viewer/viewer.html');
        console.log('- src/Viewer/src/bundle.js');
        console.log('- src/Viewer/src/bundle.css');
        process.exit(1);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
let targetDir = process.cwd();
let useExamplesStructure = true;

// Process arguments
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--no-examples-structure') {
        useExamplesStructure = false;
    } else if (!args[i].startsWith('--')) {
        // Assume it's the target directory
        targetDir = path.resolve(process.cwd(), args[i]);
    }
}

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
    console.log(`Creating directory: ${targetDir}`);
    fs.mkdirSync(targetDir, { recursive: true });
}

console.log('Make sure to run "npm run build-viewer" before creating the viewer to ensure bundle files are up-to-date.');
createViewer(targetDir, useExamplesStructure);