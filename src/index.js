const path = require('path');
const fs = require('fs').promises;
const CodeConverter = require('./converters/code');

class MarkitDown {
  static get typeMap() {
    return {
      'md': require('./converters/md'),
      'pdf': require('./converters/pdf'),
      'txt': require('./converters/txt'),
      'docx': require('./converters/docx'),
      'pptx': require('./converters/pptx'),
      'xlsx': require('./converters/xlsx'),
      '7z': require('./converters/7zip'),
      'zip': require('./converters/zip'),
      ...Object.fromEntries(
        CodeConverter.supportedExtensions.map(ext => 
          [ext, CodeConverter]
        )
      )
    };
  }

  static getTypeDescriptions() {
    return {
      'md': 'Markdown file (passthrough)',
      'pdf': 'PDF Documents',
      'txt': 'Text Files',
      'docx': 'Word Documents',
      'pptx': 'PowerPoint Presentations',
      'xlsx': 'Excel Spreadsheets',
      '7z': '7-Zip Archives',
      'zip': 'ZIP Archives',
      ...Object.fromEntries(
        CodeConverter.supportedExtensions.map(ext => 
          [ext, `${ext.toUpperCase()} Source Files`]
        )
      )
    };
  }

  constructor(options = {}) {
    this.options = options;
  }

  async convertToMarkdown(inputPath, outputPath) {
    try {
      const ext = path.extname(inputPath).toLowerCase().slice(1);
      const Converter = this.getFileType(ext);
      
      if (!Converter) {
        throw new Error(`Unsupported file type: ${ext}`);
      }

      const converter = new Converter();
      const markdown = await converter.convert(inputPath);
      
      if (outputPath) {
        await fs.writeFile(outputPath, markdown);
      }
      
      return markdown;
    } catch (error) {
      throw new Error(`Conversion failed: ${error.message}`);
    }
  }

  getFileType(ext) {
    return MarkitDown.typeMap[ext] || null;
  }
}

module.exports = {
  MarkitDown,
  convertToMarkdown: async (input, output, options) => {
    const converter = new MarkitDown(options);
    return converter.convertToMarkdown(input, output);
  },

  getFileTypes: () => Object.keys(MarkitDown.typeMap),
  getFileTypeDescriptions: () => MarkitDown.getTypeDescriptions()
};