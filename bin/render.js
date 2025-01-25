#!/usr/bin/env node

const fs = require('fs');
const MarkdownRenderer = require('../src/renderer/markdown');

const usage = `
Usage: filetomarkdown-render <input-file> [output-file]

Arguments:
  input-file   Path to the markdown file to render
  output-file  Optional. Path to save the rendered HTML. If not provided, outputs to stdout

Options:
  --help    Show this help message
`;

async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.length === 0) {
        console.log(usage);
        process.exit(0);
    }

    const inputFile = args[0];
    const outputFile = args[1];

    try {
        // Read the input markdown file
        const markdownContent = fs.readFileSync(inputFile, 'utf-8');

        // Use the MarkdownRenderer class
        const renderer = new MarkdownRenderer();
        const htmlContent = renderer.render(markdownContent);

        // Add basic HTML structure and styling
        const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rendered Markdown</title>
    <!-- Use a more vibrant theme -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css" rel="stylesheet">
    <!-- Load the all-in-one bundle -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
    <script>
        // Configure Prism
        window.Prism = window.Prism || {};
        Prism.manual = true;
        
        // Highlight after all components are loaded
        window.onload = function() {
            Prism.highlightAll();
        }
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
        }
        pre {
            background: #f5f5f5;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
        }
        code {
            font-family: 'Consolas', 'Monaco', 'Andale Mono', monospace;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: #2c3e50;
        }
        a {
            color: #3498db;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        blockquote {
            border-left: 4px solid #e5e7eb;
            margin: 1.5rem 0;
            padding: 0.5rem 1rem;
            color: #4a5568;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1rem 0;
        }
        th, td {
            border: 1px solid #e5e7eb;
            padding: 0.5rem;
            text-align: left;
        }
        th {
            background-color: #f8fafc;
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;

        if (outputFile) {
            fs.writeFileSync(outputFile, fullHtml);
            console.log(`Rendered HTML saved to: ${outputFile}`);
        } else {
            console.log(fullHtml);
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main(); 