const fs = require('fs');
const path = require('path');
const util = require('util');

// Read the test suite file content
const testSuitePath = path.join(__dirname, 'renderer-test-suite.js');
const testSuiteContent = fs.readFileSync(testSuitePath, 'utf-8');

// Get all failing test cases
const failingTests = [
  {
    name: 'Blockquotes',
    markdown: '> Simple blockquote\n\n> Multi-line blockquote\n> second line\n\n> Nested blockquote\n>> Nested level 2',
    pattern: 'blockquote><blockquote>'
  },
  {
    name: 'Unordered Lists',
    markdown: '* Item 1\n* Item 2\n  * Nested item 1\n  * Nested item 2\n* Item 3\n\n- Alternate 1\n- Alternate 2\n\n+ Another alternate 1\n+ Another alternate 2',
    pattern: 'ul><ul>'
  },
  {
    name: 'Ordered Lists',
    markdown: '1. Item 1\n2. Item 2\n   1. Nested item 1\n   2. Nested item 2\n3. Item 3',
    pattern: 'ol><ol>'
  },
  {
    name: 'Reference Links',
    markdown: '[Reference link][ref]\n\n[ref]: https://example.com "Reference"',
    pattern: '<a href="https://example.com">Reference link</a>'
  }
];

// Create test HTML patterns
const createExactHtml = (test) => {
  switch(test.name) {
    case 'Blockquotes':
      return `<blockquote><p>Simple blockquote</p></blockquote>
<blockquote><p>Multi-line blockquote<br>second line</p></blockquote>
<blockquote><p>Nested blockquote</p><blockquote><p>Nested level 2</p></blockquote></blockquote>`;

    case 'Unordered Lists':
      return `<ul><li>Item 1</li>
<li>Item 2<ul><li>Nested item 1</li>
<li>Nested item 2</li></ul></li>
<li>Item 3</li>
<li>Alternate 1</li>
<li>Alternate 2</li>
<li>Another alternate 1</li>
<li>Another alternate 2</li></ul>`;

    case 'Ordered Lists': 
      return `<ol><li>Item 1</li>
<li>Item 2<ol><li>Nested item 1</li>
<li>Nested item 2</li></ol></li>
<li>Item 3</li></ol>`;

    case 'Reference Links':
      return `<p><a href="https://example.com" title="Reference">Reference link</a></p>`;

    default:
      return 'Unknown test';
  }
};

// Helper function to extract specific patterns
const extractPattern = (html, pattern) => {
  // Show the context around the sought pattern
  const index = html.indexOf(pattern);
  
  if (index === -1) {
    return { found: false, context: 'Pattern not found' };
  }
  
  const start = Math.max(0, index - 20);
  const end = Math.min(html.length, index + pattern.length + 20);
  
  return {
    found: true,
    context: html.substring(start, end),
    fullContent: html
  };
};

// Setup marked renderer
const MarkdownRenderer = require('../src/renderer/markdown');
const renderer = new MarkdownRenderer({ highlight: false });

// Test each failing case
console.log('=================== TEST EXACT PATTERN ===================');
failingTests.forEach(test => {
  console.log(`\n== TESTING: ${test.name} ==`);
  console.log('MARKDOWN:');
  console.log(test.markdown);
  
  console.log('\nEXPECTED PATTERN:');
  console.log(test.pattern);
  
  console.log('\nIDEAL HTML OUTPUT:');
  console.log(createExactHtml(test));
  
  console.log('\nACTUAL OUTPUT:');
  const html = renderer.render(test.markdown);
  
  // Remove the div wrapper for cleaner comparison
  const cleanedHtml = html.replace('<div class="rendered-content">', '').replace('</div>', '');
  console.log(cleanedHtml);
  
  // Show pattern context
  console.log(`\nPATTERN SEARCH (${test.pattern}):`);
  const patternResult = extractPattern(cleanedHtml, test.pattern);
  if (patternResult.found) {
    console.log('✅ FOUND! Context:');
    console.log(patternResult.context);
  } else {
    console.log('❌ NOT FOUND!');
    // Check for similar patterns or common mistakes
    if (test.name === 'Blockquotes') {
      const alt1 = extractPattern(cleanedHtml, '<blockquote');
      const alt2 = extractPattern(cleanedHtml, '</blockquote>');
      console.log('Blockquote tags found:', alt1.found, alt2.found);
    } else if (test.name.includes('Lists')) {
      const listType = test.name.includes('Unordered') ? 'ul' : 'ol';
      const alt1 = extractPattern(cleanedHtml, `<${listType}`);
      const alt2 = extractPattern(cleanedHtml, `</${listType}>`);
      console.log(`${listType} tags found:`, alt1.found, alt2.found);
    }
  }
  
  console.log('='.repeat(60));
}); 