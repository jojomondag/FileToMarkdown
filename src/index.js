const CONVERTERS = {
  pdf: require('./converters/pdf'),
  txt: require('./converters/txt'),
  docx: require('./converters/docx')
};

const CONVERTER_METHODS = {
  pdf: 'pdfTextConvert',
  txt: 'convert',
  docx: 'convert'
};

async function convertToMarkdown(inputPath, outputPath) {
  try {
    const fileType = inputPath.split('.').pop().toLowerCase();
    if (!CONVERTERS[fileType]) throw new Error(`Unsupported file type: ${fileType}`);
    
    const converter = new CONVERTERS[fileType]();
    const methodName = CONVERTER_METHODS[fileType];
    const markdown = await converter[methodName](inputPath);
    await require('fs').promises.writeFile(outputPath, markdown);
    return true;
  } catch (error) {
    throw new Error(`Conversion failed: ${error.message}`);
  }
}

module.exports = { convertToMarkdown }; 