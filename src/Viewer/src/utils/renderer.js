import { LANGUAGE_MAPPINGS } from './constants';

/**
 * Renderer for markdown content with syntax highlighting
 */
class BrowserRenderer {
    constructor() {
        this.configureMarked();
        if (typeof window !== 'undefined') window.Prism = Prism;
    }

    configureMarked() {
        marked.setOptions({
            highlight: (code, lang) => {
                try {
                    const language = LANGUAGE_MAPPINGS[lang] || lang;
                    return Prism.languages[language] 
                        ? Prism.highlight(code, Prism.languages[language], language)
                        : code;
                } catch { return code; }
            },
            langPrefix: 'language-',
            gfm: true,
            breaks: true
        });
    }

    render(content) {
        return marked.parse(content);
    }

    highlightAll() {
        Prism?.highlightAll();
    }
}

export default BrowserRenderer; 