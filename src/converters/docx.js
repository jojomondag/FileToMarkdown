module.exports = class {
  async convert(f) {
    return(await require('mammoth').extractRawText({path:f})).value.trim();
  }
}