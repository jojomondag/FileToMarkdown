const PDFConverter = require('./converters/pdf');
const TXTConverter = require('./converters/txt');
const fs = require('fs').promises;

const CONVERTERS = {
  pdf: PDFConverter,
  txt: TXTConverter
};

async function convertToMarkdown(inputPath, outputPath) {
  try {
    const fileType = inputPath.split('.').pop().toLowerCase();
    const Converter = CONVERTERS[fileType];
    
    if (!Converter) {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    const converter = new Converter();
    const markdown = await converter.convert(inputPath);
    await fs.writeFile(outputPath, markdown);
    return true;
  } catch (error) {
    throw new Error(`Conversion failed: ${error.message}`);
  }
}

module.exports = { convertToMarkdown }; 