#!/usr/bin/env node

const { convertToMarkdown } = require('../src/index.js');
const { join } = require('path');
const fs = require('fs').promises;

const usage = `
Usage: markitdown-convert <input-file> [output-file]

Examples:
  markitdown-convert document.pdf                    # Converts to document.md in current directory
  markitdown-convert document.docx output.md         # Converts to specified output file
  markitdown-convert ./src/code.py ./docs/code.md    # Works with paths

Supported formats:
  - Documents: PDF, DOCX, PPTX, XLSX, TXT
  - Archives: ZIP, 7Z
  - Code: JS, PY, JAVA, CS, HTML
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