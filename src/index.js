const C = {
  pdf: require('./converters/pdf'),
  txt: require('./converters/txt'),
  docx: require('./converters/docx'),
  pptx: require('./converters/pptx'),
  xlsx: require('./converters/xlsx'),
  '7z': require('./converters/7zip'),
  zip: require('./converters/zip'),
  cs: require('./converters/code'),
  html: require('./converters/code'),
  java: require('./converters/code'),
  js: require('./converters/code'),
  py: require('./converters/code'),
  cpp: require('./converters/code'),
  c: require('./converters/code'),
  h: require('./converters/code'),
  hpp: require('./converters/code'),
  css: require('./converters/code'),
  scss: require('./converters/code'),
  sass: require('./converters/code'),
  php: require('./converters/code'),
  rb: require('./converters/code'),
  rs: require('./converters/code'),
  go: require('./converters/code'),
  ts: require('./converters/code'),
  tsx: require('./converters/code'),
  jsx: require('./converters/code'),
  swift: require('./converters/code'),
  kt: require('./converters/code'),
  r: require('./converters/code'),
  sql: require('./converters/code'),
  sh: require('./converters/code'),
  bash: require('./converters/code'),
  ps1: require('./converters/code'),
  yaml: require('./converters/code'),
  yml: require('./converters/code'),
  json: require('./converters/code'),
  xml: require('./converters/code'),
  vue: require('./converters/code'),
  dart: require('./converters/code'),
  lua: require('./converters/code'),
  pl: require('./converters/code'),
  scala: require('./converters/code')
};

const M = {
  pdf: 'pdfTextConvert',
  txt: 'convert',
  docx: 'convert',
  pptx: 'convert',
  xlsx: 'convert',
  '7z': 'convert',
  zip: 'convert',
  cs: 'convert',
  html: 'convert',
  java: 'convert',
  js: 'convert',
  py: 'convert',
  cpp: 'convert',
  c: 'convert',
  h: 'convert',
  hpp: 'convert',
  css: 'convert',
  scss: 'convert',
  sass: 'convert',
  php: 'convert',
  rb: 'convert',
  rs: 'convert',
  go: 'convert',
  ts: 'convert',
  tsx: 'convert',
  jsx: 'convert',
  swift: 'convert',
  kt: 'convert',
  r: 'convert',
  sql: 'convert',
  sh: 'convert',
  bash: 'convert',
  ps1: 'convert',
  yaml: 'convert',
  yml: 'convert',
  json: 'convert',
  xml: 'convert',
  vue: 'convert',
  dart: 'convert',
  lua: 'convert',
  pl: 'convert',
  scala: 'convert'
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