module.exports = class {
  async convert(f) {
    const AdmZip = require('adm-zip');
    const fs = require('fs').promises;
    const path = require('path');
    const t = path.join(require('os').tmpdir(), `zip_${Date.now()}`);
    await fs.mkdir(t, { recursive: true });
    try {
      new AdmZip(await fs.readFile(f)).extractAllTo(t, true);
      const r = async (d, l = 0) => {
        const m = (await fs.readdir(d)).sort().map(async i => {
          const p = path.join(d, i), s = await fs.stat(p), h = `${'#'.repeat(l + 2)} ${path.basename(i)}\n\n`;
          if (s.isDirectory()) return h + await r(p, l + 1);
          const e = path.extname(i).toLowerCase();
          if (['.txt','.md','.js','.json','.csv','.xml','.html','.css'].includes(e)) {
            try {
              const c = await fs.readFile(p, 'utf8');
              return h + `\`\`\`${e.slice(1)}\n${c}\n\`\`\`\n\n`;
            } catch {
              return h + '*Error reading file*\n\n';
            }
          }
          return h + '*Binary file*\n\n';
        });
        return (await Promise.all(m)).join('');
      };
      const m = await r(t);
      await fs.rm(t, { recursive: true, force: true });
      return m.trim();
    } catch (e) {
      await fs.rm(t, { recursive: true, force: true });
      throw e;
    }
  }
}