const { convertToMarkdown } = require('../src/index.js');
const path = require('path');
const fs = require('fs').promises;

async function runTests() {
  try {
    // Define path
    const exampleDir = path.join(__dirname, '../src/exampleFiles');
    const outputDir = path.join(exampleDir, 'outputAfterConversion');
    await fs.mkdir(outputDir, { recursive: true });

    // Define test cases - just filename without extension
    const tests = [
      { type: 'PDF', name: 'exampleGardening' },
      { type: 'TXT', name: 'exampleTXT' }
    ];

    // Run tests
    for (const test of tests) {
      console.log(`Testing ${test.type} conversion...`);
      await convertToMarkdown(
        path.join(exampleDir, `${test.name}.${test.type.toLowerCase()}`),
        path.join(outputDir, `${test.name}.md`)
      );
      console.log(`${test.type} conversion completed successfully`);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

runTests(); 