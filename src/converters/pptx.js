module.exports = class {
  async convert(f) {
    const z = new (require('adm-zip'))(await require('fs').promises.readFile(f));
    const x = new (require('xml2js')).Parser();
    return (await Promise.all(z.getEntries().filter(e => e.entryName.startsWith('ppt/slides/slide')).sort((a, b) => 
      parseInt(a.entryName.match(/slide(\d+)/)[1]) - parseInt(b.entryName.match(/slide(\d+)/)[1])
    ).map(async (e, i) => {
      const t = [];
      const r = (o) => o && (Array.isArray(o) ? o.forEach(r) : typeof o === 'object' && (o['a:t'] && t.push(o['a:t'].join(' ')), Object.values(o).forEach(r)));
      r((await x.parseStringPromise(z.readAsText(e.entryName)))['p:sld']['p:cSld'][0]['p:spTree']);
      return `# Slide ${i + 1}\n\n${t.join('\n')}\n\n---\n\n`;
    }))).join('').trim();
  }
}