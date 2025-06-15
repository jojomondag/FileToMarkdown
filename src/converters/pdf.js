const fs = require('fs');
const pdf = require('pdf-parse');

module.exports = class {
  async convert(filePath) {
    return this.pdfTextConvert(filePath);
  }

  async pdfTextConvert(f) {
    try {
      const dataBuffer = await fs.promises.readFile(f);
      const data = await pdf(dataBuffer);
      return data.text.trim();
    } catch (error) {
      throw error;
    }
  }
}