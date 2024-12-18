module.exports = class {
  async convert(f) {
    const l = (await require('fs').promises.readFile(f, 'utf8')).split('\n');
    return l.reduce((m, c, i) => {let n = l[i + 1]?.trim(); return (c = c.trim(), n?.match(/^={3,}$/) && (l[i + 1] = ''), n?.match(/^-{3,}$/) && (l[i + 1] = ''), m + (!c ? '\n' : n?.match(/^={3,}$/) ? `# ${c}\n` : n?.match(/^-{3,}$/) ? `## ${c}\n` : `${c}\n`))}, '').trim();
  }
}