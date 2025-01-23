const marked = require('marked');
const Prism = require('prismjs');
const { langMap } = require('../converters/code');

class MarkdownRenderer {
    constructor(options = {}) {
        this.options = {
            highlight: true,
            loadLanguages: typeof window === 'undefined',
            ...options
        };

        this.languageMap = {
            'js': 'javascript',
            'py': 'python',
            'rb': 'ruby',
            'cs': 'csharp',
            'ts': 'typescript',
            'html': 'markup',
            'xml': 'markup',
            'vue': 'markup',
            'svelte': 'markup',
            ...langMap
        };

        if (this.options.loadLanguages) {
            this.loadPrismComponents();
        }

        marked.setOptions({
            highlight: (code, lang) => this.highlightCode(code, lang),
            langPrefix: 'language-',
            gfm: true,
            breaks: true,
            ...options
        });
    }

    loadPrismComponents() {
        const languages = [...new Set(Object.values(langMap))];
        languages.push('markdown');

        languages.forEach(lang => {
            try {
                const componentName = {
                    'markup': 'markup',
                    'shell': 'bash',
                    'plaintext': null
                }[lang] || lang;

                if (componentName) {
                    require(`prismjs/components/prism-${componentName}`);
                }
            } catch (error) {
                console.warn(`Prism component error: ${error.message}`);
            }
        });
    }

    highlightCode(code, lang) {
        if (!this.options.highlight) return code;
        
        try {
            const language = this.languageMap[lang] || lang;
            if (Prism.languages[language]) {
                return Prism.highlight(code, Prism.languages[language], language);
            }
            return code;
        } catch (error) {
            console.warn('Highlighting failed:', error);
            return code;
        }
    }

    render(content) {
        return marked.parse(content);
    }

    highlightAll() {
        if (typeof window !== 'undefined' && this.options.highlight) {
            Prism.highlightAll();
        }
    }
}

module.exports = MarkdownRenderer;