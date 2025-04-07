const MarkdownRenderer = require('../src/renderer/markdown');

// Create a new renderer instance
const renderer = new MarkdownRenderer({ highlight: false });

// Test each failing case
const tests = [
  {
    name: 'Emphasis',
    markdown: '*Italic text* and _also italic_\n\n**Bold text** and __also bold__\n\n***Bold and italic*** and ___also bold and italic___'
  },
  {
    name: 'Strikethrough',
    markdown: '~~Strikethrough text~~'
  },
  {
    name: 'Blockquotes',
    markdown: '> Simple blockquote\n\n> Multi-line blockquote\n> second line\n\n> Nested blockquote\n>> Nested level 2'
  },
  {
    name: 'Unordered Lists',
    markdown: '* Item 1\n* Item 2\n  * Nested item 1\n  * Nested item 2\n* Item 3\n\n- Alternate 1\n- Alternate 2\n\n+ Another alternate 1\n+ Another alternate 2'
  },
  {
    name: 'Ordered Lists',
    markdown: '1. Item 1\n2. Item 2\n   1. Nested item 1\n   2. Nested item 2\n3. Item 3'
  },
  {
    name: 'Reference Links',
    markdown: '[Reference link][ref]\n\n[ref]: https://example.com "Reference"'
  }
];

// Run each test and log the rendered HTML
tests.forEach(test => {
  console.log(`\n=== Testing ${test.name} ===`);
  console.log('Markdown:');
  console.log(test.markdown);
  console.log('\nRendered HTML:');
  
  // Use our renderer
  const html = renderer.render(test.markdown);
  console.log(html);
}); 