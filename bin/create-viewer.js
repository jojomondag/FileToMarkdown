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
        
        // Copy viewer.html
        if (fsSync.existsSync(viewerSource)) {
            let viewerContent = await fs.readFile(viewerSource, 'utf8');
            
            // Add Prism.js language components
            const languageScripts = `
    <!-- Common programming languages -->
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-javascript.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-python.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-java.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-cpp.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-csharp.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-ruby.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-go.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-rust.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-bash.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-sql.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-json.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-yaml.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-xml.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-typescript.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-php.min.js"></script>`;

            // Insert language scripts after the main Prism.js script
            viewerContent = viewerContent.replace(
                '<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-markdown.min.js"></script>',
                '<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-markdown.min.js"></script>' + languageScripts
            );

            await fs.writeFile(viewerDest, viewerContent);
            console.log('✓ Created viewer.html with syntax highlighting support');
        } else {
            throw new Error('Could not find viewer.html in package');
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