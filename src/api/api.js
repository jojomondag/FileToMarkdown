const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const marked = require('marked');
const Prism = require('prismjs');
const { MarkitDown } = require('../index.js');
const { langMap } = require('../converters/code');

// Load Prism components for syntax highlighting
const loadPrismComponents = () => {
    // Only load components in browser environment
    if (typeof window === 'undefined') return;

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

// Simple markdown renderer with syntax highlighting
class MarkdownRenderer {
    constructor(options = {}) {
        this.options = {
            highlight: true,
            ...options
        };

        // Load language components if in browser
        loadPrismComponents();

        // Configure marked with syntax highlighting
        marked.setOptions({
            highlight: (code, lang) => {
                if (!this.options.highlight) return code;
                
                try {
                    if (lang && Prism.languages[lang]) {
                        return Prism.highlight(code, Prism.languages[lang], lang);
                    }
                    return code;
                } catch (error) {
                    console.warn('Highlighting failed:', error);
                    return code;
                }
            }
        });
    }

    render(markdown) {
        try {
            return marked.parse(markdown);
        } catch (error) {
            throw new Error(`Markdown rendering failed: ${error.message}`);
        }
    }

    highlightAll() {
        if (this.options.highlight) {
            Prism.highlightAll();
        }
    }
}

const app = express();
app.use(cors());
app.use(express.text());

// Serve static files from src directory
app.use(express.static(path.join(__dirname, '..')));

// Serve the viewer at root
app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'viewer.html'));
});

/**
 * Multer Configuration for File Uploads
 * Handles file uploads, saves temporarily, manages file info, and cleans up
 */
const upload = multer({ 
  storage: multer.diskStorage({
    destination: async (_req, _file, cb) => {
      const tempDir = path.join(os.tmpdir(), 'filetomarkdown-uploads');
      await fs.mkdir(tempDir, { recursive: true });
      cb(null, tempDir);
    },
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  })
});

app.get('/api/filetypes', (_req, res) => {
  try {
    const typeMap = {
      'pdf': 'PDF Documents', 'txt': 'Text Files', 'docx': 'Word Documents',
      'pptx': 'PowerPoint Presentations', 'xlsx': 'Excel Spreadsheets',
      '7z': '7-Zip Archives', 'zip': 'ZIP Archives',
      ...Object.fromEntries(require('../converters/code').supportedExtensions
        .map(ext => [ext, `${ext.toUpperCase()} Source Files`]))
    };
    res.json({ fileTypes: Object.keys(typeMap), descriptions: typeMap, status: 200 });
  } catch (error) {
    res.status(500).json({ error: error.message, status: 500 });
  }
});

app.post('/api/render', async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ error: 'No markdown content provided', status: 400 });
    const renderer = new MarkdownRenderer({ highlight: true });
    const html = renderer.render(req.body);
    renderer.highlightAll();
    res.json({ html, status: 200 });
  } catch (error) {
    res.status(500).json({ error: error.message, status: 500 });
  }
});

app.post('/api/convert', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded', status: 400 });
  try {
    const markdown = await new MarkitDown().convertToMarkdown(req.file.path);
    await fs.unlink(req.file.path);
    res.json({ markdown, status: 200 });
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: error.message, status: 500 });
  }
});

app.listen(process.env.PORT || 3000, () => console.log(`API server running on port ${process.env.PORT || 3000}`));

module.exports = app; 