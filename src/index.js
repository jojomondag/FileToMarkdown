const CONVERTERS = {
  pdf: require('./converters/pdf'),
  txt: require('./converters/txt')
};

async function convertToMarkdown(inputPath, outputPath) {
  try {
    const fileType = inputPath.split('.').pop().toLowerCase();
    if (!CONVERTERS[fileType]) throw new Error(`Unsupported file type: ${fileType}`);
    
    const markdown = await new CONVERTERS[fileType]().convert(inputPath);
    await require('fs').promises.writeFile(outputPath, markdown);
    return true;
  } catch (error) {
    throw new Error(`Conversion failed: ${error.message}`);
  }
}

module.exports = { convertToMarkdown }; 