/**
 * Comprehensive test suite for the Markdown renderer
 * Tests each Markdown feature individually and reports detailed results
 */
const MarkdownRenderer = require('../src/renderer/markdown');
const { getFileTypes, getFileTypeDescriptions } = require('../src/index');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

// Test suite configuration
const CONFIG = {
  outputDir: path.join(__dirname, 'test-results'),
  individualTests: true,
  createHtmlReport: true,
  testLanguages: true
};

// Collection of test cases for each Markdown feature
const TEST_CASES = [
  {
    name: 'Headings',
    markdown: `# Heading 1\n## Heading 2\n### Heading 3\n#### Heading 4\n##### Heading 5\n###### Heading 6`,
    checkFunction: html => ({
      passed: html.includes('<h1>') && html.includes('<h2>') && html.includes('<h3>') 
             && html.includes('<h4>') && html.includes('<h5>') && html.includes('<h6>'),
      details: 'Checks for all heading levels h1-h6'
    })
  },
  {
    name: 'Paragraph',
    markdown: `This is a simple paragraph.\n\nThis is another paragraph with multiple sentences. It should be properly rendered.`,
    checkFunction: html => ({
      passed: html.includes('<p>This is a simple paragraph.</p>'),
      details: 'Checks for proper paragraph rendering'
    })
  },
  {
    name: 'Emphasis',
    markdown: `*Italic text* and _also italic_\n\n**Bold text** and __also bold__\n\n***Bold and italic*** and ___also bold and italic___`,
    checkFunction: html => ({
      passed: html.includes('<em>') && html.includes('<strong>') && html.includes('<strong><em>'),
      details: 'Checks for italic, bold, and combined formatting'
    })
  },
  {
    name: 'Strikethrough',
    markdown: `~~Strikethrough text~~`,
    checkFunction: html => ({
      passed: html.includes('<del>Strikethrough text</del>'),
      details: 'Checks for strikethrough formatting'
    })
  },
  {
    name: 'Blockquotes',
    markdown: `> Simple blockquote\n\n> Multi-line blockquote\n> second line\n\n> Nested blockquote\n>> Nested level 2`,
    checkFunction: html => ({
      passed: html.includes('<blockquote>') && html.includes('Nested level 2'),
      details: 'Checks for blockquotes including nested ones'
    })
  },
  {
    name: 'Unordered Lists',
    markdown: `* Item 1\n* Item 2\n  * Nested item 1\n  * Nested item 2\n* Item 3\n\n- Alternate 1\n- Alternate 2\n\n+ Another alternate 1\n+ Another alternate 2`,
    checkFunction: html => ({
      passed: html.includes('<ul>') && html.includes('<li>') && html.includes('Nested item'),
      details: 'Checks for unordered lists with nesting and different markers'
    })
  },
  {
    name: 'Ordered Lists',
    markdown: `1. Item 1\n2. Item 2\n   1. Nested item 1\n   2. Nested item 2\n3. Item 3`,
    checkFunction: html => ({
      passed: html.includes('<ol>') && html.includes('<li>') && html.includes('Nested item'),
      details: 'Checks for ordered lists with nesting'
    })
  },
  {
    name: 'Task Lists',
    markdown: `- [x] Completed task\n- [ ] Incomplete task`,
    checkFunction: html => {
      const hasCheckboxes = html.includes('type="checkbox"') || 
                           (html.includes('task-list-item') && html.includes('checked'));
      return {
        passed: hasCheckboxes,
        details: 'Checks for task lists with checkboxes (may vary by markdown implementation)'
      };
    }
  },
  {
    name: 'Inline Code',
    markdown: '`This is inline code`',
    checkFunction: html => ({
      passed: html.includes('<code>') && html.includes('This is inline code'),
      details: 'Checks for inline code formatting'
    })
  },
  {
    name: 'Code Blocks',
    markdown: '```\nPlain code block\nSecond line\n```',
    checkFunction: html => ({
      passed: html.includes('<pre>') && html.includes('<code>') && html.includes('Plain code block'),
      details: 'Checks for code block without syntax highlighting'
    })
  },
  {
    name: 'Syntax Highlighting',
    markdown: '```javascript\nfunction test() {\n  return "Hello world!";\n}\n```',
    checkFunction: html => ({
      passed: html.includes('language-javascript') || html.includes('class="javascript"'),
      details: 'Checks for code block with JavaScript syntax highlighting'
    })
  },
  {
    name: 'Horizontal Rules',
    markdown: `Above rule\n\n---\n\nBetween rules\n\n***\n\nBelow rule\n\n___`,
    checkFunction: html => ({
      passed: html.includes('<hr') && html.match(/<hr/g).length >= 3,
      details: 'Checks for horizontal rules with different syntax'
    })
  },
  {
    name: 'Links',
    markdown: `[Basic link](https://example.com)\n\n[Link with title](https://example.com "Example")\n\n<https://example.com>\n\n<user@example.com>`,
    checkFunction: html => ({
      passed: html.includes('<a href="https://example.com">') && 
              html.includes('title="Example"') && 
              html.includes('user@example.com'),
      details: 'Checks for different types of links'
    })
  },
  {
    name: 'Reference Links',
    markdown: `[Reference link][ref]\n\n[ref]: https://example.com "Reference"`,
    checkFunction: html => ({
      passed: html.includes('href="https://example.com"') && html.includes('Reference link'),
      details: 'Checks for reference-style links'
    })
  },
  {
    name: 'Images',
    markdown: `![Alt text](https://example.com/image.jpg "Image title")`,
    checkFunction: html => ({
      passed: html.includes('<img') && 
              html.includes('src="https://example.com/image.jpg"') && 
              html.includes('alt="Alt text"'),
      details: 'Checks for image rendering'
    })
  },
  {
    name: 'Tables',
    markdown: `| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n| Cell 3   | Cell 4   |`,
    checkFunction: html => ({
      passed: html.includes('<table>') && 
              html.includes('<th>') && 
              html.includes('<tr>') && 
              html.includes('<td>'),
      details: 'Checks for table rendering'
    })
  },
  {
    name: 'Table Alignment',
    markdown: `| Left | Center | Right |\n|:-----|:------:|------:|\n| A    | B      | C     |`,
    checkFunction: html => {
      const hasTable = html.includes('<table>');
      const hasAlignment = html.includes('align="left"') || 
                          html.includes('align="center"') || 
                          html.includes('align="right"') ||
                          html.includes('style="text-align:') ||
                          html.includes('class="text-'); // Some renderers use classes
      return {
        passed: hasTable && hasAlignment,
        details: 'Checks for table alignment (implementation varies)'
      };
    }
  },
  {
    name: 'HTML in Markdown',
    markdown: `<div class="custom">\n  <p>HTML content</p>\n</div>`,
    checkFunction: html => ({
      passed: html.includes('<div class="custom">') && html.includes('<p>HTML content</p>'),
      details: 'Checks for HTML content within Markdown'
    })
  },
  {
    name: 'Escape Characters',
    markdown: `\\*not italic\\*\n\n\\\`not code\\\`\n\n\\[not link\\]`,
    checkFunction: html => ({
      passed: html.includes('*not italic*') && !html.includes('<em>not italic</em>'),
      details: 'Checks for proper escaping of special characters'
    })
  }
];

// Additional advanced tests that may not be supported by all Markdown implementations
const ADVANCED_TEST_CASES = [
  {
    name: 'Footnotes',
    markdown: `Text with a footnote[^1].\n\n[^1]: Footnote content.`,
    checkFunction: html => {
      const hasFootnoteRef = html.includes('class="footnote"') || 
                            html.includes('id="fn') || 
                            html.includes('href="#fn');
      return {
        passed: hasFootnoteRef,
        details: 'Checks for footnote support (not available in all Markdown implementations)'
      };
    }
  },
  {
    name: 'Definition Lists',
    markdown: `Term 1\n: Definition 1\n\nTerm 2\n: Definition 2a\n: Definition 2b`,
    checkFunction: html => {
      const hasDefList = html.includes('<dl>') && 
                         html.includes('<dt>') && 
                         html.includes('<dd>');
      return {
        passed: hasDefList,
        details: 'Checks for definition list support (not available in all Markdown implementations)'
      };
    }
  },
  {
    name: 'Abbreviations',
    markdown: `*[HTML]: Hyper Text Markup Language\n\nThe HTML specification.`,
    checkFunction: html => {
      const hasAbbr = html.includes('<abbr') || html.includes('title="Hyper Text Markup Language"');
      return {
        passed: hasAbbr,
        details: 'Checks for abbreviation support (not available in all Markdown implementations)'
      };
    }
  },
  {
    name: 'Subscript and Superscript',
    markdown: `H~2~O and X^2^`,
    checkFunction: html => {
      const hasSub = html.includes('<sub>') || html.includes('class="subscript"');
      const hasSup = html.includes('<sup>') || html.includes('class="superscript"');
      return {
        passed: hasSub || hasSup,
        details: 'Checks for subscript/superscript support (not available in all Markdown implementations)'
      };
    }
  },
  {
    name: 'Emoji',
    markdown: `:smile: :heart: :+1:`,
    checkFunction: html => {
      const hasEmoji = html.includes('😄') || html.includes('❤️') || html.includes('👍') || 
                      html.includes('emoji') || html.includes(':smile:');
      return {
        passed: hasEmoji,
        details: 'Checks for emoji support (implementation varies)'
      };
    }
  },
  {
    name: 'Highlighting',
    markdown: `==Highlighted text==`,
    checkFunction: html => {
      const hasHighlight = html.includes('<mark>') || 
                          html.includes('class="highlight"') || 
                          html.includes('style="background-color:');
      return {
        passed: hasHighlight,
        details: 'Checks for text highlighting support (not available in all Markdown implementations)'
      };
    }
  }
];

// Create an array of language test cases
function createLanguageTests() {
  // Try to get supported languages from the package
  const fileTypes = getFileTypes();
  const descriptions = getFileTypeDescriptions();
  
  const languageTests = [];
  
  // Add tests for common languages regardless of file types
  const commonLanguages = [
    'javascript', 'python', 'java', 'csharp', 'cpp', 
    'css', 'html', 'bash', 'sql', 'typescript'
  ];
  
  // Add tests for each common language
  commonLanguages.forEach(lang => {
    languageTests.push({
      name: `Syntax Highlighting - ${lang}`,
      markdown: '```' + lang + '\n// Example code in ' + lang + '\nfunction example() { }\n```',
      checkFunction: html => ({
        passed: html.includes(`language-${lang}`) || html.includes(`class="${lang}"`),
        details: `Checks syntax highlighting for ${lang}`
      })
    });
  });
  
  // Add tests for file types from the package
  if (fileTypes && fileTypes.length > 0) {
    // Create a test for each file type that might have syntax highlighting
    fileTypes.forEach(ext => {
      // Skip types we've already tested
      if (commonLanguages.includes(ext)) return;
      
      // Skip non-code file types
      const desc = descriptions[ext] || '';
      if (desc.includes('Document') || ext === 'pdf' || ext === 'docx' || ext === 'xlsx') return;
      
      languageTests.push({
        name: `Syntax Highlighting - ${ext}`,
        markdown: '```' + ext + '\n// Example code in ' + ext + '\nfunction example() { }\n```',
        checkFunction: html => ({
          passed: html.includes(`language-${ext}`) || html.includes(`class="${ext}"`),
          details: `Checks syntax highlighting for ${ext} files`
        })
      });
    });
  }
  
  return languageTests;
}

// Helper function to create HTML report
async function createHtmlReport(results) {
  let htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Markdown Renderer Test Results</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
      }
      .test-results {
        margin-top: 20px;
      }
      .test-case {
        margin-bottom: 15px;
        padding: 15px;
        border-radius: 5px;
      }
      .passed {
        background-color: #e6ffe6;
        border-left: 5px solid #4CAF50;
      }
      .failed {
        background-color: #ffebeb;
        border-left: 5px solid #f44336;
      }
      .unsupported {
        background-color: #e6f3ff;
        border-left: 5px solid #2196F3;
      }
      .test-name {
        font-weight: bold;
        margin-bottom: 5px;
      }
      .test-details {
        margin-top: 5px;
        font-size: 0.9em;
        color: #666;
      }
      .test-input, .test-output {
        margin-top: 10px;
        padding: 10px;
        background-color: #f8f8f8;
        border-radius: 4px;
        overflow-x: auto;
      }
      .test-output {
        border-left: 3px solid #9E9E9E;
      }
      .summary {
        margin-bottom: 20px;
        font-size: 1.1em;
      }
      .category {
        margin-top: 30px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 5px;
        font-size: 1.2em;
      }
    </style>
  </head>
  <body>
    <h1>Markdown Renderer Test Results</h1>
    
    <div class="summary">
      <p>
        <strong>Total Tests:</strong> ${results.total}<br>
        <strong>Passed:</strong> ${results.passed} (${Math.round(results.passed / results.total * 100)}%)<br>
        <strong>Failed:</strong> ${results.failed}<br>
        <strong>Unsupported Features:</strong> ${results.unsupported}
      </p>
    </div>
    
    <div class="test-results">
  `;
  
  // Add basic tests
  htmlContent += `<div class="category">Basic Markdown Tests</div>`;
  results.basicResults.forEach(result => {
    const statusClass = result.passed ? 'passed' : 'failed';
    htmlContent += `
      <div class="test-case ${statusClass}">
        <div class="test-name">${result.name} - ${result.passed ? 'PASSED' : 'FAILED'}</div>
        <div class="test-details">${result.details}</div>
        <div class="test-input"><strong>Input:</strong><pre>${result.markdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></div>
        <div class="test-output"><strong>Rendered HTML (partial):</strong><pre>${result.htmlExcerpt.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></div>
      </div>
    `;
  });
  
  // Add advanced tests
  if (results.advancedResults.length > 0) {
    htmlContent += `<div class="category">Advanced Markdown Tests</div>`;
    results.advancedResults.forEach(result => {
      const statusClass = result.passed ? 'passed' : 'unsupported';
      htmlContent += `
        <div class="test-case ${statusClass}">
          <div class="test-name">${result.name} - ${result.passed ? 'SUPPORTED' : 'UNSUPPORTED'}</div>
          <div class="test-details">${result.details}</div>
          <div class="test-input"><strong>Input:</strong><pre>${result.markdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></div>
          <div class="test-output"><strong>Rendered HTML (partial):</strong><pre>${result.htmlExcerpt.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></div>
        </div>
      `;
    });
  }
  
  // Add language tests
  if (results.languageResults.length > 0) {
    htmlContent += `<div class="category">Syntax Highlighting Tests</div>`;
    results.languageResults.forEach(result => {
      const statusClass = result.passed ? 'passed' : 'failed';
      htmlContent += `
        <div class="test-case ${statusClass}">
          <div class="test-name">${result.name} - ${result.passed ? 'SUPPORTED' : 'UNSUPPORTED'}</div>
          <div class="test-details">${result.details}</div>
          <div class="test-input"><strong>Input:</strong><pre>${result.markdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></div>
          <div class="test-output"><strong>Rendered HTML (partial):</strong><pre>${result.htmlExcerpt.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></div>
        </div>
      `;
    });
  }
  
  htmlContent += `
    </div>
  </body>
  </html>
  `;
  
  await fs.writeFile(path.join(CONFIG.outputDir, 'test-results.html'), htmlContent);
  return path.join(CONFIG.outputDir, 'test-results.html');
}

// Helper function to get an excerpt of HTML for readability
function getHtmlExcerpt(html, maxLength = 300) {
  if (html.length <= maxLength) return html;
  return html.substring(0, maxLength) + '...';
}

// Main test function
async function runTests() {
  console.log('Starting comprehensive Markdown renderer tests...\n');
  
  // Create test output directory if it doesn't exist
  if (!fsSync.existsSync(CONFIG.outputDir)) {
    fsSync.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  // Create a renderer with default settings
  const renderer = new MarkdownRenderer({
    highlight: true,
    loadLanguages: true,
    dynamicFileTypes: {
      fileTypes: getFileTypes(),
      descriptions: getFileTypeDescriptions()
    }
  });
  
  console.log('Testing basic Markdown features...');
  const basicResults = [];
  for (const testCase of TEST_CASES) {
    if (CONFIG.individualTests) {
      process.stdout.write(`  Testing ${testCase.name}... `);
    }
    
    const html = renderer.render(testCase.markdown);
    const result = testCase.checkFunction(html);
    
    // Save the test result
    basicResults.push({
      name: testCase.name,
      passed: result.passed,
      details: result.details,
      markdown: testCase.markdown,
      htmlExcerpt: getHtmlExcerpt(html)
    });
    
    if (CONFIG.individualTests) {
      console.log(result.passed ? 'PASSED' : 'FAILED');
    }
  }
  
  console.log('\nTesting advanced Markdown features (may not be supported)...');
  const advancedResults = [];
  for (const testCase of ADVANCED_TEST_CASES) {
    if (CONFIG.individualTests) {
      process.stdout.write(`  Testing ${testCase.name}... `);
    }
    
    const html = renderer.render(testCase.markdown);
    const result = testCase.checkFunction(html);
    
    // Save the test result
    advancedResults.push({
      name: testCase.name,
      passed: result.passed,
      details: result.details,
      markdown: testCase.markdown,
      htmlExcerpt: getHtmlExcerpt(html)
    });
    
    if (CONFIG.individualTests) {
      console.log(result.passed ? 'SUPPORTED' : 'UNSUPPORTED');
    }
  }
  
  // Generate language test cases
  const languageTestCases = CONFIG.testLanguages ? createLanguageTests() : [];
  const languageResults = [];
  
  if (languageTestCases.length > 0) {
    console.log('\nTesting syntax highlighting for various languages...');
    for (const testCase of languageTestCases) {
      if (CONFIG.individualTests) {
        process.stdout.write(`  Testing ${testCase.name}... `);
      }
      
      const html = renderer.render(testCase.markdown);
      const result = testCase.checkFunction(html);
      
      // Save the test result
      languageResults.push({
        name: testCase.name,
        passed: result.passed,
        details: result.details,
        markdown: testCase.markdown,
        htmlExcerpt: getHtmlExcerpt(html)
      });
      
      if (CONFIG.individualTests) {
        console.log(result.passed ? 'SUPPORTED' : 'UNSUPPORTED');
      }
    }
  }
  
  // Calculate overall results
  const passedBasic = basicResults.filter(r => r.passed).length;
  const failedBasic = basicResults.length - passedBasic;
  
  const passedAdvanced = advancedResults.filter(r => r.passed).length;
  const unsupportedAdvanced = advancedResults.length - passedAdvanced;
  
  const passedLanguage = languageResults.filter(r => r.passed).length;
  const unsupportedLanguage = languageResults.length - passedLanguage;
  
  const total = basicResults.length + advancedResults.length + languageResults.length;
  const passed = passedBasic + passedAdvanced + passedLanguage;
  const failed = failedBasic;
  const unsupported = unsupportedAdvanced + unsupportedLanguage;
  
  // Display summary
  console.log('\n========== TEST SUMMARY ==========');
  console.log(`Basic Markdown: ${passedBasic}/${basicResults.length} passed (${Math.round(passedBasic/basicResults.length*100)}%)`);
  if (advancedResults.length > 0) {
    console.log(`Advanced Features: ${passedAdvanced}/${advancedResults.length} supported (${Math.round(passedAdvanced/advancedResults.length*100)}%)`);
  }
  if (languageResults.length > 0) {
    console.log(`Language Highlighting: ${passedLanguage}/${languageResults.length} supported (${Math.round(passedLanguage/languageResults.length*100)}%)`);
  }
  console.log(`\nOVERALL: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
  console.log(`${failed} tests failed, ${unsupported} features unsupported`);
  
  // Create HTML report
  if (CONFIG.createHtmlReport) {
    const reportFilePath = await createHtmlReport({
      total, passed, failed, unsupported,
      basicResults, advancedResults, languageResults
    });
    console.log(`\nDetailed HTML report generated at: ${reportFilePath}`);
  }
  
  // Return the results
  return {
    total, passed, failed, unsupported,
    basicResults, advancedResults, languageResults
  };
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
}); 