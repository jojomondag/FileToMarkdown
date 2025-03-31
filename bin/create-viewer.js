#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { createViewer } = require('../src/Viewer/createViewer');

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

// Use the shared viewer creation module
async function runViewer() {
    try {
        const viewerOptions = {
            targetDir,
            useExamplesStructure,
            addGithubTheme: false,
            useFsPromises: false
        };

        // For each file that needs to be checked, log it beforehand
        const packageRoot = path.resolve(__dirname, '..');
        const filesToCheck = [
            path.join(packageRoot, 'src', 'Viewer', 'viewer.html'),
            path.join(packageRoot, 'src', 'Viewer', 'src', 'bundle.js'),
            path.join(packageRoot, 'src', 'Viewer', 'src', 'bundle.css')
        ];

        filesToCheck.forEach(filePath => {
            console.log(`Checking if file exists: ${filePath}`);
        });

        const result = await createViewer(viewerOptions);

        if (result.completed) {
            console.log(`✓ Copied viewer to ${result.viewerHtmlPath}`);
            console.log(`✓ Copied bundle_js to ${result.bundleJsPath}`);
            console.log(`✓ Copied bundle_css to ${result.bundleCssPath}`);

            console.log('\n✅ Viewer setup completed at:', path.resolve(result.viewerDir));
            
            if (useExamplesStructure) {
                console.log('\n🔗 Viewer Access:');
                console.log(`   - Open ${path.join(result.viewerDir, 'viewer.html')} directly in your browser`);
            } else {
                console.log('\n🔗 Access the viewer by opening the HTML file directly in your browser.');
            }
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

runViewer();