// Map of file extensions to markdown language identifiers
const langMap = {
  // Common web languages
  '.js': 'javascript',
  '.html': 'markup',
  '.htm': 'markup',
  '.xml': 'markup',
  '.css': 'css',
  '.scss': 'scss',
  '.less': 'less',
  '.json': 'json',

  // Programming languages
  '.java': 'java',
  '.cs': 'csharp',
  '.py': 'python',
  '.rb': 'ruby',
  '.cpp': 'cpp',
  '.c': 'c',
  '.h': 'c',
  '.hpp': 'cpp',
  '.go': 'go',
  '.rs': 'rust',
  '.php': 'php',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.scala': 'scala',
  '.dart': 'dart',
  '.lua': 'lua',
  '.r': 'r',
  '.m': 'matlab',
  '.pl': 'perl',
  '.ts': 'typescript',

  // Shell and scripting
  '.sh': 'bash',
  '.bash': 'bash',
  '.zsh': 'bash',
  '.ps1': 'powershell',
  '.bat': 'batch',
  '.cmd': 'batch',

  // Database
  '.sql': 'sql',
  '.pgsql': 'pgsql',
  '.mysql': 'sql',

  // Framework-specific
  '.jsx': 'jsx',
  '.tsx': 'tsx',
  '.vue': 'markup',
  '.svelte': 'markup',
  '.astro': 'markup',

  // Config files
  '.yml': 'yaml',
  '.yaml': 'yaml',
  '.toml': 'toml',
  '.ini': 'ini',
  '.conf': 'nginx',
  '.dockerfile': 'dockerfile',
  '.docker': 'dockerfile',

  // Other
  '.md': 'markdown',
  '.tex': 'latex',
  '.graphql': 'graphql',
  '.gql': 'graphql'
};

class CodeConverter {
  // Make langMap accessible as a static property
  static supportedExtensions = Object.keys(langMap).map(ext => ext.slice(1));
  
  async convert(f, options = {}) {
    const fs = require('fs').promises;
    const path = require('path');

    try {
      const ext = path.extname(f).toLowerCase();
      const fileName = path.basename(f);
      const content = await fs.readFile(f, 'utf8');
      
      // Determine language for syntax highlighting
      const lang = langMap[ext] || 'plaintext';
      
      // Format the output with filename as heading and code block
      // Add a class to the code block for enhanced styling
      const output = [
        `# ${fileName}`,
        '',
        `\`\`\`${lang}`,
        content.trim(),
        '```'
      ];

      // If the file is large, add a collapsible section
      if (content.split('\n').length > 100 && options.collapsible !== false) {
        output.splice(1, 0, '<details>', '<summary>Click to expand code</summary>', '');
        output.push('', '</details>');
      }

      return output.join('\n');
      
    } catch (error) {
      return `# Error\n\nFailed to read file: ${error.message}`;
    }
  }

  // Helper method to get language from extension
  static getLanguage(filename) {
    const ext = path.extname(filename).toLowerCase();
    return langMap[ext] || 'plaintext';
  }

  // Helper method to check if a file is supported
  static isSupported(filename) {
    const ext = path.extname(filename).toLowerCase();
    return ext in langMap;
  }
}

// Add description to the class
CodeConverter.description = 'Source code files with syntax highlighting';

module.exports = CodeConverter;
module.exports.langMap = langMap;