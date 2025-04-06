const marked = require('marked');
const Prism = require('prismjs');
const { langMap } = require('../converters/code');

// Initialize Prism in browser environment
if (typeof window !== 'undefined') {
    window.Prism = Prism;
}

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
            // Common web languages
            'js': 'javascript',
            'html': 'markup',
            'htm': 'markup',
            'xml': 'markup',
            'css': 'css',
            'scss': 'scss',
            'less': 'less',
            'json': 'json',

            // Programming languages
            'java': 'java',
            'cs': 'csharp',
            'py': 'python',
            'rb': 'ruby',
            'cpp': 'cpp',
            'c': 'c',
            'h': 'c',
            'hpp': 'cpp',
            'go': 'go',
            'rs': 'rust',
            'php': 'php',
            'swift': 'swift',
            'kt': 'kotlin',
            'scala': 'scala',
            'dart': 'dart',
            'lua': 'lua',
            'r': 'r',
            'm': 'matlab',
            'pl': 'perl',
            'ts': 'typescript',

            // Shell and scripting
            'sh': 'bash',
            'bash': 'bash',
            'zsh': 'bash',
            'ps1': 'powershell',
            'bat': 'batch',
            'cmd': 'batch',

            // Database
            'sql': 'sql',
            'pgsql': 'pgsql',
            'mysql': 'sql',

            // Framework-specific
            'jsx': 'jsx',
            'tsx': 'tsx',
            'vue': 'markup',
            'svelte': 'markup',
            'astro': 'markup',

            // Config files
            'yml': 'yaml',
            'yaml': 'yaml',
            'toml': 'toml',
            'ini': 'ini',
            'conf': 'nginx',
            'dockerfile': 'dockerfile',
            'docker': 'dockerfile',

            // Other
            'md': 'markdown',
            'tex': 'latex',
            'graphql': 'graphql',
            'gql': 'graphql',
            ...langMap
        };

        if (this.options.loadLanguages) {
            this.loadPrismComponents();
        }

        // Create a new marked instance with enhanced options
        this.marked = new marked.Marked({
            highlight: (code, lang) => this.highlightCode(code, lang),
            langPrefix: 'language-',
            gfm: true,
            breaks: true,
            pedantic: false,
            mangle: false,
            headerIds: true,
            // Ensure links are properly rendered
            renderer: {
                link(href, title, text) {
                    // Safe URL handling
                    const safeHref = href.replace(/"/g, '&quot;');
                    const titleAttr = title ? ` title="${title.replace(/"/g, '&quot;')}"` : '';
                    return `<a href="${safeHref}"${titleAttr}>${text}</a>`;
                }
            },
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
        if (!this.options.highlight) {
            return code;
        }

        // Clean up the language identifier
        const language = (this.languageMap[lang] || lang || '').toLowerCase();

        try {
            // If no language is specified or language is plaintext, return as-is
            if (!language || language === 'plaintext' || language === 'text') {
                return code;
            }

            // Make sure the language exists in Prism
            if (Prism.languages[language]) {
                return Prism.highlight(code, Prism.languages[language], language);
            }
            
            // If language not found, try to load it
            if (this.options.loadLanguages) {
                try {
                    require(`prismjs/components/prism-${language}`);
                    if (Prism.languages[language]) {
                        return Prism.highlight(code, Prism.languages[language], language);
                    }
                } catch (e) {
                    console.warn(`Failed to load language: ${language}`);
                }
            }
            
            // Fallback to plain text
            return code;
        } catch (error) {
            console.error('Failed to highlight code:', error);
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

            // Wrap the HTML content in a div with rendered-content class
            const wrappedHtml = `<div class="rendered-content">${html}</div>`;

            // Add Prism.js styling if highlighting is enabled
            if (this.options.highlight) {
                const prismCss = `
                    <style>
                    .rendered-content code[class*="language-"],
                    .rendered-content pre[class*="language-"] {
                        color: #f8f8f2 !important;
                        background: none !important;
                        text-shadow: 0 1px rgba(0, 0, 0, 0.3) !important;
                        font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace !important;
                        font-size: 1em !important;
                        text-align: left !important;
                        white-space: pre !important;
                        word-spacing: normal !important;
                        word-break: normal !important;
                        word-wrap: normal !important;
                        line-height: 1.5 !important;
                        tab-size: 4 !important;
                        hyphens: none !important;
                    }
                    
                    .rendered-content pre[class*="language-"] {
                        position: relative !important;
                        margin: .5em 0 !important;
                        overflow: auto !important;
                        padding: 1em !important;
                        background: #282a36 !important;
                        border-radius: 0.3em !important;
                    }
                    
                    .rendered-content :not(pre) > code[class*="language-"] {
                        padding: .1em !important;
                        border-radius: .3em !important;
                        white-space: normal !important;
                        background: #282a36 !important;
                    }
                    
                    .rendered-content .token.comment,
                    .rendered-content .token.prolog,
                    .rendered-content .token.doctype,
                    .rendered-content .token.cdata {
                        color: #6272a4 !important;
                    }
                    
                    .rendered-content .token.punctuation {
                        color: #f8f8f2 !important;
                    }
                    
                    .rendered-content .token.namespace {
                        opacity: .7 !important;
                    }
                    
                    .rendered-content .token.property,
                    .rendered-content .token.tag,
                    .rendered-content .token.constant,
                    .rendered-content .token.symbol,
                    .rendered-content .token.deleted {
                        color: #ff79c6 !important;
                    }
                    
                    .rendered-content .token.boolean,
                    .rendered-content .token.number {
                        color: #bd93f9 !important;
                    }
                    
                    .rendered-content .token.selector,
                    .rendered-content .token.attr-name,
                    .rendered-content .token.string,
                    .rendered-content .token.char,
                    .rendered-content .token.builtin,
                    .rendered-content .token.inserted {
                        color: #50fa7b !important;
                    }
                    
                    .rendered-content .token.operator,
                    .rendered-content .token.entity,
                    .rendered-content .token.url,
                    .rendered-content .language-css .token.string,
                    .rendered-content .style .token.string {
                        color: #f8f8f2 !important;
                    }
                    
                    .rendered-content .token.atrule,
                    .rendered-content .token.attr-value,
                    .rendered-content .token.keyword {
                        color: #ff79c6 !important;
                    }
                    
                    .rendered-content .token.function,
                    .rendered-content .token.class-name {
                        color: #8be9fd !important;
                    }
                    
                    .rendered-content .token.regex,
                    .rendered-content .token.important,
                    .rendered-content .token.variable {
                        color: #f1fa8c !important;
                    }
                    
                    .rendered-content .token.important,
                    .rendered-content .token.bold {
                        font-weight: bold !important;
                    }
                    
                    .rendered-content .token.italic {
                        font-style: italic !important;
                    }
                    
                    .rendered-content .token.entity {
                        cursor: help !important;
                    }
                    </style>
                `;
                return prismCss + wrappedHtml;
            }

            return wrappedHtml;
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