module.exports = class {
  async convert(filePath) {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({path: filePath});
    return result.value.trim();
  }
}