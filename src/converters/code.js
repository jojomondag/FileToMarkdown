module.exports = class {
  async convert(f) {
    const fs = require('fs').promises;
    const path = require('path');

    // Map of file extensions to markdown language identifiers
    const langMap = {
      // Currently testing languages
      '.js': 'javascript',
      '.html': 'html',
      '.java': 'java',
      '.cs': 'csharp',
      '.py': 'python',
    };

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