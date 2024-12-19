const { convertToMarkdown } = require('../src/index.js');
const { join } = require('path');
const { promises: fs } = require('fs');

(async () => {
  try {
    const exampleDir = join(__dirname, '../src/exampleFiles');
    const outputDir = join(exampleDir, 'outputAfterConversion');
    await fs.mkdir(outputDir, { recursive: true });

    const tests = [
      ['PDF', 'exampleGardening'],
      ['TXT', 'exampleTheDebuggingDuck'],
      ['DOCX', 'exampleProjekt9'],
      ['PPTX', 'exampleBruceLee'],
      ['XLSX', 'exampleProgrammeringYearPlan'],
      ['7Z', 'exampleStudentWorks'],
      ['ZIP', 'exampleLeads']
    ].map(([type, name]) => ({
      input: join(exampleDir, `${name}.${type.toLowerCase()}`),
      output: join(outputDir, `example_${type.toLowerCase()}_${name.replace('example', '')}.md`),
      type
    }));

    for (const { input, output, type } of tests) {
      try {
        await fs.access(input);
        process.stdout.write(`${type} Parse - ${type} Done.\n`);
        await convertToMarkdown(input, output);
      } catch {
        console.error(`Missing: ${input}`);
      }
    }
  } catch (error) {
    console.error('Fail:', error.message);
    process.exit(1);
  }
})(); 