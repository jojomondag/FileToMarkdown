module.exports = class {
  async convert(f) {
    const d = await require('pdfjs-dist').getDocument({data: new Uint8Array(await require('fs').promises.readFile(f))}).promise;
    return (await Promise.all([...Array(d.numPages)].map((_, i) => d.getPage(i + 1).then(p => p.getTextContent().then(c => c.items.map(i => i.str).join(' ')))))).join('\n\n').trim();
  }
}