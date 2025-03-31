#!/usr/bin/env node
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const https = require('https');
const { convertToMarkdown } = require('../src/index');

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/jojomondag/FileToMarkdown/main/examples';
const VIEWER_SOURCE = path.join(__dirname, '../src/Viewer/viewer.html');

// Create directory structure
const createDirectories = () => {
    const dirs = [
        'examples/exampleFiles/code',
        'examples/outputAfterConversion/code',
        'examples/viewer'
    ];
    
    dirs.forEach(dir => {
        if (!fsSync.existsSync(dir)) {
            fsSync.mkdirSync(dir, { recursive: true });
        }
    });
};

// Setup viewer with GitHub theme
const setupViewer = async () => {
    try {
        const viewerDest = path.join('examples', 'viewer', 'viewer.html');
        const viewerSrcDir = path.join('examples', 'viewer', 'src');
        
        // Create src directory
        if (!fsSync.existsSync(viewerSrcDir)) {
            fsSync.mkdirSync(viewerSrcDir, { recursive: true });
        }
        
        // Copy viewer template
        await fs.copyFile(VIEWER_SOURCE, viewerDest);
        
        // Copy bundle files
        const BUNDLE_JS_SOURCE = path.join(__dirname, '../src/Viewer/src/bundle.js');
        const BUNDLE_CSS_SOURCE = path.join(__dirname, '../src/Viewer/src/bundle.css');
        
        await fs.copyFile(BUNDLE_JS_SOURCE, path.join(viewerSrcDir, 'bundle.js'));
        await fs.copyFile(BUNDLE_CSS_SOURCE, path.join(viewerSrcDir, 'bundle.css'));
        
        const githubCSS = `
        <style>
            /* GitHub-themed additions */
            body { background: #f6f8fa !important; }
            #c { 
                background: #ffffff;
                border: 1px solid #e1e4e8 !important;
                box-shadow: 0 1px 3px rgba(27,31,35,0.04) !important;
            }
            pre { 
                background: #f6f8fa !important;
                border-radius: 6px !important;
                padding: 16px !important;
            }
            .token.keyword { color: #d73a49 !important; }
            .token.string { color: #032f62 !important; }
        </style>`;
        
        await fs.appendFile(viewerDest, githubCSS);
        console.log(`✅ Viewer created: ${path.resolve(viewerDest)}`);
        console.log(`✅ Bundle files copied to: ${path.resolve(viewerSrcDir)}`);

    } catch (error) {
        console.error('❌ Viewer setup failed:', error.message);
        process.exit(1);
    }
};

// Download helper
const downloadFile = (url, outputPath) => new Promise((resolve, reject) => {
    https.get(url, (response) => {
        if (response.statusCode !== 200) {
            reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
            return;
        }

        const fileStream = fsSync.createWriteStream(outputPath);
        response.pipe(fileStream)
            .on('finish', resolve)
            .on('error', (err) => {
                fs.unlink(outputPath, () => reject(err));
            });
    }).on('error', reject);
});

// Test files configuration
const testFiles = [
    {
        type: 'code',
        localPath: 'examples/exampleFiles/code/codeCs.cs',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/code/codeCs.cs`,
        outputPath: 'examples/outputAfterConversion/code/codeCs.md'
    },
    {
        type: 'code',
        localPath: 'examples/exampleFiles/code/codeHtml.html',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/code/codeHtml.html`,
        outputPath: 'examples/outputAfterConversion/code/codeHtml.md'
    },
    {
        type: 'code',
        localPath: 'examples/exampleFiles/code/codeJava.java',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/code/codeJava.java`,
        outputPath: 'examples/outputAfterConversion/code/codeJava.md'
    },
    {
        type: 'code',
        localPath: 'examples/exampleFiles/code/codeJs.js',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/code/codeJs.js`,
        outputPath: 'examples/outputAfterConversion/code/codeJs.md'
    },
    {
        type: 'code',
        localPath: 'examples/exampleFiles/code/codePy.py',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/code/codePy.py`,
        outputPath: 'examples/outputAfterConversion/code/codePy.md'
    },
    {
        type: 'pdf',
        localPath: 'examples/exampleFiles/exampleGardening.pdf',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/exampleGardening.pdf`,
        outputPath: 'examples/outputAfterConversion/exampleGardening.md'
    },
    {
        type: 'docx',
        localPath: 'examples/exampleFiles/exampleProjekt9.docx',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/exampleProjekt9.docx`,
        outputPath: 'examples/outputAfterConversion/exampleProjekt9.md'
    },
    {
        type: 'pptx',
        localPath: 'examples/exampleFiles/exampleBruceLee.pptx',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/exampleBruceLee.pptx`,
        outputPath: 'examples/outputAfterConversion/exampleBruceLee.md'
    },
    {
        type: 'xlsx',
        localPath: 'examples/exampleFiles/exampleProgrammeringYearPlan.xlsx',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/exampleProgrammeringYearPlan.xlsx`,
        outputPath: 'examples/outputAfterConversion/exampleProgrammeringYearPlan.md'
    },
    {
        type: 'zip',
        localPath: 'examples/exampleFiles/exampleLeads.zip',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/exampleLeads.zip`,
        outputPath: 'examples/outputAfterConversion/exampleLeads.md'
    },
    {
        type: '7zip',
        localPath: 'examples/exampleFiles/exampleStudentWorks.7z',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/exampleStudentWorks.7z`,
        outputPath: 'examples/outputAfterConversion/exampleStudentWorks.md'
    }
];

// Main test runner
const runTests = async () => {
    try {
        console.log('🚀 Starting FileToMarkdown Test Suite\n');
        console.log('🌐 Using GitHub examples and styling\n');
        
        createDirectories();
        await setupViewer();

        console.log('\n📂 Project Structure:');
        console.log('├── examples/');
        console.log('│   ├── exampleFiles/');
        console.log('│   ├── outputAfterConversion/');
        console.log('│   └── viewer/');
        console.log('│       └── viewer.html');
        console.log('└── package.json\n');

        for (const test of testFiles) {
            try {
                const fileType = test.type.padEnd(6, ' ');
                console.log(`🔨 Processing ${fileType}: ${path.basename(test.localPath)}`);

                await downloadFile(test.githubPath, test.localPath);
                await convertToMarkdown(test.localPath, test.outputPath);
                
                // Verify output
                if (fsSync.existsSync(test.outputPath)) {
                    const stats = fsSync.statSync(test.outputPath);
                    console.log(`✅ Success: ${path.basename(test.outputPath)} (${Math.round(stats.size/1024)}KB)`);
                } else {
                    throw new Error('Output file not created');
                }

            } catch (error) {
                console.error(`❌ ${test.type} conversion failed:`, error.message);
                process.exit(1);
            }
        }

        console.log('\n🎉 All conversions completed!');
        console.log('\n🔗 Viewer Access Instructions:');
        console.log('   - Run: npm run start:viewer');
        console.log('   - Then visit: http://localhost:3001/examples/viewer/viewer.html');
        console.log('   - Or open examples/viewer/viewer.html directly in your browser');
        console.log('   - Drag generated .md files from:');
        console.log('     examples/outputAfterConversion/');

    } catch (error) {
        console.error('💥 Critical error:', error.message);
        process.exit(1);
    }
};

// Run tests
runTests();