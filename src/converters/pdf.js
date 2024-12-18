const pdfjsLib = require('pdfjs-dist');

class PDFConverter {
  async convert(filePath) {
    const doc = await pdfjsLib.getDocument({
      data: new Uint8Array(await require('fs').promises.readFile(filePath))
    }).promise;

    return (await Promise.all(
      Array.from({ length: doc.numPages }, (_, i) => 
        doc.getPage(i + 1)
          .then(page => page.getTextContent())
          .then(content => content.items.map(item => item.str).join(' '))
      )
    )).join('\n\n').trim();
  }
}

module.exports = PDFConverter;