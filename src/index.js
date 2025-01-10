const path = require('path');
const fs = require('fs').promises;

class MarkitDown {
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

  // Get supported file types and their paths
  static getSupportedTypes() {
    const CodeConverter = require('./converters/code');
    
    const baseTypes = {
      'pdf': 'PDF Documents',
      'txt': 'Text Files',
      'docx': 'Word Documents',
      'pptx': 'PowerPoint Presentations',
      'xlsx': 'Excel Spreadsheets',
      '7z': '7-Zip Archives',
      'zip': 'ZIP Archives'
    };

    // Add code file types
    const codeTypes = Object.fromEntries(
      CodeConverter.supportedExtensions.map(ext => 
        [ext, `${ext.toUpperCase()} Source Files`]
      )
    );

    return {
      ...baseTypes,
      ...codeTypes
    };
  }

  // Get converter paths for browser
  static getConverterPaths() {
    const CodeConverter = require('./converters/code');
    
    const basePaths = {
      'pdf': 'converters/pdf',
      'txt': 'converters/txt',
      'docx': 'converters/docx',
      'pptx': 'converters/pptx',
      'xlsx': 'converters/xlsx',
      '7z': 'converters/7zip',
      'zip': 'converters/zip'
    };

    // Add code converter paths
    const codePaths = Object.fromEntries(
      CodeConverter.supportedExtensions.map(ext => 
        [ext, 'converters/code']
      )
    );

    return {
      ...basePaths,
      ...codePaths
    };
  }
}

// Export both the class and convenience functions
module.exports = {
  MarkitDown,
  convertToMarkdown: async (input, output, options) => {
    const converter = new MarkitDown(options);
    return converter.convertToMarkdown(input, output);
  },
  getSupportedTypes: MarkitDown.getSupportedTypes,
  getConverterPaths: MarkitDown.getConverterPaths
};