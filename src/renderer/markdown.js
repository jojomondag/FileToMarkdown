const marked = require('marked');
const Prism = require('prismjs');

// Load Prism components
require('prismjs/components/prism-markup-templating');
require('prismjs/components/prism-php');
require('prismjs/components/prism-python');
require('prismjs/components/prism-javascript');
require('prismjs/components/prism-typescript');
require('prismjs/components/prism-jsx');
require('prismjs/components/prism-tsx');
require('prismjs/components/prism-css');
require('prismjs/components/prism-scss');
require('prismjs/components/prism-json');
require('prismjs/components/prism-java');
require('prismjs/components/prism-c');
require('prismjs/components/prism-cpp');
require('prismjs/components/prism-csharp');
require('prismjs/components/prism-markdown');
require('prismjs/components/prism-yaml');
require('prismjs/components/prism-bash');
require('prismjs/components/prism-shell-session');
require('prismjs/components/prism-sql');

class MarkdownRenderer {
    constructor(options = {}) {
        this.options = {
            highlight: true,
            ...options
        };

        marked.setOptions({
            highlight: (code, lang) => {
                if (!this.options.highlight) return code;
                
                try {
                    if (lang && Prism.languages[lang]) {
                        return Prism.highlight(code, Prism.languages[lang], lang);
                    }
                    // Fallback to plain text if language not found
                    return code;
                } catch (error) {
                    console.warn('Highlighting failed:', error);
                    return code;
                }
            },
            ...options
        });

        // Make Prism available globally for manual highlighting
        if (typeof window !== 'undefined') {
            window.Prism = Prism;
        }
    }

    render(markdown) {
        try {
            const html = marked.parse(markdown);
            return html;
        } catch (error) {
            throw new Error(`Markdown rendering failed: ${error.message}`);
        }
    }

    highlightAll() {
        if (typeof window !== 'undefined' && this.options.highlight) {
            Prism.highlightAll();
        }
    }
}

module.exports = MarkdownRenderer; 