const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const CodeConverter = require('./converters/code');

class MarkitDown {
  static get typeMap() {
    return {
      'pdf': './converters/pdf',
      'txt': './converters/txt',
      'docx': './converters/docx',
      'pptx': './converters/pptx',
      'xlsx': './converters/xlsx',
      '7z': './converters/7zip',
      'zip': './converters/zip',
      ...Object.fromEntries(
        CodeConverter.supportedExtensions.map(ext => 
          [ext, './converters/code']
        )
      )
    };
  }

  static getTypeDescriptions() {
    return {
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
      const Converter = await this.getFileType(ext);
      
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

  async getFileType(ext) {
    const converterPath = MarkitDown.typeMap[ext];
    if (!converterPath) return null;

    return require(converterPath);
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