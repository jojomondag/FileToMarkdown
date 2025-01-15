const marked = require('marked');
const Prism = require('prismjs');
const { langMap } = require('../converters/code');

// Automatically load Prism components based on supported languages
const loadPrismComponents = () => {
    // Get unique languages from langMap
    const languages = [...new Set(Object.values(langMap))];
    
    // Always include markdown for documentation
    languages.push('markdown');
    
    languages.forEach(lang => {
        try {
            // Handle special cases
            const componentName = {
                'markup': 'markup',          // HTML, Vue, Svelte
                'shell': 'bash',             // Shell scripts
                'plaintext': null            // No highlighting needed
            }[lang] || lang;
            
            if (componentName) {
                require(`prismjs/components/prism-${componentName}`);
            }
        } catch (error) {
            console.warn(`Failed to load Prism component for ${lang}:`, error.message);
        }
    });
};

// Load all required Prism components
loadPrismComponents();

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
module.exports.default = MarkdownRenderer; 