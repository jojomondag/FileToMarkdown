#!/usr/bin/env node

const { convertToMarkdown } = require('../src/index.js');
const { join } = require('path');
const fs = require('node:fs');
const https = require('node:https');
const process = require('node:process');

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/jojomondag/FileToMarkdown/main/src/exampleFiles';

// Function to download file from GitHub
async function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      const writeStream = fs.createWriteStream(outputPath);
      response.pipe(writeStream);
      writeStream.on('finish', () => {
        writeStream.close();
        resolve();
      });
      writeStream.on('error', reject);
    }).on('error', reject);
  });
}

async function ensureDir(dir) {
  try {
    await fs.promises.access(dir);
  } catch {
    await fs.promises.mkdir(dir, { recursive: true });
  }
}

async function runTests() {
  try {
    // Use current working directory
    const baseDir = process.cwd();
    const srcDir = join(baseDir, 'src');
    const exampleDir = join(srcDir, 'exampleFiles');
    const codeDir = join(exampleDir, 'code');
    const outputDir = join(srcDir, 'outputAfterConversion');
    const codeOutputDir = join(outputDir, 'code');
    
    // Create directories
    await ensureDir(srcDir);
    await ensureDir(exampleDir);
    await ensureDir(codeDir);
    await ensureDir(outputDir);
    await ensureDir(codeOutputDir);

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
      githubUrl: isCode
        ? `${GITHUB_RAW_BASE}/code/${name}.${type.toLowerCase()}`
        : `${GITHUB_RAW_BASE}/${name}.${type.toLowerCase()}`,
      output: isCode 
        ? join(codeOutputDir, `${name}.md`)
        : join(outputDir, `example_${type.toLowerCase()}_${name.replace('example', '')}.md`),
      type,
      isCode
    }));

    console.log('\nCreating project structure:');
    console.log(`src/`);
    console.log(`├── exampleFiles/`);
    console.log(`│   ├── code/`);
    console.log(`│   └── [example files]`);
    console.log(`└── outputAfterConversion/`);
    console.log(`    └── code/\n`);

    for (const { input, output, type, isCode, githubUrl } of tests) {
      try {
        process.stdout.write(`Downloading ${type} file from GitHub...\n`);
        await downloadFile(githubUrl, input);
        process.stdout.write(`Converting ${isCode ? 'Code ' : ''}${type}...\n`);
        await convertToMarkdown(input, output);
        process.stdout.write(`✓ ${type} conversion complete\n\n`);
      } catch (error) {
        console.error(`✗ Error processing ${type}:`, error.message, '\n');
      }
    }

    console.log('All conversions completed!');
    console.log('Project structure created in current directory.');
  } catch (error) {
    console.error('Fail:', error.message);
    process.exit(1);
  }
}

runTests(); 