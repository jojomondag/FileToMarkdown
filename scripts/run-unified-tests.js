#!/usr/bin/env node

/**
 * Unified Test Runner Script
 * Generates and opens the unified test page for the Markdown renderer
 */
const path = require('path');
const { spawn } = require('child_process');

// Import the test generator
const testFilePath = path.join(__dirname, '..', 'examples', 'unified-renderer-test.js');
const open = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';

// Run the test generator
console.log('Generating unified Markdown renderer test page...');
const node = spawn('node', [testFilePath]);

// Handle output
node.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  
  // Check if the output indicates the file is ready, then open it
  if (output.includes('Unified test page generated at:')) {
    const filePath = output.split('Unified test page generated at:')[1].trim();
    console.log(`\nOpening test page: ${filePath}`);
    
    // Open the file in the default browser
    spawn(open, [filePath], { shell: true });
  }
});

node.stderr.on('data', (data) => {
  process.stderr.write(data);
});

node.on('close', (code) => {
  console.log(`\nTest page generation ${code === 0 ? 'completed successfully' : 'failed'} with code ${code}`);
}); 