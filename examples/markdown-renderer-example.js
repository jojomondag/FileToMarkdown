/**
 * Example showing how to use the MarkdownRenderer with file reading functionality
 * via the API to avoid circular dependencies
 */
const api = require('../src/api/api');
const path = require('path');
const fs = require('fs').promises;

// Sample markdown content
const SAMPLE_MARKDOWN = `
# Markdown Renderer Example

This is a simple example showing how to use the MarkdownRenderer.

## Code Examples

Here's some JavaScript code:

\`\`\`js
function hello() {
  console.log("Hello, world!");
}
\`\`\`

And some Python:

\`\`\`python
def hello():
    print("Hello, world!")
\`\`\`
`;

async function main() {
  try {
    console.log('FileToMarkdown Renderer Examples\n');
    
    // Get file types info
    const fileTypesInfo = api.getFileTypes();
    console.log(`Loaded ${fileTypesInfo.fileTypes.length} file types from the package\n`);
    
    // Example 1: Render markdown from a string
    console.log('Example 1: Rendering markdown from a string');
    const htmlContent = api.renderMarkdown(SAMPLE_MARKDOWN);
    console.log('HTML Output Length:', htmlContent.length);
    console.log('---\n');
    
    // Example 2: Read and render from a file (async)
    console.log('Example 2: Reading and rendering from a file (async)');
    try {
      // First create a temporary markdown file
      const tempFile = path.join(__dirname, 'temp-example.md');
      await fs.writeFile(tempFile, SAMPLE_MARKDOWN);
      
      // Read and render
      const fileHtml = await api.renderMarkdownFromFile(tempFile);
      console.log('HTML Output Length:', fileHtml.length);
      
      // Clean up
      await fs.unlink(tempFile);
    } catch (error) {
      console.error('File reading example failed:', error.message);
    }
    console.log('---\n');
    
    // Example 3: Using the sync version
    console.log('Example 3: Using the synchronous version');
    try {
      // First create a temporary markdown file
      const tempFile = path.join(__dirname, 'temp-sync-example.md');
      require('fs').writeFileSync(tempFile, SAMPLE_MARKDOWN);
      
      // Read and render synchronously
      const syncHtml = api.renderMarkdownFromFileSync(tempFile);
      console.log('HTML Output Length:', syncHtml.length);
      
      // Clean up
      require('fs').unlinkSync(tempFile);
    } catch (error) {
      console.error('Sync file reading example failed:', error.message);
    }
    
    console.log('\nAll examples completed!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run the examples
main(); 