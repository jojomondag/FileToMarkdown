// Map of file extensions to markdown language identifiers
const langMap = {
  '.js': 'javascript',
  '.html': 'markup',
  '.java': 'java',
  '.cs': 'csharp',
  '.py': 'python',
  '.cpp': 'cpp',
  '.c': 'c',
  '.go': 'go',
  '.sql': 'sql',
  '.php': 'php',
  '.swift': 'swift',
  '.css': 'css',
  '.rb': 'ruby',
  '.ts': 'typescript',
  '.rs': 'rust',
  '.kt': 'kotlin',
  '.lua': 'lua',
  '.m': 'matlab',
  '.sh': 'shell',
  '.bash': 'shell',
  // Framework extensions
  '.jsx': 'jsx',
  '.tsx': 'tsx',
  '.vue': 'markup',
  '.svelte': 'markup',
};

class CodeConverter {
  // Make langMap accessible as a static property
  static supportedExtensions = Object.keys(langMap).map(ext => ext.slice(1));
  
  async convert(f) {
    const fs = require('fs').promises;
    const path = require('path');

    try {
      const ext = path.extname(f).toLowerCase();
      const fileName = path.basename(f);
      const content = await fs.readFile(f, 'utf8');
      
      // Determine language for syntax highlighting
      const lang = langMap[ext] || 'plaintext';
      
      // Format the output with filename as heading and code block
      return [
        `# ${fileName}`,
        '',
        '```' + lang,
        content,
        '```'
      ].join('\n').trim();
      
    } catch (error) {
      return `# Error\n\nFailed to read file: ${error.message}`;
    }
  }
}

module.exports = CodeConverter;
module.exports.langMap = langMap;