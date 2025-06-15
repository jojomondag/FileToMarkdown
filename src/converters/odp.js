module.exports = class {
  async convert(f) {
    const z = new (require('adm-zip'))(await require('fs').promises.readFile(f));
    const x = new (require('xml2js')).Parser();
    
    try {
      const contentEntry = z.getEntry('content.xml');
      if (!contentEntry) {
        return '# Presentation\n\nNo content found.\n\n---\n\n';
      }
      
      const content = await x.parseStringPromise(z.readAsText(contentEntry.entryName));
      const slides = [];
      let slideNum = 1;
      
      const extractText = (obj) => {
        const texts = [];
        const traverse = (o) => {
          if (!o) return;
          if (Array.isArray(o)) {
            o.forEach(traverse);
          } else if (typeof o === 'object') {
            // Handle direct text content
            if (typeof o === 'string') {
              texts.push(o);
              return;
            }
            
            // Handle text:p elements (paragraphs)
            if (o['text:p']) {
              if (Array.isArray(o['text:p'])) {
                o['text:p'].forEach(p => {
                  if (typeof p === 'string') {
                    texts.push(p);
                  } else if (p._) {
                    texts.push(p._);
                  } else if (p['text:span']) {
                    if (Array.isArray(p['text:span'])) {
                      p['text:span'].forEach(s => {
                        if (typeof s === 'string') texts.push(s);
                        else if (s._) texts.push(s._);
                      });
                    } else if (p['text:span']._) {
                      texts.push(p['text:span']._);
                    }
                  }
                });
              } else if (typeof o['text:p'] === 'string') {
                texts.push(o['text:p']);
              } else if (o['text:p']._) {
                texts.push(o['text:p']._);
              }
            }
            
            // Handle text:span elements
            if (o['text:span']) {
              if (Array.isArray(o['text:span'])) {
                o['text:span'].forEach(s => {
                  if (typeof s === 'string') texts.push(s);
                  else if (s._) texts.push(s._);
                });
              } else if (typeof o['text:span'] === 'string') {
                texts.push(o['text:span']);
              } else if (o['text:span']._) {
                texts.push(o['text:span']._);
              }
            }
            
            // Handle direct _ content
            if (o._ && typeof o._ === 'string') {
              texts.push(o._);
            }
            
            // Recursively traverse all object properties
            Object.values(o).forEach(traverse);
          } else if (typeof o === 'string') {
            texts.push(o);
          }
        };
        traverse(obj);
        return texts.filter(t => t && t.trim().length > 0);
      };
      
      const presentation = content['office:document-content']['office:body'][0]['office:presentation'];
      if (presentation && presentation[0] && presentation[0]['draw:page']) {
        const pages = Array.isArray(presentation[0]['draw:page']) ? presentation[0]['draw:page'] : [presentation[0]['draw:page']];
        
        pages.forEach((page, index) => {
          const texts = extractText(page);
          const slideContent = texts.length > 0 ? texts.join('\n') : 'No text content found.';
          slides.push(`# Slide ${index + 1}\n\n${slideContent}\n\n---\n\n`);
        });
      }
      
      return slides.length > 0 ? slides.join('').trim() : '# Presentation\n\nNo slides found.\n\n---\n\n';
    } catch (error) {
      return `# Presentation\n\nError reading presentation: ${error.message}\n\n---\n\n`;
    }
  }
} 