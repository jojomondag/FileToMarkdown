module.exports = class {
  async convert(f) {
    const z = new (require('adm-zip'))(await require('fs').promises.readFile(f));
    const x = new (require('xml2js')).Parser();
    
    try {
      const contentEntry = z.getEntry('content.xml');
      if (!contentEntry) {
        return '# Document\n\nNo content found.\n\n';
      }
      
      const content = await x.parseStringPromise(z.readAsText(contentEntry.entryName));
      let markdown = '';
      
      const extractTextFromParagraphs = (obj) => {
        const texts = [];
        const traverse = (o, isHeading = false, headingLevel = 1) => {
          if (!o) return;
          
          if (Array.isArray(o)) {
            o.forEach(item => traverse(item, isHeading, headingLevel));
          } else if (typeof o === 'object') {
                         // Handle text:h (headings)
             if (o['text:h']) {
               const headings = Array.isArray(o['text:h']) ? o['text:h'] : [o['text:h']];
               headings.forEach(h => {
                 const level = parseInt(h.$?.['text:outline-level']) || 1;
                 const headingText = extractTextContent(h).replace(/P\d+/g, '').trim();
                 if (headingText) {
                   texts.push(`${'#'.repeat(Math.min(level, 6))} ${headingText}\n\n`);
                 }
               });
             }
             
             // Handle text:p (paragraphs)
             if (o['text:p']) {
               const paragraphs = Array.isArray(o['text:p']) ? o['text:p'] : [o['text:p']];
               paragraphs.forEach(p => {
                 const paragraphText = extractTextContent(p).replace(/P\d+/g, '').trim();
                 if (paragraphText) {
                   texts.push(`${paragraphText}\n\n`);
                 }
               });
             }
            
            // Handle text:list (lists)
            if (o['text:list']) {
              const lists = Array.isArray(o['text:list']) ? o['text:list'] : [o['text:list']];
              lists.forEach(list => {
                if (list['text:list-item']) {
                  const listItems = Array.isArray(list['text:list-item']) ? list['text:list-item'] : [list['text:list-item']];
                  listItems.forEach(item => {
                    const itemText = extractTextContent(item);
                    if (itemText.trim()) {
                      texts.push(`- ${itemText}\n`);
                    }
                  });
                  texts.push('\n');
                }
              });
            }
            
            // Handle table:table (tables)
            if (o['table:table']) {
              const tables = Array.isArray(o['table:table']) ? o['table:table'] : [o['table:table']];
              tables.forEach(table => {
                const tableMarkdown = convertTableToMarkdown(table);
                if (tableMarkdown) {
                  texts.push(tableMarkdown + '\n\n');
                }
              });
            }
            
            // Recursively traverse other properties
            Object.values(o).forEach(value => traverse(value, isHeading, headingLevel));
          }
        };
        
        traverse(obj);
        return texts.join('');
      };
      
      const extractTextContent = (obj) => {
        const texts = [];
        const traverse = (o) => {
          if (!o) return;
          
          if (typeof o === 'string') {
            texts.push(o);
          } else if (Array.isArray(o)) {
            o.forEach(traverse);
          } else if (typeof o === 'object') {
            // Handle direct text content
            if (o._ && typeof o._ === 'string') {
              texts.push(o._);
            }
            
            // Handle text:span elements
            if (o['text:span']) {
              if (Array.isArray(o['text:span'])) {
                o['text:span'].forEach(s => {
                  if (typeof s === 'string') texts.push(s);
                  else if (s._) texts.push(s._);
                  else traverse(s);
                });
              } else if (typeof o['text:span'] === 'string') {
                texts.push(o['text:span']);
              } else {
                traverse(o['text:span']);
              }
            }
            
            // Handle text:s (spaces)
            if (o['text:s']) {
              const spaceCount = parseInt(o['text:s'].$?.['text:c']) || 1;
              texts.push(' '.repeat(spaceCount));
            }
            
            // Handle text:tab
            if (o['text:tab']) {
              texts.push('\t');
            }
            
            // Handle text:line-break
            if (o['text:line-break']) {
              texts.push('\n');
            }
            
            // Recursively traverse other properties
            Object.values(o).forEach(traverse);
          }
        };
        
                 traverse(obj);
         return texts.join('').replace(/(.+)\1+/g, '$1').trim();
      };
      
      const convertTableToMarkdown = (table) => {
        if (!table['table:table-row']) return '';
        
        const rows = Array.isArray(table['table:table-row']) ? table['table:table-row'] : [table['table:table-row']];
        const markdownRows = [];
        
        rows.forEach((row, rowIndex) => {
          if (row['table:table-cell']) {
            const cells = Array.isArray(row['table:table-cell']) ? row['table:table-cell'] : [row['table:table-cell']];
            const cellTexts = cells.map(cell => extractTextContent(cell) || '');
            markdownRows.push(`| ${cellTexts.join(' | ')} |`);
            
            // Add header separator for first row
            if (rowIndex === 0) {
              markdownRows.push(`| ${cellTexts.map(() => '---').join(' | ')} |`);
            }
          }
        });
        
        return markdownRows.join('\n');
      };
      
      // Extract content from the document
      const body = content['office:document-content']['office:body'][0];
      if (body && body['office:text']) {
        const textContent = body['office:text'][0];
        markdown = extractTextFromParagraphs(textContent);
      }
      
      return markdown.trim() || '# Document\n\nNo readable content found.\n\n';
      
    } catch (error) {
      return `# Document\n\nError reading document: ${error.message}\n\n`;
    }
  }
} 