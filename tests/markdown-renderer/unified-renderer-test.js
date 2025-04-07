/**
 * Simplified Unified Test Page for Markdown Renderer
 * Displays individual test cases for each Markdown feature
 * with input and output shown side by side for each feature
 */
const MarkdownRenderer = require('../../src/renderer/markdown');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

// Configure output
const OUTPUT_DIR = path.join(__dirname, '../results');
const OUTPUT_FILE = path.join(OUTPUT_DIR, '@test-results.html');

// Create a renderer with default settings
const renderer = new MarkdownRenderer({
  highlight: true,
  loadLanguages: true,
  dynamicFileTypes: {}
});

// Define individual test cases for each Markdown feature
const TEST_CASES = [
  {
    name: 'Headings',
    description: 'Markdown supports six levels of headings using # symbols',
    markdown: `# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6`,
    criteria: 'All six heading levels should be rendered with appropriate h1-h6 tags'
  },
  {
    name: 'Basic Formatting',
    description: 'Styling text with italic, bold, and strikethrough',
    markdown: `Regular paragraph with *italic*, **bold**, and ***bold italic*** text.
Also _italic_, __bold__, and ___bold italic___ using underscores.
~~Strikethrough~~ is also supported.`,
    criteria: 'Text should be properly styled with em, strong, and del tags'
  },
  {
    name: 'Unordered Lists',
    description: 'Creating bulleted lists with *, -, or + symbols',
    markdown: `* Item 1
* Item 2
  * Nested item 1
  * Nested item 2
* Item 3

- Alternative item 1
- Alternative item 2

+ Another alternative item 1
+ Another alternative item 2`,
    criteria: 'Lists should be rendered with ul and li tags, including proper nesting'
  },
  {
    name: 'Ordered Lists',
    description: 'Creating numbered lists with automatic numbering',
    markdown: `1. First item
2. Second item
   1. Nested item 1
   2. Nested item 2
3. Third item`,
    criteria: 'Numbered lists should be rendered with ol and li tags with proper nesting'
  },
  {
    name: 'Task Lists',
    description: 'GitHub-flavored Markdown task lists with checkboxes',
    markdown: `- [x] Completed task
- [ ] Incomplete task
- [x] Another completed task
  - [ ] Nested task`,
    criteria: 'Task lists should include checkboxes (may require extension support)'
  },
  {
    name: 'Inline Code',
    description: 'Inline code with backticks',
    markdown: `Use \`inline code\` to refer to code within text.

The \`console.log()\` function outputs to the console.`,
    criteria: 'Inline code should be wrapped in code tags'
  },
  {
    name: 'Code Blocks',
    description: 'Code blocks with triple backticks and optional language specification',
    markdown: `\`\`\`javascript
// Code block with syntax highlighting
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet('World'));
\`\`\`

\`\`\`python
# Python example
def greet(name):
    return f"Hello, {name}!"
    
print(greet("World"))
\`\`\`

\`\`\`
Plain code block without language specification
No syntax highlighting applied
\`\`\``,
    criteria: 'Code blocks should be rendered with pre and code tags, with optional language-specific highlighting'
  },
  {
    name: 'Blockquotes',
    description: 'Block quotations using > symbols',
    markdown: `> This is a blockquote
> spanning multiple lines
>
> > And a nested blockquote
> > with multiple lines
>
> Back to the first level`,
    criteria: 'Blockquotes should use blockquote tags, supporting nesting'
  },
  {
    name: 'Links',
    description: 'Various ways to create hyperlinks',
    markdown: `[Link to example](https://example.com "Example Website")

<https://example.com> - Automatic URL linking

[Reference link][ref-link]

[ref-link]: https://example.com "Reference Link"`,
    criteria: 'Links should be rendered as a tags with proper href attributes'
  },
  {
    name: 'Images',
    description: 'Embedding images with alt text and optional title',
    markdown: `![FileToMarkdown Logo](https://raw.githubusercontent.com/jojomondag/MyLogo/5785b2f3063c9a9bd49cd7f45a3504a297586122/logo.png "FileToMarkdown Logo")

![FileToMarkdown Logo with Size](https://raw.githubusercontent.com/jojomondag/MyLogo/5785b2f3063c9a9bd49cd7f45a3504a297586122/logo.png "Project Logo")`,
    criteria: 'Images should be rendered as img tags with src and alt attributes'
  },
  {
    name: 'Tables',
    description: 'Creating tables with alignment options',
    markdown: `| Header 1 | Header 2 | Header 3 |
|:---------|:--------:|---------:|
| Left     | Center   | Right    |
| aligned  | aligned  | aligned  |
| text     | text     | text     |`,
    criteria: 'Tables should be rendered with table, tr, th, and td elements with appropriate alignment'
  },
  {
    name: 'Horizontal Rule',
    description: 'Creating horizontal dividers with --- or *** or ___',
    markdown: `Content above

---

Content between rules

***

Content below

___

Final content`,
    criteria: 'Horizontal rules should be rendered as hr elements'
  },
  {
    name: 'HTML Embedding',
    description: 'Embedding raw HTML within Markdown',
    markdown: `<div style="padding: 10px; border: 1px solid #ccc;">
  <p>This is embedded <em>HTML</em> content</p>
  <ul>
    <li>HTML list item 1</li>
    <li>HTML list item 2</li>
  </ul>
</div>`,
    criteria: 'Raw HTML should be preserved in the output'
  },
  {
    name: 'Footnotes',
    description: 'Adding footnotes with reference links',
    markdown: `Here's a sentence with a footnote[^1] and another footnote[^2].

[^1]: This is the first footnote content.
[^2]: This is the second footnote content with multiple paragraphs.

    Indent paragraphs to include them in the footnote.

    Like this paragraph.`,
    criteria: 'Footnotes should be properly linked and rendered at the bottom of the content'
  },
  {
    name: 'Subscript and Superscript',
    description: 'Text formatting for scientific notation',
    markdown: `H~2~O is the formula for water.

E = mc^2^ is Einstein's famous equation.

This feature requires ~subscript~ and ^superscript^ extensions.`,
    criteria: 'Subscript should use sub tags and superscript should use sup tags'
  },
  {
    name: 'Highlighted Text',
    description: 'Highlighting important text',
    markdown: `This is ==highlighted text== that stands out.

Use ==highlighting== to draw attention to specific parts.`,
    criteria: 'Highlighted text should be wrapped in mark tags'
  },
  {
    name: 'Math Expressions',
    description: 'LaTeX-style mathematical expressions',
    markdown: `Inline math: $E = mc^2$

Block math:

$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

Another formula:

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$`,
    criteria: 'Math expressions should be properly rendered (may require extension support)'
  },
  {
    name: 'Diagrams (Mermaid)',
    description: 'Creating diagrams with Mermaid syntax',
    markdown: `\`\`\`mermaid
graph TD;
    A[Start] -->|Process| B[End];
    A -->|Alternative| C[Result];
    B -->D[Finish];
    C -->D;
\`\`\`

\`\`\`mermaid
sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
\`\`\``,
    criteria: 'Mermaid diagrams should be rendered (may require extension support)'
  }
];

// Function to determine if a test passes
function evaluateTest(testCase, renderedHtml) {
  const html = renderedHtml.toLowerCase();
  const name = testCase.name.toLowerCase();

  switch(name) {
    case 'headings':
      return (
        html.includes('<h1>') && 
        html.includes('<h2>') && 
        html.includes('<h3>') && 
        html.includes('<h4>') && 
        html.includes('<h5>') && 
        html.includes('<h6>')
      );
    
    case 'basic formatting':
      return (
        html.includes('<em>') && 
        html.includes('<strong>') && 
        html.includes('<del>')
      );
    
    case 'unordered lists':
      return (
        html.includes('<ul>') && 
        html.includes('<li>') && 
        // Check for nested list
        html.match(/<ul>[\s\S]*?<ul>[\s\S]*?<\/ul>[\s\S]*?<\/ul>/)
      );
    
    case 'ordered lists':
      return (
        html.includes('<ol>') && 
        html.includes('<li>') && 
        // Check for nested list
        html.match(/<ol>[\s\S]*?<ol>[\s\S]*?<\/ol>[\s\S]*?<\/ol>/)
      );
    
    case 'task lists':
      return (
        html.includes('type="checkbox"') || 
        html.includes('class="task-list-item"')
      );
    
    case 'inline code':
      return html.includes('<code>');
    
    case 'code blocks':
      return (
        html.includes('<pre>') && 
        html.includes('<code>') &&
        // Check for language-specific class
        (html.includes('class="language-javascript"') || html.includes('class="javascript"'))
      );
    
    case 'blockquotes':
      return (
        html.includes('<blockquote>') && 
        // Check for nested blockquote
        html.match(/<blockquote>[\s\S]*?<blockquote>[\s\S]*?<\/blockquote>[\s\S]*?<\/blockquote>/)
      );
    
    case 'links':
      return html.includes('<a href=');
    
    case 'images':
      return (
        html.includes('<img') && 
        html.includes('src=') && 
        html.includes('alt=')
      );
    
    case 'tables':
      return (
        html.includes('<table>') && 
        html.includes('<tr>') && 
        html.includes('<th>') && 
        html.includes('<td>')
      );
    
    case 'horizontal rule':
      return html.includes('<hr');
    
    case 'html embedding':
      return (
        html.includes('style="padding: 10px; border: 1px solid #ccc;"') || 
        (html.includes('<div') && html.includes('<ul>') && html.includes('<li>'))
      );
    
    case 'footnotes':
      // More precise check for footnotes - should have both references and actual footnote elements
      return (
        // Check for footnote references in the content
        (html.includes('class="footnote-ref"') || html.includes('id="fn-') || html.includes('href="#fn')) &&
        // Check for the actual footnote section/definitions
        (html.includes('class="footnote"') || html.includes('class="footnotes"') || html.includes('id="footnote'))
      );
    
    case 'subscript and superscript':
      return (
        html.includes('<sub>') || 
        html.includes('<sup>')
      );
    
    case 'highlighted text':
      return html.includes('<mark>');
    
    case 'math expressions':
      // More accurate check for math expressions - look for proper math rendering elements
      return (
        // Check for KaTeX or MathJax rendered elements
        html.includes('class="math"') || 
        html.includes('class="katex"') || 
        html.includes('class="mathjax"') ||
        // Check for math delimiters with actual rendering (not just text)
        (html.includes('$') && (
          html.includes('<span class="math-inline"') || 
          html.includes('<div class="math-block"') ||
          html.includes('<annotation')
        ))
      );
    
    case 'diagrams (mermaid)':
      // More accurate check for actual mermaid diagram rendering
      // Check for common elements of rendered diagrams beyond just the word "mermaid"
      return (
        // Check for a div with mermaid class that would be created by the renderer
        html.includes('<div class="mermaid"') ||
        // Check for a rendered SVG (which would indicate the diagram was processed)
        (html.includes('mermaid') && html.includes('<svg')) ||
        // Check for mermaid-specific diagram elements
        (html.includes('mermaid') && 
         (html.includes('class="node"') || 
          html.includes('class="cluster"') ||
          html.includes('class="flowchart') ||
          html.includes('class="sequence')))
      );
    
    default:
      return html.length > 0; // Default case - passed if we got any output
  }
}

async function generateUnifiedTestPage() {
  console.log('Generating simplified unified test page...');
  
  // Create output directory if it doesn't exist
  if (!fsSync.existsSync(OUTPUT_DIR)) {
    fsSync.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Remove any existing test-results.html file (without @ prefix)
  const legacyFile = path.join(OUTPUT_DIR, 'test-results.html');
  if (fsSync.existsSync(legacyFile)) {
    try {
      fsSync.unlinkSync(legacyFile);
      console.log(`Removed legacy file: ${legacyFile}`);
    } catch (err) {
      console.warn(`Warning: Could not remove legacy file: ${err.message}`);
    }
  }
  
  // Track overall test statistics
  const testStats = {
    total: TEST_CASES.length,
    passed: 0,
    failed: 0
  };

  // Generate content for each test case
  const testSectionsHtml = TEST_CASES.map(testCase => {
    const renderedHtml = renderer.render(testCase.markdown);
    
    // Evaluate test success
    const passed = evaluateTest(testCase, renderedHtml);
    
    // Update statistics
    if (passed) {
      testStats.passed++;
    } else {
      testStats.failed++;
    }
    
    return `
    <div class="test-section ${passed ? 'test-passed' : 'test-failed'}" id="test-${testCase.name.toLowerCase().replace(/\s+/g, '-')}">
      <div class="test-status">
        <span class="status-badge ${passed ? 'status-pass' : 'status-fail'}">${passed ? 'PASSED' : 'FAILED'}</span>
        <h2 class="feature-title">${testCase.name}</h2>
      </div>
      <p class="feature-description">${testCase.description}</p>
      <p class="test-criteria"><strong>Success Criteria:</strong> ${testCase.criteria}</p>
      <div class="test-container">
        <div class="test-input">
          <div class="section-header">Markdown Input</div>
          <pre><code>${escapeHtml(testCase.markdown)}</code></pre>
        </div>
        <div class="test-output">
          <div class="section-header">HTML Output</div>
          ${renderedHtml}
        </div>
      </div>
    </div>
    <hr class="section-divider">`;
  }).join('\n');
  
  // Generate navigation for test cases with pass/fail indicators
  const navigationHtml = `
  <div class="test-navigation">
    <h3>Jump to Feature:</h3>
    <ul class="nav-list">
      ${TEST_CASES.map((testCase, index) => {
        // Determine if this specific test passed by evaluating it directly
        const renderedHtml = renderer.render(testCase.markdown);
        const passed = evaluateTest(testCase, renderedHtml);
        
        return `<li class="${passed ? 'nav-passed' : 'nav-failed'}">
          <a href="#test-${testCase.name.toLowerCase().replace(/\s+/g, '-')}">
            <span class="nav-status-dot ${passed ? 'dot-pass' : 'dot-fail'}"></span>
            ${testCase.name}
          </a>
        </li>`;
      }).join('\n      ')}
    </ul>
  </div>`;
  
  // Generate test summary statistics
  const passRate = Math.round((testStats.passed / testStats.total) * 100);
  const summaryHtml = `
  <div class="test-summary">
    <div class="summary-stats">
      <div class="stat-box">
        <div class="stat-value">${testStats.total}</div>
        <div class="stat-label">Total Tests</div>
      </div>
      <div class="stat-box stat-passed">
        <div class="stat-value">${testStats.passed}</div>
        <div class="stat-label">Passed</div>
      </div>
      <div class="stat-box stat-failed">
        <div class="stat-value">${testStats.failed}</div>
        <div class="stat-label">Failed</div>
      </div>
      <div class="stat-box ${passRate > 80 ? 'stat-passed' : passRate > 60 ? 'stat-warning' : 'stat-failed'}">
        <div class="stat-value stat-percentage">${passRate}%</div>
        <div class="stat-label">Pass Rate</div>
      </div>
    </div>
  </div>`;
  
  // Construct the HTML test page with improved layout
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FileToMarkdown - Renderer Test</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    header {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    h1 {
      color: #2c3e50;
      margin-top: 0;
    }
    .summary {
      background-color: #e8f5e9;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 30px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .summary h2 {
      margin-top: 0;
      color: #2e7d32;
    }
    .test-summary {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .summary-stats {
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      gap: 15px;
    }
    .stat-box {
      flex: 1;
      min-width: 120px;
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 5px;
      color: #345;
    }
    .stat-label {
      font-size: 0.9rem;
      color: #666;
    }
    .stat-passed {
      background-color: #e8f5e9;
    }
    .stat-passed .stat-value {
      color: #2e7d32;
    }
    .stat-warning {
      background-color: #fff8e1;
    }
    .stat-warning .stat-value {
      color: #f57c00;
    }
    .stat-failed {
      background-color: #ffebee;
    }
    .stat-failed .stat-value {
      color: #c62828;
    }
    .stat-percentage {
      font-size: 2.8rem;
    }
    .test-navigation {
      background-color: #fff;
      padding: 15px 20px;
      border-radius: 8px;
      margin: 0 0 30px 0;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .nav-list {
      list-style-type: none;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .nav-list li {
      background-color: #f0f4f8;
      border-radius: 4px;
    }
    .nav-passed {
      background-color: #e8f5e9 !important;
    }
    .nav-failed {
      background-color: #ffebee !important;
    }
    .nav-status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 5px;
    }
    .dot-pass {
      background-color: #2e7d32;
    }
    .dot-fail {
      background-color: #c62828;
    }
    .nav-list a {
      display: flex;
      align-items: center;
      padding: 5px 10px;
      text-decoration: none;
      color: #345;
      transition: all 0.2s;
    }
    .nav-list a:hover {
      background-color: #5c6bc0;
      color: white;
      border-radius: 4px;
    }
    .nav-list a:hover .nav-status-dot {
      background-color: white;
    }
    .test-section {
      background-color: #fff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      border-top: 4px solid #5c6bc0;
    }
    .test-passed {
      border-top-color: #2e7d32;
    }
    .test-failed {
      border-top-color: #c62828;
    }
    .test-status {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 4px;
      margin-right: 15px;
      font-weight: bold;
      font-size: 0.8rem;
      color: white;
    }
    .status-pass {
      background-color: #2e7d32;
    }
    .status-fail {
      background-color: #c62828;
    }
    .feature-title {
      color: #2c3e50;
      margin: 0;
    }
    .feature-description {
      color: #666;
      font-style: italic;
      margin-bottom: 10px;
    }
    .test-criteria {
      background-color: #f5f5f5;
      padding: 10px 15px;
      border-radius: 4px;
      margin-bottom: 20px;
      border-left: 4px solid #5c6bc0;
    }
    .test-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 25px;
      margin-bottom: 20px;
    }
    .test-input, .test-output {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      overflow: auto;
      background-color: #fff;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      max-height: 500px;
    }
    .test-input {
      background-color: #f8f9fa;
    }
    .test-output {
      background-color: #fff;
    }
    .section-header {
      background-color: #f0f4f8;
      padding: 10px 15px;
      border-radius: 5px;
      margin: 0 0 20px 0;
      font-weight: bold;
      color: #345;
      border-left: 4px solid #5c6bc0;
    }
    .section-divider {
      border: 0;
      height: 1px;
      background-color: #eee;
      margin: 0 0 30px 0;
      display: none; /* Hide dividers between sections since we're using cards */
    }
    pre {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 6px;
      overflow-x: auto;
      border: 1px solid #e0e0e0;
      margin: 0;
    }
    code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      font-size: 0.9em;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .timestamp {
      font-size: 0.9em;
      color: #777;
    }
    .meta-info {
      margin-top: 20px;
      font-size: 0.9em;
      color: #666;
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 5px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 15px 0;
    }
    table, th, td {
      border: 1px solid #ddd;
    }
    th, td {
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    blockquote {
      border-left: 4px solid #ccc;
      margin-left: 0;
      padding: 10px 20px;
      color: #555;
      background-color: #f9f9f9;
      border-radius: 0 5px 5px 0;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 15px auto;
      border-radius: 5px;
    }
    hr {
      border: 0;
      height: 1px;
      background-color: #ddd;
      margin: 25px 0;
    }
    /* Styles for admonitions */
    .admonition {
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .admonition-title {
      font-weight: bold;
      margin-top: 0;
    }
    .admonition.note {
      background-color: #e8f4fd;
      border-left: 4px solid #4a87c5;
    }
    .admonition.warning {
      background-color: #fff8e6;
      border-left: 4px solid #f0ad4e;
    }
    .admonition.danger {
      background-color: #fde8e8;
      border-left: 4px solid #d9534f;
    }
    /* Math expressions */
    .math-inline, .math-block {
      font-family: 'KaTeX_Math', 'Times New Roman', serif;
    }
    .math-block {
      display: block;
      text-align: center;
      margin: 1em 0;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 5px;
    }
    /* Task lists */
    .task-list-item {
      list-style-type: none;
      margin-left: -20px;
    }
    .task-list-item-checkbox {
      margin-right: 8px;
    }
    /* Footnotes */
    .footnote {
      font-size: 0.9em;
      color: #555;
      border-top: 1px solid #eee;
      padding-top: 15px;
      margin-top: 30px;
    }
    .footnote-ref {
      vertical-align: super;
      font-size: 0.8em;
      color: #0066cc;
      text-decoration: none;
    }
    /* Diagrams */
    .mermaid-diagram {
      text-align: center;
      background: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      border: 1px solid #eee;
    }
    /* Highlighted text */
    mark {
      background-color: #fff59d;
      padding: 2px 4px;
      border-radius: 3px;
    }
    /* Code blocks with syntax highlighting improvements */
    .language-javascript {
      color: #333;
    }
    .language-javascript .keyword {
      color: #07a;
    }
    .language-javascript .string {
      color: #690;
    }
    .language-javascript .function {
      color: #dd4a68;
    }
    .language-javascript .comment {
      color: #999;
    }
    /* Improved responsive design */
    @media (max-width: 768px) {
      .test-container {
        grid-template-columns: 1fr;
      }
      .test-input, .test-output {
        max-height: 400px;
      }
      .nav-list {
        flex-direction: column;
      }
      .summary-stats {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>FileToMarkdown - Renderer Test</h1>
    <p>This page demonstrates the rendering capabilities of the FileToMarkdown renderer</p>
  </header>

  <div class="summary">
    <h2>Test Summary</h2>
    <p>This test demonstrates the conversion of various Markdown features to HTML using the FileToMarkdown renderer. Each section below shows a specific Markdown feature with its input and rendered output side by side.</p>
    <div class="meta-info">
      <div><strong>Test Run:</strong> ${new Date().toLocaleString()}</div>
      <div><strong>Test File:</strong> @test-results.html</div>
      <div><strong>Renderer Version:</strong> ${require('../../package.json').version}</div>
      <div><strong>Total Features Tested:</strong> ${TEST_CASES.length}</div>
    </div>
  </div>

  ${summaryHtml}
  
  ${navigationHtml}
  
  ${testSectionsHtml}

  <div class="footer">
    <p>Generated by FileToMarkdown Test Suite</p>
    <p class="timestamp">Generated on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `;
  
  // Write the HTML to the output file
  await fs.writeFile(OUTPUT_FILE, htmlContent);
  console.log(`Test page generated at ${OUTPUT_FILE}`);
  
  // Log test results to console
  console.log(`\nTest Results Summary:`);
  console.log(`Total: ${testStats.total}`);
  console.log(`Passed: ${testStats.passed}`);
  console.log(`Failed: ${testStats.failed}`);
  console.log(`Pass Rate: ${passRate}%\n`);
  
  return OUTPUT_FILE;
}

// Function to escape HTML for display
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Execute the test
generateUnifiedTestPage().catch(err => console.error('Error generating test page:', err)); 