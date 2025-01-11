const marked = require('marked');
const Prism = require('prismjs');
require('prismjs/components/prism-markup-templating');
// Add commonly used languages
require('prismjs/components/prism-javascript');
require('prismjs/components/prism-css');
require('prismjs/components/prism-json');
require('prismjs/components/prism-markdown');

class MarkdownRenderer {
    constructor(options = {}) {
        this.options = {
            highlight: true,
            ...options
        };

        marked.setOptions({
            highlight: (code, lang) => {
                if (!this.options.highlight) return code;
                
                if (Prism.languages[lang]) {
                    return Prism.highlight(code, Prism.languages[lang], lang);
                }
                return code;
            },
            ...options
        });
    }

    render(markdown) {
        try {
            const html = marked.parse(markdown);
            return html;
        } catch (error) {
            throw new Error(`Markdown rendering failed: ${error.message}`);
        }
    }

    // Helper method to highlight all code blocks in a DOM element
    highlightAll() {
        if (typeof window !== 'undefined' && this.options.highlight) {
            Prism.highlightAll();
        }
    }
}

module.exports = MarkdownRenderer; 