module.exports = class {
  async convert(filePath) {
    return this.pdfTextConvert(filePath);
  }

  async pdfTextConvert(f) {
    const p = await import('pdfjs-dist');
    const d = await p.getDocument({data:new Uint8Array(await require('fs').promises.readFile(f))}).promise;
    return(await Promise.all([...Array(d.numPages)].map((_,i)=>d.getPage(i+1).then(p=>p.getTextContent().then(c=>c.items.map(i=>i.str).join(' ')))))).join('\n\n').trim();
  }
}