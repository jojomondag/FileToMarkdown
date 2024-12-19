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
      { type: 'XLSX', name: 'exampleProgrammeringYearPlan' },
      { type: '7Z', name: 'exampleStudentWorks' },
      { type: 'ZIP', name: 'exampleLeads' }
    ];

    for (const { type, name } of tests) {
      const inputFile = path.join(exampleDir, `${name}.${type.toLowerCase()}`);
      const outputFile = path.join(outputDir, `${name}.md`);

      try {
        await fs.access(inputFile);
      } catch (error) {
        console.error(`Input file missing: ${inputFile}`);
        continue;
      }

      console.log(`run ${type} conversion.`);
      await convertToMarkdown(inputFile, outputFile);
      console.log(`${type} Converted`);
    }

  } catch (error) {
    console.error('Failed:', error.message);
    process.exit(1);
  }
})(); 