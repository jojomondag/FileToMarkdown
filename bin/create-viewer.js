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

            // Replace the entire head section to ensure proper script loading order
            const headContent = `
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>FileToMarkdown Viewer</title>
        <link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-markdown.min.js"></script>${languageScripts}`;

            // Replace the head section
            viewerContent = viewerContent.replace(/<head>[\s\S]*?<\/head>/, headContent + '\n    </head>');

            // Update the MarkdownRenderer class to ensure highlighting works
            const rendererClass = `
    class MarkdownRenderer {
        constructor(options = {}) {
            this.options = {
                highlight: true,
                ...options
            };

            marked.setOptions({
                highlight: (code, lang) => {
                    if (!this.options.highlight) return code;
                    
                    try {
                        if (lang && Prism.languages[lang]) {
                            return Prism.highlight(code, Prism.languages[lang], lang);
                        }
                        return code;
                    } catch (error) {
                        console.warn('Highlighting failed:', error);
                        return code;
                    }
                }
            });
        }

        render(markdown) {
            try {
                const html = marked.parse(markdown);
                return html;
            } catch (error) {
                throw new Error(\`Markdown rendering failed: \${error.message}\`);
            }
        }

        highlightAll() {
            if (this.options.highlight && typeof Prism !== 'undefined') {
                Prism.highlightAll();
            }
        }
    }`;

            // Replace the MarkdownRenderer class
            viewerContent = viewerContent.replace(/class MarkdownRenderer[\s\S]*?}/, rendererClass);

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