#!/usr/bin/env node

let convertToMarkdown;
try {
  ({ convertToMarkdown } = require('../dist/main.js'));
} catch (_err) {
  // Fallback to source during development
  ({ convertToMarkdown } = require('../src/index.js'));
}
const fs = require('fs').promises;

const usage = `
Usage: filetomarkdown <input-file> [output-file]

Examples:
  filetomarkdown document.pdf                    # Converts to document.md in current directory
  filetomarkdown document.docx output.md         # Converts to specified output file
  filetomarkdown ./src/code.py ./docs/code.md    # Works with paths

Supported formats:
  - Documents: PDF, DOCX, PPTX, XLSX, TXT
  - Archives: ZIP, 7Z
  - Code: JS (JSX), TS (TSX), PY, JAVA, CS, HTML, CPP, C, GO, SQL, PHP, SWIFT, CSS, RUBY,
          RUST, KOTLIN, LUA, MATLAB, SHELL, VUE, SVELTE
`;

async function main() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
      console.log(usage);
      process.exit(0);
    }

    const inputPath = args[0];
    const outputPath = args[1];

    // Check if input file exists
    try {
      await fs.access(inputPath);
    } catch (error) {
      console.error(`Error: Input file "${inputPath}" does not exist`);
      process.exit(1);
    }

    // If no output path is specified, create one in the same directory
    const defaultOutputPath = inputPath.replace(/\.[^.]+$/, '.md');
    const finalOutputPath = outputPath || defaultOutputPath;

    await convertToMarkdown(inputPath, finalOutputPath);
    console.log(`Successfully converted ${inputPath} to ${finalOutputPath}`);
  } catch (error) {
    console.error('Conversion failed:', error.message);
    process.exit(1);
  }
}

main(); 