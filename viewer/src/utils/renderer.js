import { LANGUAGE_MAPPINGS } from './constants';

class MarkdownRenderer {
    constructor() {
        this.configureMarked();
        if (typeof window !== 'undefined') {
            window.Prism = Prism;
        }
    }

    configureMarked() {
        marked.setOptions({
            highlight: (code, lang) => {
                try {
                    const language = this.normalizeLanguage(lang);
                    return Prism.languages[language] 
                        ? Prism.highlight(code, Prism.languages[language], language)
                        : code;
                } catch {
                    return code;
                }
            },
            langPrefix: 'language-',
            gfm: true,
            breaks: true
        });
    }

    normalizeLanguage(lang) {
        return LANGUAGE_MAPPINGS[lang] || lang;
    }

    render(content) {
        return marked.parse(content);
    }

    highlightAll() {
        Prism?.highlightAll();
    }
}

export default MarkdownRenderer; 