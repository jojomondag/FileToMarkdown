const { convertToMarkdown } = require('../src/index.js');
const { join } = require('path');
const { promises: fs } = require('fs');

(async () => {
  try {
    const exampleDir = join(__dirname, '../src/exampleFiles');
    const codeDir = join(exampleDir, 'code');
    const outputDir = join(exampleDir, 'outputAfterConversion');
    const codeOutputDir = join(outputDir, 'code');
    
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(codeOutputDir, { recursive: true });

    const tests = [
      ['PDF', 'exampleGardening'],
      ['TXT', 'exampleTheDebuggingDuck'],
      ['DOCX', 'exampleProjekt9'],
      ['PPTX', 'exampleBruceLee'],
      ['XLSX', 'exampleProgrammeringYearPlan'],
      ['7Z', 'exampleStudentWorks'],
      ['ZIP', 'exampleLeads'],

      ['CS', 'codeCs', true],
      ['HTML', 'codeHtml', true],
      ['JAVA', 'codeJava', true],
      ['JS', 'codeJs', true],
      ['PY', 'codePy', true]
    ].map(([type, name, isCode]) => ({
      input: isCode 
        ? join(codeDir, `${name}.${type.toLowerCase()}`)
        : join(exampleDir, `${name}.${type.toLowerCase()}`),
      output: isCode 
        ? join(codeOutputDir, `${name}.md`)
        : join(outputDir, `example_${type.toLowerCase()}_${name.replace('example', '')}.md`),
      type,
      isCode
    }));

    for (const { input, output, type, isCode } of tests) {
      try {
        await fs.access(input);
        process.stdout.write(`${isCode ? 'Code ' : ''}${type} Parse - ${type} Done.\n`);
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