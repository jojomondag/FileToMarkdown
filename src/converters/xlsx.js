module.exports = class {
  async convert(f) {
    const X = require('xlsx-js-style'), w = X.readFile(f), e = v=>(v==null||(typeof v==='string'&&!v.trim()));
    return w.SheetNames.map(s=>{const d=X.utils.sheet_to_json(w.Sheets[s],{header:1,defval:''});if(!d.length)return`# ${s}\n\n---\n\n`;let r=d.length-1;while(r>=0&&d[r].every(c=>e(c)))r--;const t=d.slice(0,r+1);if(!t.length)return`# ${s}\n\n---\n\n`;let c=-1;for(const r of t){let i=r.length-1;while(i>=0&&e(r[i]))i--;if(i>c)c=i}if(c<0)return`# ${s}\n\n---\n\n`;const o=t.map(r=>r.slice(0,c+1));return[`# ${s}\n`,`| ${Array(c+1).fill('').join(' | ')} |`,`| ${Array(c+1).fill('---').join(' | ')} |`,...o.map(r=>`| ${[...r,...Array(c+1-r.length).fill('')].slice(0,c+1).map(c=>c??'').join(' | ')} |`),'\n---\n'].join('\n')}).join('\n').trim();
  }
}