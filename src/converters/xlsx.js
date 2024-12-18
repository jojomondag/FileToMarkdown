module.exports = class {
  async convert(f) {
    const X = require('xlsx');
    const wb = X.readFile(f);
    const isEmptyCell = v => (v == null || (typeof v === 'string' && !v.trim()));
    return wb.SheetNames.map(s => {
      const ws = wb.Sheets[s];
      const data = X.utils.sheet_to_json(ws, { header: 1, defval: '' });
      if (!data.length) return `# ${s}\n\n---\n\n`;
      let lastRow = data.length - 1;
      while (lastRow >= 0 && data[lastRow].every(cell => isEmptyCell(cell))) lastRow--;
      const trimmedRows = data.slice(0, lastRow + 1);
      if (!trimmedRows.length) return `# ${s}\n\n---\n\n`;
      let lastCol = -1;
      for (const row of trimmedRows) {
        let scanIndex = row.length - 1;
        while (scanIndex >= 0 && isEmptyCell(row[scanIndex])) scanIndex--;
        if (scanIndex > lastCol) lastCol = scanIndex;
      }
      if (lastCol < 0) return `# ${s}\n\n---\n\n`;
      const outputRows = trimmedRows.map(r => r.slice(0, lastCol + 1));
      const maxCol = lastCol + 1;
      return [
        `# ${s}\n`,
        `| ${Array(maxCol).fill('').join(' | ')} |`,
        `| ${Array(maxCol).fill('---').join(' | ')} |`,
        ...outputRows.map(r => {
          const filledRow = [...r, ...Array(maxCol - r.length).fill('')].slice(0, maxCol);
          return `| ${filledRow.map(c => c ?? '').join(' | ')} |`;
        }),
        '\n---\n'
      ].join('\n');
    }).join('\n').trim();
  }
};