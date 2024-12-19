const C = {
  pdf: require('./converters/pdf'),
  txt: require('./converters/txt'),
  docx: require('./converters/docx'),
  pptx: require('./converters/pptx'),
  xlsx: require('./converters/xlsx'),
  '7z': require('./converters/7zip'),
  zip: require('./converters/zip')
};

const M = {
  pdf: 'pdfTextConvert',
  txt: 'convert',
  docx: 'convert',
  pptx: 'convert',
  xlsx: 'convert',
  '7z': 'convert',
  zip: 'convert'
};

async function convertToMarkdown(i, o) {
  try {
    const t = i.split('.').pop().toLowerCase();
    if (!C[t]) throw new Error(`Unsupported file type: ${t}`);
    const c = new C[t]();
    const m = M[t];
    const k = await c[m](i);
    await require('fs').promises.writeFile(o, k);
    return true;
  } catch (e) {
    throw new Error(`Conversion failed: ${e.message}`);
  }
}

module.exports = { convertToMarkdown }; 