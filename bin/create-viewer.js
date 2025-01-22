#!/usr/bin/env node

const path = require('path');
const fs = require('fs').promises;

async function createViewer(targetDir = process.cwd()) {
    try {
        const viewerDest = path.join(targetDir, 'viewer.html');
        
        // Create the complete HTML content
        const languageScripts = `
    <!-- Common programming languages -->
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-javascript.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-python.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-java.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-cpp.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-csharp.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-ruby.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-go.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-rust.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-bash.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-sql.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-json.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-yaml.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-xml.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-typescript.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-php.min.js"></script>`;

        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>FileToMarkdown Viewer</title>
    <link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-markdown.min.js"></script>${languageScripts}
    <style>
        body,#c{margin:0;background:#fff}body{font-family:-apple-system,system-ui,sans-serif;line-height:1.6;padding:0;background:#f5f5f5;min-height:100vh;display:flex}.p,.m{transition:all .3s ease}.p{width:300px;border-right:1px solid #eee;height:100vh;position:fixed;left:0;top:0;display:flex;flex-direction:column;background:#f8fafc;box-shadow:0 2px 4px rgba(0,0,0,.1)}.p.h{left:-300px}.h{display:flex;align-items:center;padding:15px;border-bottom:1px solid #eee;background:#f8fafc}.t{font-size:1.1em;font-weight:500;color:#2c3e50;margin:0;flex:1}.z{border-bottom:2px dashed #0366d6;padding:15px;text-align:center;cursor:pointer;background:#f8fafc;transition:.2s ease}.z:hover,.z.d{background:#e6f3ff}.z.d{border-color:#0255b3}.l{flex:1;overflow-y:auto;padding:15px}.l ul{list-style:none;padding:0;margin:0}.l li{margin:8px 0}.l a{color:#2c3e50;text-decoration:none;display:block;padding:8px 12px;border-radius:4px;transition:.2s ease}.l a:hover{background:#f0f4f8;color:#0366d6}.m{margin-left:300px;flex:1;padding:40px;max-width:100%}.m.e{margin-left:0}#c{max-width:1200px;margin:auto;padding:40px;border-radius:8px;word-wrap:break-word;box-shadow:0 2px 4px rgba(0,0,0,.1)}#f{display:none}.b{position:fixed;top:5px;left:255px;z-index:1000;padding:8px;background:#fff;border:1px solid #eee;border-radius:4px;color:#666;cursor:pointer;display:flex;align-items:center;justify-content:center;width:40px;height:40px;transition:.2s ease}.b.n{left:10px}.b:hover{background:#f0f4f8;color:#0366d6}pre,code{background:#f6f8fa;border-radius:6px}pre{padding:16px;overflow-x:auto;max-width:100%;border:1px solid #e1e4e8}code{font-family:SFMono-Regular,monospace;font-size:.9em;padding:.2em .4em}pre code{padding:0;background:0}table{border-collapse:collapse;width:100%;margin:1em 0;overflow-x:auto;display:block}th,td{border:1px solid #dfe2e5;padding:8px 12px;text-align:left}th{background:#f6f8fa}img{max-width:100%;height:auto;display:block;margin:1em auto}a{word-break:break-word}@media(max-width:768px){.p{transform:translateX(-100%)}.p.active{transform:translateX(0)}.m{margin-left:0;padding:20px}}@media(min-width:1920px){#c{padding:60px;max-width:1600px}}@media(min-width:3440px){#c{max-width:2000px}}
    </style>
</head>
<body>
    <button class="b" id="b"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg></button>
    <div class="p">
        <div class="h"><h1 class="t">FileToMarkdown</h1></div>
        <div class="z" id="z">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            <p>Drop MD files here<br>or click to browse</p>
        </div>
        <div class="l" id="l"></div>
    </div>
    <div class="m">
        <div id="c">
            <h2>Welcome to FileToMarkdown Viewer</h2>
            <p>To view a markdown file:</p>
            <ul><li>Drop a markdown file onto the drop zone, or</li><li>Click the drop zone to browse for markdown files</li></ul>
        </div>
    </div>
    <input type="file" id="f" accept=".md" multiple>
    <script>
        // Initialize variables and functions
        const $=i=>document.getElementById(i);
        const c=$('c');
        const p=document.querySelector('.p');
        const m=document.querySelector('.m');
        const b=$('b');
        const z=$('z');
        const f=$('f');

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
                    throw new Error(\`Markdown rendering failed: \${error.message}\`);
                }
            }

            highlightAll() {
                if (this.options.highlight && typeof Prism !== 'undefined') {
                    Prism.highlightAll();
                }
            }
        }

        const r = new MarkdownRenderer();
        window.f = [];

        // File handling functions
        const u = () => {
            window.f && ($('l').innerHTML = \`<ul>\${window.f.map((f,i)=>\`<li><a href="#" onclick="L(\${i});return false">\${f.webkitRelativePath||f.name}</a></li>\`).join('')}</ul>\`);
        };

        const L = i => {
            const f = window.f[i];
            if (!f) return;
            const R = new FileReader();
            R.onload = e => {
                c.innerHTML = r.render(e.target.result);
                c.classList.add('viewing-markdown');
                r.highlightAll();
            };
            R.onerror = e => c.innerHTML = \`<p style="color:red">Error reading file: \${e.target.error}</p>\`;
            R.readAsText(f);
        };

        const H = f => {
            const m = Array.from(f).filter(f=>f.name.toLowerCase().endsWith('.md'));
            if (m.length) {
                window.f.push(...m);
                u();
                if (window.f.length === m.length) L(0);
            } else {
                c.innerHTML = '<p style="color:red">Please select a markdown (.md) file.</p>';
            }
        };

        // Event listeners
        z.addEventListener('click', () => f.click());
        f.addEventListener('change', e => H(e.target.files));
        
        ['dragover', 'dragleave', 'drop'].forEach(e => 
            z.addEventListener(e, v => {
                v.preventDefault();
                z.classList.toggle('d', e === 'dragover');
                if (e === 'drop') H(v.dataTransfer.files);
            })
        );

        // Toggle sidebar
        const t = () => {
            p.classList.toggle('h');
            m.classList.toggle('e');
            b.classList.toggle('n');
            localStorage.setItem('h', p.classList.contains('h'));
        };

        b.onclick = t;
        document.onkeydown = e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                t();
            }
        };

        // Restore sidebar state
        if (localStorage.getItem('h') === 'true') {
            p.classList.add('h');
            m.classList.add('e');
            b.classList.add('n');
        }
    </script>
</body>
</html>`;

        await fs.writeFile(viewerDest, htmlContent);
        console.log('✓ Created viewer.html with syntax highlighting support');
        console.log('\nViewer created successfully!');
        console.log('To use:');
        console.log('1. Open viewer.html in your browser');
        console.log('2. Drop your markdown files onto it or use the browse button');

    } catch (error) {
        console.error('Error creating viewer:', error.message);
        process.exit(1);
    }
}

// If directory is provided as argument, use it
const targetDir = process.argv[2] || process.cwd();
createViewer(targetDir); 