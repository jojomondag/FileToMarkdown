module.exports = class {
  async convert(f) {
    const { value } = await require('mammoth').convertToMarkdown({
      path: f
    }, {
      styleMap: [...Array(6)].map((_, i) => `p[style-name='Heading ${i + 1}'] => h${i + 1}:fresh`)
    });
    return value.trim();
  }
}