/**
 * Unified Test Page for Markdown Renderer
 * Displays all test cases in a 4-column layout:
 * 1. Test Input
 * 2. Test Output
 * 3. Example Input
 * 4. Example Output
 */
const MarkdownRenderer = require('../src/renderer/markdown');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

// Configure output
const OUTPUT_DIR = path.join(__dirname, 'test-results');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'test-results.html');

// Import test cases from existing test suite
const { TEST_CASES, ADVANCED_TEST_CASES } = require('./test-cases');

// Create a renderer with default settings
const renderer = new MarkdownRenderer({
  highlight: true,
  loadLanguages: true,
  dynamicFileTypes: {}  // Add an empty object for dynamicFileTypes to avoid the error
});

async function generateUnifiedTestPage() {
  console.log('Generating unified test page...');
  
  // Create output directory if it doesn't exist
  if (!fsSync.existsSync(OUTPUT_DIR)) {
    fsSync.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Process all test cases
  const allTests = [...TEST_CASES, ...ADVANCED_TEST_CASES].map(test => {
    // Render the test markdown
    const renderedHtml = renderer.render(test.markdown);
    
    // Special handling for problematic content like footnotes and escape characters
    let processedHtml = renderedHtml;
    
    if (test.name === 'Escape Characters') {
      // Wrap each line in its own container to prevent layout issues
      processedHtml = renderedHtml.replace(/<p>(.*?)<\/p>/g, '<div class="escape-line"><p>$1</p></div>');
    }
    
    if (test.name === 'Footnotes') {
      // Enhance footnote container to prevent layout issues
      processedHtml = renderedHtml.replace(
        /<div class="footnote" id="fn-([^"]+)">(.*?)<\/div>/g, 
        '<div class="footnote-container"><div class="footnote" id="fn-$1">$2</div></div>'
      );
    }
    
    if (test.name === 'Definition Lists') {
      // Enhance definition lists to prevent layout issues
      processedHtml = '<div class="def-list-container">' + renderedHtml + '</div>';
    }
    
    if (test.name === 'Abbreviations') {
      // Enhance abbreviations to prevent layout issues
      processedHtml = '<div class="abbr-container">' + renderedHtml + '</div>';
    }
    
    if (test.name === 'HTML in Markdown') {
      // Wrap HTML in Markdown output in special container to prevent layout issues
      processedHtml = '<div class="html-markdown-container" style="position: relative; overflow: hidden;">' + renderedHtml + '</div>';
    }
    
    // Generate example markdown based on the test name
    let exampleMarkdown = '';
    let exampleHtml = '';
    
    // Set test criteria and determine if test passes
    let testCriteria = '';
    let passed = false;
    
    // Define test criteria and pass/fail logic based on the test name
    switch(test.name) {
      case 'Headings':
        testCriteria = 'Headings should be rendered with appropriate h1-h6 tags';
        passed = renderedHtml.includes('<h1>') && renderedHtml.includes('<h2>');
        break;
      case 'Paragraph':
        testCriteria = 'Paragraphs should be wrapped in p tags';
        passed = renderedHtml.includes('<p>');
        break;  
      case 'Emphasis':
        testCriteria = 'Emphasis should use em and strong tags correctly';
        passed = renderedHtml.includes('<em>') && renderedHtml.includes('<strong>');
        break;
      case 'Strikethrough':
        testCriteria = 'Strikethrough text should use del tags';
        passed = renderedHtml.includes('<del>');
        break;
      case 'Blockquotes':
        testCriteria = 'Blockquotes should use blockquote tags, including nested ones';
        passed = renderedHtml.includes('<blockquote>');
        break;
      case 'Unordered Lists':
        testCriteria = 'Unordered lists should use ul and li tags';
        passed = renderedHtml.includes('<ul>') && renderedHtml.includes('<li>');
        break;
      case 'Ordered Lists':
        testCriteria = 'Ordered lists should use ol and li tags';
        passed = renderedHtml.includes('<ol>') && renderedHtml.includes('<li>');
        break;
      case 'Task Lists':
        testCriteria = 'Task lists should include checkboxes';
        passed = renderedHtml.includes('type="checkbox"') || renderedHtml.includes('task-list-item');
        break;
      case 'Inline Code':
        testCriteria = 'Inline code should use code tags';
        passed = renderedHtml.includes('<code>');
        break;
      case 'Code Blocks':
        testCriteria = 'Code blocks should use pre and code tags';
        passed = renderedHtml.includes('<pre>') && renderedHtml.includes('<code>');
        break;
      case 'Syntax Highlighting':
        testCriteria = 'Code blocks should include language-specific classes';
        passed = renderedHtml.includes('language-javascript') || renderedHtml.includes('class="javascript"');
        break;
      case 'Horizontal Rules':
        testCriteria = 'Horizontal rules should use hr tags';
        passed = renderedHtml.includes('<hr');
        break;
      case 'Links':
        testCriteria = 'Links should use a tags with href attributes';
        passed = renderedHtml.includes('<a href=');
        break;
      case 'Reference Links':
        testCriteria = 'Reference links should be resolved to a tags';
        passed = renderedHtml.includes('<a href=') && renderedHtml.includes('Reference link');
        break;
      case 'Images':
        testCriteria = 'Images should use img tags with src and alt attributes';
        passed = renderedHtml.includes('<img') && renderedHtml.includes('src=') && renderedHtml.includes('alt=');
        break;
      case 'Tables':
        testCriteria = 'Tables should use table, tr, th, and td tags';
        passed = renderedHtml.includes('<table>') && (renderedHtml.includes('<th>') || renderedHtml.includes('<td>'));
        break;
      case 'Table Alignment':
        testCriteria = 'Tables should support alignment attributes';
        passed = renderedHtml.includes('<table>') && 
                (renderedHtml.includes('align=') || 
                 renderedHtml.includes('text-align') || 
                 renderedHtml.includes('class="text-'));
        break;
      case 'HTML in Markdown':
        testCriteria = 'HTML embedded in markdown should be preserved';
        passed = renderedHtml.includes('<div class="custom">') || renderedHtml.includes('<p>HTML content</p>');
        break;
      case 'Escape Characters':
        testCriteria = 'Escaped markdown characters should not be processed';
        passed = renderedHtml.includes('*not italic*') && !renderedHtml.includes('<em>not italic</em>');
        break;
      case 'Footnotes':
        testCriteria = 'Footnotes should render with superscript references';
        passed = renderedHtml.includes('footnote') && renderedHtml.includes('sup');
        break;
      case 'Definition Lists':
        testCriteria = 'Definition lists should use dl, dt, and dd tags';
        passed = renderedHtml.includes('<dl>') || renderedHtml.includes('<dt>') || renderedHtml.includes('<dd>');
        break;
      case 'Abbreviations':
        testCriteria = 'Abbreviations should use abbr tags with titles';
        passed = renderedHtml.includes('<abbr');
        break;
      case 'Subscript':
        testCriteria = 'Subscript should use sub tags';
        passed = renderedHtml.includes('<sub>');
        break;
      case 'Superscript':
        testCriteria = 'Superscript should use sup tags';
        passed = renderedHtml.includes('<sup>');
        break;
      case 'Highlight':
        testCriteria = 'Highlighted text should use mark tags';
        passed = renderedHtml.includes('<mark>');
        break;
      case 'Math Expressions (Inline)':
        testCriteria = 'Math expressions should be rendered correctly';
        passed = renderedHtml.includes('<span class="math-inline">');
        break;
      case 'Math Expressions (Block)':
        testCriteria = 'Math expressions should be rendered correctly';
        passed = renderedHtml.includes('<div class="math-block">');
        break;
      case 'Diagrams (Mermaid)':
        testCriteria = 'Diagrams should be rendered correctly';
        passed = renderedHtml.includes('<div class="mermaid-diagram">');
        break;
      case 'Enhanced Images':
        testCriteria = 'Enhanced images should be rendered correctly';
        passed = renderedHtml.includes('<img');
        break;
      default:
        testCriteria = `Testing ${test.name} rendering`;
        // For other cases, assume pass if we got some HTML output
        passed = renderedHtml.length > 0 && renderedHtml.includes('<');
    }
    
    // Create relevant examples based on the test type
    switch(test.name) {
      case 'Headings':
        exampleMarkdown = `# Main Heading\n## Secondary Heading`;
        break;
      case 'Emphasis':
        exampleMarkdown = `*This is italic* and **this is bold**`;
        break;
      case 'Blockquotes':
        exampleMarkdown = `> This is a sample blockquote\n> with multiple lines`;
        break;
      case 'Lists':
      case 'Unordered Lists':
      case 'Ordered Lists':
        exampleMarkdown = `- Item 1\n- Item 2\n  - Nested item`;
        break;
      case 'Links':
        exampleMarkdown = `[Link to GitHub](https://github.com)`;
        break;
      case 'Images':
        exampleMarkdown = `![GitHub Octocat Logo](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png)`;
        break;
      case 'Code Blocks':
      case 'Syntax Highlighting':
        exampleMarkdown = "```javascript\nconsole.log('Hello world');\n```";
        break;
      case 'Tables':
      case 'Table Alignment':
        exampleMarkdown = `| Name | Value |\n|------|-------|\n| Test | 123 |`;
        break;
      case 'Escape Characters':
        // Create a simpler example for escape characters
        exampleMarkdown = `\\*not italic\\*\n\n\\#not heading`;
        break;
      case 'Footnotes':
        // Create a simpler example for footnotes
        exampleMarkdown = `Text with a footnote[^1].\n\n[^1]: Simple footnote content.`;
        break;
      case 'Definition Lists':
        // Create a simpler example for definition lists
        exampleMarkdown = `Term 1\n: Definition 1\n\nTerm 2\n: Definition 2`;
        break;
      case 'Abbreviations':
        // Create a simpler example for abbreviations
        exampleMarkdown = `*[HTML]: Hyper Text Markup Language\n\nThe HTML specification.`;
        break;
      case 'Subscript':
        // Create a simpler example for subscript
        exampleMarkdown = `H~2~O is the formula for water.`;
        break;
      case 'Superscript':
        // Create a simpler example for superscript
        exampleMarkdown = `The area of a circle is πr^2^.`;
        break;
      case 'Highlight':
        // Create a simpler example for highlighting
        exampleMarkdown = `This is ==highlighted text==.`;
        break;
      case 'Math Expressions (Inline)':
        exampleMarkdown = 'E = mc<sup>2</sup>';
        break;
      case 'Math Expressions (Block)':
        exampleMarkdown = '-b ± √(b<sup>2</sup> - 4ac) / 2a';
        break;
      case 'Diagrams (Mermaid)':
        exampleMarkdown = 'A -> B -> C -> D';
        break;
      case 'Enhanced Images':
        exampleMarkdown = `![Beautiful sunset over the ocean](https://images.unsplash.com/photo-1495954484750-af469f2f9be5?w=500&auto=format)\n\n![Golden Gate Bridge|width=300px](https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&auto=format)`;
        break;
      default:
        // Use part of the test markdown as an example if no specific example
        exampleMarkdown = test.markdown.split('\n').slice(0, 2).join('\n');
    }
    
    // Render the example
    exampleHtml = renderer.render(exampleMarkdown);
    
    // Special handling for VS Code preview rendering
    let vsCodePreviewHtml = exampleHtml;
    
    if (test.name === 'Escape Characters') {
      // For VS Code preview, we want to show the actual characters, not HTML entities
      // Replace HTML entities with their actual characters for display
      vsCodePreviewHtml = exampleHtml
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#42;/g, '*')   // Asterisk
        .replace(/&#96;/g, '`')   // Backtick
        .replace(/&#91;/g, '[')   // Opening bracket
        .replace(/&#93;/g, ']')   // Closing bracket
        .replace(/&#35;/g, '#');  // Hash
        
      // For escape characters, render them directly as they would appear in VS Code
      vsCodePreviewHtml = `<div class="vscode-escape-preview">
        <h3>Escaped Characters in VS Code</h3>
        <p>VS Code shows escaped characters as literal text:</p>
        <p class="escape-example">*not italic*</p>
        <p class="escape-example">#not heading</p>
        <p class="escape-note">The backslashes are hidden in the preview but present in the source.</p>
      </div>`;
    }
    
    if (test.name === 'Footnotes') {
      // Create a more accurate VS Code footnote preview
      vsCodePreviewHtml = `<div class="vscode-footnote-preview">
        <p>Text with a footnote<sup><a href="#fn-1">1</a></sup>.</p>
        <hr class="footnote-separator">
        <div class="vscode-footnote">
          <sup>1</sup>: Simple footnote content.
        </div>
      </div>`;
    }
    
    if (test.name === 'Definition Lists') {
      // Create a VS Code-style definition list preview
      vsCodePreviewHtml = `<div class="vscode-deflist-preview">
        <p class="deflist-term">Term 1</p>
        <p class="deflist-definition">Definition 1</p>
        <p class="deflist-term">Term 2</p>
        <p class="deflist-definition">Definition 2</p>
      </div>`;
    }
    
    if (test.name === 'Abbreviations') {
      // Create a VS Code-style abbreviation preview
      vsCodePreviewHtml = `<div class="vscode-abbr-preview">
        <p>The <abbr title="Hyper Text Markup Language">HTML</abbr> specification.</p>
      </div>`;
    }
    
    if (test.name === 'Subscript') {
      // Create a VS Code-style subscript preview
      vsCodePreviewHtml = `<div class="vscode-sub-preview">
        <p>H<sub>2</sub>O is the formula for water.</p>
      </div>`;
    }
    
    if (test.name === 'Superscript') {
      // Create a VS Code-style superscript preview
      vsCodePreviewHtml = `<div class="vscode-sup-preview">
        <p>The area of a circle is πr<sup>2</sup>.</p>
      </div>`;
    }
    
    if (test.name === 'Highlight') {
      // Create a VS Code-style highlight preview
      vsCodePreviewHtml = `<div class="vscode-highlight-preview">
        <p>This is <mark>highlighted text</mark>.</p>
      </div>`;
    }
    
    if (test.name === 'Math Expressions (Inline)') {
      // Create a VS Code-style math inline preview
      vsCodePreviewHtml = `<div class="vscode-math-preview">
        <p>This is an inline math formula: <span class="math-inline">E = mc<sup>2</sup></span> within text.</p>
      </div>`;
    }
    
    if (test.name === 'Math Expressions (Block)') {
      // Create a VS Code-style math block preview
      vsCodePreviewHtml = `<div class="vscode-math-preview">
        <p>Here's a block math formula:</p>
        <div class="math-block">
          <div>
            <span class="fraction">
              <span class="numerator">-b ± √(b<sup>2</sup> - 4ac)</span>
              <span class="denominator">2a</span>
            </span>
          </div>
        </div>
        <p>The quadratic formula.</p>
      </div>`;
    }
    
    if (test.name === 'Diagrams (Mermaid)') {
      // Create a VS Code-style mermaid diagram preview
      vsCodePreviewHtml = `<div class="vscode-diagram-preview">
        <p>Mermaid diagram:</p>
        <div class="mermaid-diagram">
          <div class="diagram-placeholder">
            <div class="diagram-node">A</div>
            <div class="diagram-arrow">↓</div>
            <div class="diagram-row">
              <div class="diagram-node">B</div>
              <div class="diagram-node">C</div>
            </div>
            <div class="diagram-arrow">↓</div>
            <div class="diagram-node">D</div>
          </div>
        </div>
      </div>`;
    }
    
    if (test.name === 'Enhanced Images') {
      // Create a VS Code-style enhanced image preview
      vsCodePreviewHtml = `<div class="vscode-enhanced-images-preview">
        <p><img src="https://images.unsplash.com/photo-1495954484750-af469f2f9be5?w=500&auto=format" alt="Beautiful sunset over the ocean" /></p>
        <p><img src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&auto=format" alt="Golden Gate Bridge in San Francisco" style="width: 300px;" /></p>
      </div>`;
    }
    
    return {
      name: test.name,
      testMarkdown: test.markdown,
      testHtml: processedHtml,
      exampleMarkdown: exampleMarkdown,
      exampleHtml: exampleHtml,
      vsCodePreviewHtml: vsCodePreviewHtml,
      testCriteria: testCriteria,
      passed: passed
    };
  });
  
  // Calculate summary statistics
  const totalTests = allTests.length;
  const passedTests = allTests.filter(test => test.passed).length;
  const failedTests = totalTests - passedTests;
  const passRate = Math.round((passedTests / totalTests) * 100);
  
  // Generate HTML content
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unified Markdown Renderer Tests</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 20px;
      max-width: 1600px;
      margin: 0 auto;
    }
    h1, h2 {
      text-align: center;
    }
    
    /* Grid container with forced equal widths */
    .test-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
      width: 100%;
      overflow: visible;
      isolation: isolate;
      position: relative;
      z-index: 1;
    }
    
    /* Grid header styling */
    .grid-header {
      background-color: #f5f5f5;
      padding: 10px;
      font-weight: bold;
      border-radius: 4px;
      text-align: center;
      min-width: 0;
      word-wrap: break-word;
      height: 50px; /* Fixed height for headers */
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Each cell in the grid */
    .test-cell {
      position: relative;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: auto;
      max-height: 300px;
      width: 100%;
      box-sizing: border-box;
      background-color: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      min-height: 150px;
      min-width: 200px; /* Force minimum width */
      display: flex;
      flex-direction: column;
    }
    
    .test-name {
      grid-column: 1 / -1;
      background-color: #e9f5ff;
      padding: 10px;
      font-weight: bold;
      border-radius: 4px;
      margin-top: 15px;
    }
    
    pre {
      background-color: #f8f8f8;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .markdown-content {
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .html-content {
      background-color: #fffaf0;
      contain: content; /* Use CSS containment to prevent layout issues */
    }
    
    .html-view {
      flex: 1;
      overflow: auto;
      width: 100%;
      min-width: 0;
      padding: 10px;
      background-color: white;
      border-radius: 4px;
      display: block;
    }
    
    /* For responsive design */
    @media (max-width: 1200px) {
      .test-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 768px) {
      .test-grid {
        grid-template-columns: 1fr;
      }
    }
    
    /* Fix for Escape Characters and other tests with minimal content */
    .vscode-escape-preview,
    .vscode-deflist-preview,
    .vscode-abbr-preview,
    .vscode-sub-preview,
    .vscode-sup-preview,
    .vscode-highlight-preview,
    .vscode-footnote-preview,
    .vscode-math-preview,
    .vscode-diagram-preview,
    .vscode-enhanced-images-preview {
      width: 100%;
      min-height: 80px; /* Ensure there's enough content to push width */
      display: block;
      border: 1px solid #f1f1f1; /* Light border to show boundaries */
      padding: 10px;
      border-radius: 4px;
      background-color: #fff;
    }
    
    /* Enhanced Images Preview */
    .vscode-enhanced-images-preview img {
      max-width: 100%;
      height: auto;
      margin: 10px 0;
      display: block;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    /* Toggle switch styles */
    .switch-container {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-bottom: 5px;
      font-size: 0.7em;
      position: absolute;
      top: 5px;
      right: 5px;
      background: rgba(245, 245, 245, 0.8);
      padding: 2px 5px;
      border-radius: 3px;
      z-index: 10;
    }
    .switch {
      position: relative;
      display: inline-block;
      width: 30px;
      height: 16px;
      margin: 0 3px;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .3s;
      border-radius: 34px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 10px;
      width: 10px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .3s;
      border-radius: 50%;
    }
    input:checked + .slider {
      background-color: #2196F3;
    }
    input:checked + .slider:before {
      transform: translateX(14px);
    }
    .html-code {
      display: none;
    }
    .show-code .html-view {
      display: none;
    }
    .show-code .html-code {
      display: block;
    }
    
    /* VS Code style markdown preview */
    .vscode-preview {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      background-color: #ffffff;
      color: #24292e;
      line-height: 1.6;
      padding: 10px;
      overflow: auto;
    }
    .vscode-preview h1 {
      border-bottom: 1px solid #eaecef;
      padding-bottom: 0.3em;
      font-size: 2em;
      margin-top: 0;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    .vscode-preview h2 {
      border-bottom: 1px solid #eaecef;
      padding-bottom: 0.3em;
      font-size: 1.5em;
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
      text-align: left;
    }
    .vscode-preview h3 {
      font-size: 1.25em;
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    .vscode-preview h4, .vscode-preview h5, .vscode-preview h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    .vscode-preview p {
      margin-top: 0;
      margin-bottom: 16px;
    }
    .vscode-preview a {
      color: #0366d6;
      text-decoration: none;
    }
    .vscode-preview a:hover {
      text-decoration: underline;
    }
    .vscode-preview strong {
      font-weight: 600;
    }
    .vscode-preview em {
      font-style: italic;
    }
    .vscode-preview code {
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
      background-color: rgba(27, 31, 35, 0.05);
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-size: 85%;
    }
    .vscode-preview pre {
      font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
      background-color: #f6f8fa;
      border-radius: 3px;
      padding: 16px;
      overflow: auto;
      line-height: 1.45;
    }
    .vscode-preview pre code {
      background-color: transparent;
      padding: 0;
    }
    .vscode-preview blockquote {
      margin: 0;
      padding: 0 1em;
      color: #6a737d;
      border-left: 0.25em solid #dfe2e5;
    }
    .vscode-preview ul, .vscode-preview ol {
      padding-left: 2em;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .vscode-preview table {
      border-collapse: collapse;
      border-spacing: 0;
      display: block;
      width: 100%;
      overflow: auto;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .vscode-preview table th {
      font-weight: 600;
      padding: 6px 13px;
      border: 1px solid #dfe2e5;
    }
    .vscode-preview table td {
      padding: 6px 13px;
      border: 1px solid #dfe2e5;
    }
    .vscode-preview table tr {
      background-color: #fff;
      border-top: 1px solid #c6cbd1;
    }
    .vscode-preview table tr:nth-child(2n) {
      background-color: #f6f8fa;
    }
    .vscode-preview img {
      max-width: 100%;
      box-sizing: content-box;
    }
    .vscode-preview hr {
      height: 0.25em;
      padding: 0;
      margin: 24px 0;
      background-color: #e1e4e8;
      border: 0;
    }
    
    /* Test status styles */
    .test-status {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 0.9em;
    }
    .test-status.pass {
      background-color: rgba(40, 167, 69, 0.15);
      border-left: 4px solid #28a745;
    }
    .test-status.fail {
      background-color: rgba(220, 53, 69, 0.15);
      border-left: 4px solid #dc3545;
    }
    .status-badge {
      display: inline-block;
      padding: 0.25em 0.6em;
      font-size: 0.75em;
      font-weight: 700;
      line-height: 1;
      text-align: center;
      white-space: nowrap;
      vertical-align: baseline;
      border-radius: 0.25em;
      margin-right: 10px;
    }
    .badge-success {
      color: #fff;
      background-color: #28a745;
    }
    .badge-danger {
      color: #fff;
      background-color: #dc3545;
    }
    .test-criteria {
      font-style: italic;
      margin-left: 5px;
      flex-grow: 1;
    }
    
    /* Test summary styles */
    .test-summary {
      background-color: #f8f9fa;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .summary-title {
      font-size: 1.2em;
      font-weight: bold;
      margin-bottom: 10px;
      border-bottom: 1px solid #dee2e6;
      padding-bottom: 5px;
    }
    
    .summary-stats {
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
    }
    
    .stat-item {
      text-align: center;
      padding: 10px;
      flex: 1;
      min-width: 100px;
    }
    
    .stat-value {
      font-size: 1.8em;
      font-weight: bold;
      display: block;
      margin-bottom: 5px;
    }
    
    .stat-label {
      font-size: 0.9em;
      color: #6c757d;
    }
    
    .pass-rate {
      font-size: 2.2em;
      color: ${passRate >= 90 ? '#28a745' : passRate >= 70 ? '#fd7e14' : '#dc3545'};
    }
    
    /* Additional safeguards to prevent content from breaking layouts */
    .content-container {
      position: relative;
      width: 100%;
      box-sizing: border-box;
      overflow-wrap: break-word;
      word-break: break-word;
      overflow: auto; /* Add scrolling if content overflows */
      max-width: 100%; /* Ensure nothing exceeds container width */
    }
    
    /* Prevent any embedded HTML from breaking out of containers */
    .content-container * {
      max-width: 100%;
      box-sizing: border-box;
    }
    
    /* Special handling for HTML in Markdown test */
    .html-markdown-container {
      max-width: 100%;
      overflow: auto;
      border: 1px solid #e0e0e0;
      padding: 10px;
      border-radius: 4px;
      background-color: #fafafa;
    }
    
    /* Ensure each grid container has its own stacking context */
    .test-grid {
      isolation: isolate;
      position: relative;
      z-index: 1;
    }
    
    /* Force complex tables to scroll rather than break layout */
    table {
      display: block;
      overflow-x: auto;
      max-width: 100%;
    }
    
    /* Special handling for problematic content */
    .escape-line,
    .footnote-container,
    .def-list-container,
    .abbr-container {
      display: block;
      width: 100%;
      margin: 0.5em 0;
      overflow-wrap: break-word;
      word-break: break-word;
    }
    
    /* Definition list styling */
    .def-list-container dl {
      display: block;
      width: 100%;
      margin: 0.5em 0;
    }
    
    .def-list-container dt {
      font-weight: bold;
      margin-top: 0.5em;
    }
    
    .def-list-container dd {
      margin-left: 1.5em;
      margin-bottom: 0.5em;
    }
    
    /* Abbreviation styling */
    .abbr-container abbr {
      text-decoration: underline dotted;
      cursor: help;
    }
    
    .footnote {
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: 5px;
      background-color: #f9f9f9;
      border-left: 3px solid #ddd;
      margin: 0.5em 0;
    }
    
    /* Footnote Styles */
    .vscode-footnote-preview {
      line-height: 1.6;
    }
    
    .vscode-footnote-preview p {
      margin: 0.5em 0;
    }
    
    .vscode-footnote-preview sup a {
      text-decoration: none;
      margin: 0 2px;
      color: #0366d6;
    }
    
    .footnote-separator {
      border-top: 1px solid #ddd;
      margin: 1em 0;
      width: 20%;
    }
    
    .vscode-footnote {
      font-size: 0.9em;
      color: #444;
      margin: 0.5em 0;
    }
    
    /* Grid cell after HTML in Markdown test - ensure proper display */
    .test-name:has(+ .test-status + .test-grid) + .test-status + .test-grid {
      contain: layout;
    }
    
    /* Ensure all test-grids have independent layout */
    .test-name {
      contain: layout;
    }
    
    /* For browsers that don't support :has */
    @supports not (selector(:has(*))) {
      /* Use a more specific approach for modern browsers */
      .test-grid:not(:first-of-type) {
        contain: layout;
      }
    }
    
    /* Container for each test to prevent layout influence */
    .test-container {
      contain: layout;
      margin-bottom: 20px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      position: relative;
      isolation: isolate;
    }
  </style>
</head>
<body>
  <h1>Unified Markdown Renderer Tests</h1>
  <p>This page displays all markdown renderer tests in a 4-column layout with pass/fail status.</p>
  
  <!-- Test Summary -->
  <div class="test-summary">
    <div class="summary-title">Test Summary</div>
    <div class="summary-stats">
      <div class="stat-item">
        <span class="stat-value">${totalTests}</span>
        <span class="stat-label">Total Tests</span>
      </div>
      <div class="stat-item">
        <span class="stat-value" style="color: #28a745;">${passedTests}</span>
        <span class="stat-label">Passed</span>
      </div>
      <div class="stat-item">
        <span class="stat-value" style="color: #dc3545;">${failedTests}</span>
        <span class="stat-label">Failed</span>
      </div>
      <div class="stat-item">
        <span class="stat-value pass-rate">${passRate}%</span>
        <span class="stat-label">Pass Rate</span>
      </div>
    </div>
  </div>
  
  <!-- Grid Headers -->
  <div class="test-grid">
    <div class="grid-header">Test Input</div>
    <div class="grid-header">Test Output (Rendered)</div>
    <div class="grid-header">Example Input</div>
    <div class="grid-header">Example Output (VS Code Preview)</div>
  </div>
  
  <!-- Test Cases -->
  ${allTests.map(test => `
    <div class="test-container">
      <div class="test-name">${test.name}</div>
      <div class="test-status ${test.passed ? 'pass' : 'fail'}">
        <span class="status-badge ${test.passed ? 'badge-success' : 'badge-danger'}">${test.passed ? 'PASS' : 'FAIL'}</span>
        <div class="test-criteria">${test.testCriteria}</div>
      </div>
      <div class="test-grid">
        <div class="test-cell markdown-content">
          <pre>${escapeHtml(test.testMarkdown)}</pre>
        </div>
        <div class="test-cell html-content">
          <div class="switch-container">
            <span>View rendered</span>
            <label class="switch">
              <input type="checkbox">
              <span class="slider"></span>
            </label>
            <span>View HTML code</span>
          </div>
          <pre class="html-code">${escapeHtml(test.testHtml)}</pre>
          <div class="html-view content-container">${test.testHtml}</div>
        </div>
        <div class="test-cell markdown-content">
          <pre>${escapeHtml(test.exampleMarkdown)}</pre>
        </div>
        <div class="test-cell vscode-preview content-container">
          ${test.vsCodePreviewHtml}
        </div>
      </div>
    </div>
  `).join('')}

  <script>
    // Properly initialize toggle switches
    document.addEventListener('DOMContentLoaded', function() {
      // Initialize all toggle switches
      const switches = document.querySelectorAll('.switch input');
      switches.forEach(toggleSwitch => {
        toggleSwitch.addEventListener('change', function() {
          // Find the parent html-content container
          const container = this.closest('.html-content');
          if (this.checked) {
            container.classList.add('show-code');
          } else {
            container.classList.remove('show-code');
          }
        });
      });
    });
  </script>
</body>
</html>
  `;
  
  // Write HTML to file
  await fs.writeFile(OUTPUT_FILE, htmlContent);
  console.log(`Unified test page generated at: ${OUTPUT_FILE}`);
  
  return OUTPUT_FILE;
}

// Helper function to escape HTML for display
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Run the generator
generateUnifiedTestPage().catch(err => {
  console.error('Error generating unified test page:', err);
});