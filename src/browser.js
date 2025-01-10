const { getSupportedTypes } = require('./index');

// Create the browser-safe object with only file types
const FileToMarkdown = {
  // Get just the keys (file extensions) from supportedTypes
  fileTypes: Object.keys(getSupportedTypes()),
  version: require('../package.json').version
};

// Export for different module systems
if (typeof window !== 'undefined') {
  window.FileToMarkdown = FileToMarkdown;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FileToMarkdown;
}

export default FileToMarkdown; 