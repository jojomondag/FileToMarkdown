const fs = require('fs').promises;

class TXTConverter {
  async convert(filePath) {
    const lines = (await fs.readFile(filePath, 'utf8')).split('\n');
    return lines.reduce((markdown, line, i) => {
      line = line.trim();
      if (!line) return markdown + '\n';
      
      const nextLine = lines[i + 1]?.trim();
      if (nextLine?.match(/^={3,}$/)) lines[i + 1] = '';
      if (nextLine?.match(/^-{3,}$/)) lines[i + 1] = '';
      
      return markdown + (
        nextLine?.match(/^={3,}$/) ? `# ${line}\n` :
        nextLine?.match(/^-{3,}$/) ? `## ${line}\n` :
        `${line}\n`
      );
    }, '').trim();
  }
}

module.exports = TXTConverter;