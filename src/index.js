const path = require('path');
const fs = require('fs').promises;

class MarkitDown {
  constructor(options = {}) {
    this.options = options;
  }

  async convertToMarkdown(inputPath, outputPath) {
    try {
      const ext = path.extname(inputPath).toLowerCase().slice(1);
      const Converter = await this.getConverter(ext);
      
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

  async getConverter(ext) {
    const CodeConverter = require('./converters/code');
    
    const typeMap = {
      'pdf': './converters/pdf',
      'txt': './converters/txt',
      'docx': './converters/docx',
      'pptx': './converters/pptx',
      'xlsx': './converters/xlsx',
      '7z': './converters/7zip',
      'zip': './converters/zip',
      // Dynamically add code file extensions
      ...Object.fromEntries(
        CodeConverter.supportedExtensions.map(ext => 
          [ext, './converters/code']
        )
      )
    };

    const converterPath = typeMap[ext];
    if (!converterPath) return null;

    return require(converterPath);
  }
}

// Export both the class and a convenience function
module.exports = {
  MarkitDown,
  convertToMarkdown: async (input, output, options) => {
    const converter = new MarkitDown(options);
    return converter.convertToMarkdown(input, output);
  }
};