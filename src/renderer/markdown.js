const marked = require('marked');
const Prism = require('prismjs');
const { langMap } = require('../converters/code');

// Load core components first
require('prismjs/components/prism-core');
require('prismjs/components/prism-markup');
require('prismjs/components/prism-clike');
require('prismjs/components/prism-javascript');

// Explicitly load C# and Java components
require('prismjs/components/prism-java');
require('prismjs/components/prism-csharp');

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
            'csharp': 'csharp',
            'java': 'java',
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

        // Create a new marked instance
        this.marked = new marked.Marked({
            highlight: (code, lang) => this.highlightCode(code, lang),
            langPrefix: 'language-',
            gfm: true,
            breaks: true,
            pedantic: false,
            mangle: false,
            headerIds: true,
            ...options
        });
    }

    loadPrismComponents() {
        // Get all unique languages from both languageMap and langMap
        const allLanguages = new Set([
            ...Object.values(this.languageMap),
            ...Object.values(langMap),
            'markdown',
            'csharp',
            'java'
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
        const baseLanguages = ['markup', 'clike', 'javascript', 'c', 'java', 'csharp'];
        
        // Load base languages first
        baseLanguages.forEach(lang => {
            try {
                require(`prismjs/components/prism-${lang}`);
                console.log(`Loaded language: ${lang}`);
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
                    'plaintext': null,
                    'cs': 'csharp'
                }[lang] || lang;

                if (componentName && !baseLanguages.includes(componentName)) {
                    // Load dependencies first
                    if (dependencies[componentName]) {
                        dependencies[componentName].forEach(dep => {
                            try {
                                require(`prismjs/components/prism-${dep}`);
                                console.log(`Loaded dependency: ${dep} for ${componentName}`);
                            } catch (error) {
                                // Ignore if already loaded
                            }
                        });
                    }
                    
                    try {
                        require(`prismjs/components/prism-${componentName}`);
                        console.log(`Loaded language: ${componentName}`);
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
            // Map common extensions to their language names
            const languageMap = {
                'cs': 'csharp',
                'js': 'javascript',
                'ts': 'typescript',
                'py': 'python',
                'rb': 'ruby'
            };

            const language = languageMap[lang] || this.languageMap[lang] || lang;
            
            if (!Prism.languages[language]) {
                console.warn(`Language not loaded: ${language}`);
                return code;
            }

            if (language && Prism.languages[language]) {
                console.log(`Highlighting code for language: ${language}`);
                return Prism.highlight(code, Prism.languages[language], language);
            }
            return code;
        } catch (error) {
            console.warn('Highlighting failed:', error);
            return code;
        }
    }

    render(content) {
        try {
            // Ensure content is a string and not empty
            const markdownContent = (content || '').toString().trim();
            if (!markdownContent) {
                return '<p><em>No content to render</em></p>';
            }

            // Parse markdown to HTML using our marked instance
            const html = this.marked.parse(markdownContent);
            if (!html) {
                throw new Error('Marked parser returned empty result');
            }

            return html;
        } catch (error) {
            console.error('Markdown rendering failed:', error);
            return `<p class="error">Failed to render markdown: ${error.message}</p>`;
        }
    }

    highlightAll() {
        if (typeof window !== 'undefined' && this.options.highlight) {
            Prism.highlightAll();
        }
    }
}

module.exports = MarkdownRenderer;