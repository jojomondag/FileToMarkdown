const converters = require('./converters');

class MarkItDown {
  constructor(options = {}) {
    this.options = {
      preserveFormatting: true,
      includeMetadata: true,
      ...options
    };
  }

  async convertToMarkdown(filePath) {
    const fileExtension = filePath.split('.').pop().toLowerCase();
    
    const Converter = converters[fileExtension];
    if (!Converter) {
      throw new Error(`Unsupported file format: ${fileExtension}`);
    }

    const converter = new Converter(this.options);
    return converter.convert(filePath);
  }
}

module.exports = MarkItDown; 