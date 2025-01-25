const marked = require('marked');
const Prism = require('prismjs');
const { langMap } = require('../converters/code');

// Load core components first
require('prismjs/components/prism-core');
require('prismjs/components/prism-markup');
require('prismjs/components/prism-clike');
require('prismjs/components/prism-javascript');

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
        // Get all unique languages from both languageMap and langMap
        const allLanguages = new Set([
            ...Object.values(this.languageMap),
            ...Object.values(langMap),
            'markdown'
        ]);

        // Define dependencies and load order
        const dependencies = {
            'php': ['markup', 'clike'],
            'javascript': ['clike'],
            'typescript': ['javascript'],
            'jsx': ['markup', 'javascript'],
            'tsx': ['jsx', 'typescript'],
            'cpp': ['c'],
            'csharp': ['clike'],
            'java': ['clike'],
            'kotlin': ['clike'],
            'swift': ['clike'],
            'ruby': ['clike'],
            'python': ['clike'],
            'go': ['clike'],
            'rust': ['clike']
        };

        // Load order for base languages
        const baseLanguages = ['markup', 'clike', 'javascript', 'c'];
        
        // Load base languages first
        baseLanguages.forEach(lang => {
            try {
                require(`prismjs/components/prism-${lang}`);
            } catch (error) {
                console.warn(`Base language ${lang} load error: ${error.message}`);
            }
        });

        // Then load all other languages
        allLanguages.forEach(lang => {
            try {
                const componentName = {
                    'markup': 'markup',
                    'shell': 'bash',
                    'plaintext': null
                }[lang] || lang;

                if (componentName && !baseLanguages.includes(componentName)) {
                    // Load dependencies first
                    if (dependencies[componentName]) {
                        dependencies[componentName].forEach(dep => {
                            try {
                                require(`prismjs/components/prism-${dep}`);
                            } catch (error) {
                                // Ignore if already loaded
                            }
                        });
                    }
                    
                    try {
                        require(`prismjs/components/prism-${componentName}`);
                    } catch (error) {
                        console.warn(`Optional language ${componentName} not available`);
                    }
                }
            } catch (error) {
                // Ignore errors for unsupported languages
            }
        });
    }

    highlightCode(code, lang) {
        if (!this.options.highlight || !lang) return code;
        
        try {
            const language = this.languageMap[lang] || lang;
            if (language && Prism.languages[language]) {
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