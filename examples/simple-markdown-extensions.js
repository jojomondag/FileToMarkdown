const fs = require('fs');
const path = require('path');
const MarkdownRenderer = require('../src/renderer/markdown');

// Create a new Markdown renderer instance with proper options
const renderer = new MarkdownRenderer({
    dynamicFileTypes: {} // Empty object to avoid undefined error
});

// Create a string with examples of all our advanced Markdown features
const advancedMarkdown = `
# Advanced Markdown Features Test

## Math Expressions

Inline math: $E = mc^2$

Block math:

$$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

## Diagrams

\`\`\`mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
\`\`\`

## GitHub Features

Mention @username and reference issue #123.

## Admonitions

:::note
This is a note admonition.
:::

:::warning Warning Title
This is a warning with a custom title.
:::

:::danger
This is a danger admonition.
:::

## Table of Contents

[[toc]]

## Enhanced Images

![Regular image](https://example.com/image.jpg)

![Image with width|width=300px](https://example.com/image.jpg)

![Left aligned image|align=left|width=200px](https://example.com/image.jpg)

## Embedded Content

@[youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

@[vimeo](https://vimeo.com/123456789){width=400 height=300}

@[codepen](https://codepen.io/your-username/pen/abcdef)
`;

// Render the markdown directly
const html = renderer.render(advancedMarkdown);

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Create an HTML file with the result
const htmlOutput = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Advanced Markdown Features Test</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
    </style>
</head>
<body>
    <h1>Advanced Markdown Features Test</h1>
    <h2>Source Markdown:</h2>
    <pre>${advancedMarkdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    <h2>Rendered Output:</h2>
    ${html}
</body>
</html>`;

// Save the output to a file
const outputFile = path.join(outputDir, 'advanced-markdown-test.html');
fs.writeFileSync(outputFile, htmlOutput);

console.log(`Test completed! View the results at: ${outputFile}`);
console.log('The file should display the following advanced Markdown features:');
console.log('1. Math expressions (inline and block)');
console.log('2. Code blocks with syntax highlighting');
console.log('3. Mermaid diagrams');
console.log('4. GitHub mentions and issues');
console.log('5. Admonitions/custom containers');
console.log('6. Table of contents');
console.log('7. Images with size and alignment attributes');
console.log('8. Embedded YouTube, Vimeo and CodePen content'); 