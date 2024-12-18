const { convertToMarkdown } = require('../src/index.js');
const path = require('path');
const fs = require('fs').promises;

(async () => {
  try {
    const exampleDir = path.join(__dirname, '../src/exampleFiles');
    const outputDir = path.join(exampleDir, 'outputAfterConversion');
    await fs.mkdir(outputDir, { recursive: true });

    const tests = [
      { type: 'PDF', name: 'exampleGardening' },
      { type: 'TXT', name: 'exampleTheDebuggingDuck' },
      { type: 'DOCX', name: 'exampleMirjaSiri' },
      { type: 'PPTX', name: 'exampleBruceLee' },
      { type: 'XLSX', name: 'exampleProgrammeringYearPlan' }
    ];

    for (const { type, name } of tests) {
      console.log(`run ${type} conversion.`);
      await convertToMarkdown(
        path.join(exampleDir, `${name}.${type.toLowerCase()}`),
        path.join(outputDir, `${name}.md`)
      );
      console.log(`${type} Converted`);
    }
  } catch (error) {
    console.error('Failed:', error.message);
    process.exit(1);
  }
})(); 