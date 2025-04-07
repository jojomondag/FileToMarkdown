const fs = require('fs');
const path = require('path');
// Import the MarkdownRenderer directly as it is the default export
const MarkdownRenderer = require('../src/renderer/markdown');

// Create a new Markdown renderer instance with proper options
const renderer = new MarkdownRenderer({
    dynamicFileTypes: {} // Empty object to avoid undefined error
});

// Test cases for advanced Markdown features
const testCases = [
    {
        name: "Math Expressions (Inline)",
        markdown: "This is an inline math formula: $E = mc^2$ within text.",
        description: "Tests rendering of inline math expressions using $...$ syntax"
    },
    {
        name: "Math Expressions (Block)",
        markdown: "Here's a block math formula:\n\n$$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\nThe quadratic formula.",
        description: "Tests rendering of block math expressions using $$...$$ syntax"
    },
    {
        name: "Diagrams (Mermaid)",
        markdown: "```mermaid\ngraph TD;\n    A-->B;\n    A-->C;\n    B-->D;\n    C-->D;\n```",
        description: "Tests rendering of Mermaid diagrams"
    },
    {
        name: "Diagrams (PlantUML)",
        markdown: "```plantuml\n@startuml\nAlice -> Bob: Authentication Request\nBob --> Alice: Authentication Response\n@enduml\n```",
        description: "Tests rendering of PlantUML diagrams"
    },
    {
        name: "GitHub @mentions",
        markdown: "This feature was implemented by @username and reviewed by @anotheruser.",
        description: "Tests rendering of GitHub-style @mentions"
    },
    {
        name: "GitHub #issue References",
        markdown: "This fixes #123 and addresses #456.",
        description: "Tests rendering of GitHub-style issue references"
    },
    {
        name: "Custom Containers (Admonitions)",
        markdown: ":::note\nThis is a note admonition\n:::\n\n:::warning Some Warning Title\nThis is a warning with a custom title\n:::\n\n:::danger\nThis is a danger admonition\n:::\n\n:::tip\nThis is a tip admonition\n:::",
        description: "Tests rendering of custom admonition containers"
    },
    {
        name: "Table of Contents",
        markdown: "# Document with TOC\n\n[[toc]]\n\n## First Section\nContent here\n\n## Second Section\nMore content\n\n### Subsection 2.1\nNested content\n\n## Third Section\nFinal content",
        description: "Tests automatic table of contents generation"
    },
    {
        name: "Image Sizing and Alignment",
        markdown: "![Standard image](https://example.com/image.jpg)\n\n![Image with width|width=300px](https://example.com/image.jpg)\n\n![Left aligned image|align=left|width=200px](https://example.com/image.jpg)\n\n![Centered image|align=center|width=50%](https://example.com/image.jpg)\n\n![Image with dimensions|width=300px|height=200px](https://example.com/image.jpg)",
        description: "Tests image sizing and alignment attributes"
    },
    {
        name: "Embedded YouTube Video",
        markdown: "@[youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)\n\n@[youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ){width=400 height=300}",
        description: "Tests embedding YouTube videos"
    },
    {
        name: "Embedded Vimeo Video",
        markdown: "@[vimeo](https://vimeo.com/123456789)\n\n@[vimeo](https://vimeo.com/123456789){width=400 height=300}",
        description: "Tests embedding Vimeo videos"
    },
    {
        name: "Embedded CodePen",
        markdown: "@[codepen](https://codepen.io/your-username/pen/abcdef)",
        description: "Tests embedding CodePen snippets"
    },
    {
        name: "Combined Advanced Features",
        markdown: "# Advanced Document\n\n[[toc]]\n\n## Math and Diagrams\n\nInline math: $a^2 + b^2 = c^2$\n\n```mermaid\nsequenceDiagram\n    participant Alice\n    participant Bob\n    Alice->>Bob: Hello Bob, how are you?\n    Bob-->>Alice: I am good thanks!\n```\n\n## Admonitions and References\n\n:::note\nMentioned by @username in #123\n:::\n\n## Embedded Content and Images\n\n![Sized image|width=300px|align=center](https://example.com/image.jpg)\n\n@[youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)",
        description: "Tests multiple advanced features in a single document"
    }
];

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'test-results', 'advanced-features');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Generate HTML for each test case
console.log('Testing Advanced Markdown Features:');
console.log('==================================');

let allTestsHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Advanced Markdown Feature Tests</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 1200px; margin: 0 auto; }
        .test-case { border: 1px solid #ddd; border-radius: 5px; margin-bottom: 20px; padding: 15px; }
        .test-header { background-color: #f7f7f7; padding: 10px; margin: -15px -15px 15px; border-bottom: 1px solid #ddd; border-radius: 5px 5px 0 0; }
        .test-name { font-size: 18px; font-weight: bold; }
        .test-description { color: #666; font-style: italic; margin-top: 5px; }
        .markdown-source { background-color: #f5f5f5; border: 1px solid #ddd; padding: 10px; font-family: monospace; white-space: pre-wrap; margin-bottom: 15px; }
        .html-output { background-color: #f5f5f5; border: 1px solid #ddd; padding: 10px; font-family: monospace; white-space: pre-wrap; margin-bottom: 15px; overflow: auto; max-height: 300px; }
        h1 { color: #333; }
        .rendered { border: 1px solid #ddd; padding: 15px; background-color: white; }
    </style>
</head>
<body>
    <h1>Advanced Markdown Feature Tests</h1>
`;

testCases.forEach((test, index) => {
    console.log(`${index + 1}. ${test.name}`);
    
    // Render the markdown to HTML
    const rendered = renderer.render(test.markdown);
    
    // Save individual test to file
    const testHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${test.name} - Markdown Test</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
    </style>
</head>
<body>
    <h1>${test.name}</h1>
    <p><em>${test.description}</em></p>
    <h2>Markdown Source:</h2>
    <pre>${test.markdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    <h2>Rendered Output:</h2>
    <div class="rendered">${rendered}</div>
</body>
</html>`;
    
    const fileName = `${String(index + 1).padStart(2, '0')}-${test.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    fs.writeFileSync(path.join(outputDir, fileName), testHtml);
    
    // Add to combined HTML
    allTestsHtml += `
    <div class="test-case">
        <div class="test-header">
            <div class="test-name">${index + 1}. ${test.name}</div>
            <div class="test-description">${test.description}</div>
        </div>
        <h3>Markdown Source:</h3>
        <div class="markdown-source">${test.markdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        <h3>Rendered Output:</h3>
        <div class="rendered">${rendered}</div>
    </div>`;
});

allTestsHtml += `
</body>
</html>`;

// Save combined tests to file
fs.writeFileSync(path.join(outputDir, 'all-advanced-tests.html'), allTestsHtml);

console.log('\nCompleted testing advanced Markdown features.');
console.log(`HTML report generated at: ${path.join(outputDir, 'all-advanced-tests.html')}`);
console.log('Individual test files are in the same directory.'); 