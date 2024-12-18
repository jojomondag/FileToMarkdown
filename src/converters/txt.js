const fs = require('fs').promises;
const { FileNotFoundError, FileReadError, FormatError } = require('../utils/errors');

class TXTConverter {
  constructor(options = {}) {
    this.options = {
      preserveFormatting: true,
      includeMetadata: true,
      maxLineLength: 10000, // Prevent memory issues with huge lines
      ...options
    };
  }

  async convert(filePath) {
    try {
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        throw new FileNotFoundError(filePath, error);
      }

      // Read file content
      let content;
      try {
        content = await fs.readFile(filePath, 'utf8');
      } catch (error) {
        throw new FileReadError(filePath, error);
      }

      // Format content
      return this.format(content);
    } catch (error) {
      if (error instanceof FileNotFoundError || error instanceof FileReadError) {
        throw error;
      }
      throw new FormatError(`Failed to convert TXT file: ${error.message}`, error);
    }
  }

  format(text) {
    if (typeof text !== 'string') {
      throw new FormatError('Input must be a string');
    }

    try {
      // Split text into lines
      const lines = text.split('\n');
      let markdown = '';
      let inCodeBlock = false;
      let inList = false;

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        
        // Check line length
        if (line.length > this.options.maxLineLength) {
          throw new FormatError(`Line ${i + 1} exceeds maximum length of ${this.options.maxLineLength} characters`);
        }

        // Skip empty lines
        if (!line) {
          markdown += '\n';
          continue;
        }

        // Detect headings
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

        // Detect lists
        if (line.match(/^[\d]+\./)) {
          line = line.replace(/^[\d]+\./, '1.');
          inList = true;
        } else if (line.match(/^[-*•]/)) {
          line = line.replace(/^[-*•]/, '-');
          inList = true;
        } else if (inList && !line.match(/^[-*•\d]/)) {
          inList = false;
          markdown += '\n';
        }

        // Detect code blocks
        if (line.match(/^( {4,}|\t)/)) {
          if (!inCodeBlock) {
            markdown += '```\n';
            inCodeBlock = true;
          }
          line = line.replace(/^( {4,}|\t)/, '');
        } else if (inCodeBlock) {
          markdown += '```\n';
          inCodeBlock = false;
        }

        markdown += `${line}\n`;
      }

      // Close any open code block
      if (inCodeBlock) {
        markdown += '```\n';
      }

      return markdown;
    } catch (error) {
      if (error instanceof FormatError) {
        throw error;
      }
      throw new FormatError(`Failed to format text: ${error.message}`, error);
    }
  }
}

module.exports = TXTConverter; 