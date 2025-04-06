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