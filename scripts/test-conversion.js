const { convertToMarkdown } = require('../src/index.js');
const path = require('path');
const fs = require('fs').promises;

async function runTests() {
  try {
    // Ensure output directory exists
    const outputDir = path.join(__dirname, '../src/exampleFiles/outputAfterConversion');
    await fs.mkdir(outputDir, { recursive: true });

    // Test PDF conversion
    console.log('Testing PDF conversion...');
    await convertToMarkdown(
      path.join(__dirname, '../src/exampleFiles/exampleGardening.pdf'),
      path.join(outputDir, 'exampleGardening.md')
    );
    console.log('PDF conversion completed successfully');

    // Test TXT conversion
    console.log('Testing TXT conversion...');
    await convertToMarkdown(
      path.join(__dirname, '../src/exampleFiles/exampleTXT.txt'),
      path.join(outputDir, 'exampleTXT.md')
    );
    console.log('TXT conversion completed successfully');

  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

runTests(); 