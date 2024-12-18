const fs = require('fs').promises;

class TXTConverter {
  async convert(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    let markdown = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        markdown += '\n';
        continue;
      }

      // Handle headers
      if (i < lines.length - 1) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.match(/^={3,}$/)) {
          markdown += `# ${line}\n`;
          i++;
          continue;
        } else if (nextLine.match(/^-{3,}$/)) {
          markdown += `## ${line}\n`;
          i++;
          continue;
        }
      }
      markdown += `${line}\n`;
    }
    return markdown.trim();
  }
}

module.exports = TXTConverter;