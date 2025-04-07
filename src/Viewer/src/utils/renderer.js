import { LANGUAGE_MAPPINGS } from './constants';

/**
 * Simple renderer for Markdown content
 */
class BrowserRenderer {
    constructor() {
        this.markedInstance = window.marked;
        
        // Configure marked options if available
        if (this.markedInstance && typeof this.markedInstance.setOptions === 'function') {
            this.markedInstance.setOptions({
                breaks: true,
                gfm: true,
                headerIds: true,
                highlight: function(code, lang) {
                    if (window.Prism && lang && window.Prism.languages[lang]) {
                        try {
                            return window.Prism.highlight(code, window.Prism.languages[lang], lang);
                        } catch (e) {
                            console.error('Error highlighting code:', e);
                            return code;
                        }
                    }
                    return code;
                }
            });
            
            // Add support for embedded content (YouTube, Vimeo, CodePen)
            const embedExtension = {
                name: 'embed',
                level: 'block',
                start(src) { return src.match(/^@\[/) ? 0 : -1; },
                tokenizer(src) {
                    const rule = /^@\[([a-z]+)\]\(([^)]+)\)(?:\{([^}]+)\})?/;
                    const match = rule.exec(src);
                    if (match) {
                        return {
                            type: 'embed',
                            raw: match[0],
                            embedType: match[1],
                            url: match[2],
                            attributes: match[3] || ''
                        };
                    }
                    return undefined;
                },
                renderer(token) {
                    // Parse attributes
                    const attrMap = {};
                    if (token.attributes) {
                        const pairs = token.attributes.split(' ');
                        for (const pair of pairs) {
                            const [key, value] = pair.split('=');
                            if (key && value) {
                                attrMap[key] = value.replace(/["']/g, '');
                            }
                        }
                    }
                    
                    // Default dimensions
                    const width = attrMap.width || '560';
                    const height = attrMap.height || '315';
                    
                    switch (token.embedType) {
                        case 'youtube': {
                            // Extract video ID from URL
                            let videoId = token.url;
                            const ytMatch = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/.exec(token.url);
                            if (ytMatch) videoId = ytMatch[1];
                            
                            return `<div class="embed youtube">
                                      <iframe width="${width}" height="${height}" 
                                              src="https://www.youtube.com/embed/${videoId}" 
                                              frameborder="0" 
                                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                              allowfullscreen></iframe>
                                    </div>`;
                        }
                        case 'vimeo': {
                            // Extract video ID from URL
                            let videoId = token.url;
                            const vimeoMatch = /vimeo\.com\/(?:video\/)?([0-9]+)/.exec(token.url);
                            if (vimeoMatch) videoId = vimeoMatch[1];
                            
                            return `<div class="embed vimeo">
                                      <iframe width="${width}" height="${height}" 
                                              src="https://player.vimeo.com/video/${videoId}" 
                                              frameborder="0" 
                                              allow="autoplay; fullscreen; picture-in-picture" 
                                              allowfullscreen></iframe>
                                    </div>`;
                        }
                        case 'codepen': {
                            return `<div class="embed codepen">
                                      <iframe height="${height}" style="width: 100%;" scrolling="no" title="CodePen Embed" 
                                              src="${token.url}" 
                                              frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
                                      </iframe>
                                    </div>`;
                        }
                        default:
                            return `<div class="embed unknown">Unsupported embed type: ${token.embedType}</div>`;
                    }
                }
            };
            
            // Register the extension with marked
            this.markedInstance.use({ extensions: [embedExtension] });
        }
    }
    
    /**
     * Render markdown content to HTML
     * @param {string} content - Markdown content
     * @returns {string} HTML content
     */
    render(content) {
        if (!content) return '<div class="empty-content">No content to display</div>';
        
        try {
            if (this.markedInstance) {
                return this.markedInstance.parse(content);
            } else {
                console.error('Marked library not available');
                return `<pre>${content}</pre>`;
            }
        } catch (error) {
            console.error('Error rendering markdown:', error);
            return `<div class="render-error">Error rendering content</div><pre>${content}</pre>`;
        }
    }
    
    /**
     * Apply syntax highlighting to code blocks
     */
    highlightAll() {
        if (window.Prism && typeof window.Prism.highlightAll === 'function') {
            window.Prism.highlightAll();
        }
    }
}

export default BrowserRenderer; 