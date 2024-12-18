const pdfjsLib = require('pdfjs-dist');
const fs = require('fs').promises;

class PDFConverter {
  async convert(filePath) {
    const data = new Uint8Array(await fs.readFile(filePath));
    const pdfDocument = await pdfjsLib.getDocument(data).promise;
    
    let markdown = '';
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      markdown += textContent.items.map(item => item.str).join(' ') + '\n\n';
    }
    
    return markdown.trim();
  }
}

module.exports = PDFConverter;