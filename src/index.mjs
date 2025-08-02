// ES module wrapper for the CommonJS build
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Import the CommonJS module
const filetomarkdown = require('./main.js');

// Export named exports for ES modules
export const { MarkitDown, convertToMarkdown, getFileTypes, getFileTypeDescriptions } = filetomarkdown;

// Also provide default export for compatibility
export default filetomarkdown;