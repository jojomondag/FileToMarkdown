const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

class MarkitDown {
  constructor(options = {}) {
    this.options = options;
  }

  async copyViewerHtml(outputPath) {
    try {
      const outputDir = path.dirname(outputPath);
      const viewerSource = path.join(__dirname, 'viewer.html');
      const viewerDest = path.join(outputDir, 'viewer.html');
      const rendererSource = path.join(__dirname, '..', 'dist', 'renderer.bundle.js');
      const rendererDest = path.join(outputDir, 'renderer.bundle.js');
      
      // Create dist directory if it doesn't exist
      const distDir = path.join(outputDir, 'dist');
      if (!fsSync.existsSync(distDir)) {
        await fs.mkdir(distDir, { recursive: true });
      }
      
      if (fsSync.existsSync(viewerSource)) {
        await fs.copyFile(viewerSource, viewerDest);
        // Update the script src in viewer.html to point to the local renderer bundle
        let viewerContent = await fs.readFile(viewerDest, 'utf8');
        viewerContent = viewerContent.replace('../dist/renderer.bundle.js', './dist/renderer.bundle.js');
        await fs.writeFile(viewerDest, viewerContent);
      }

      if (fsSync.existsSync(rendererSource)) {
        await fs.copyFile(rendererSource, path.join(distDir, 'renderer.bundle.js'));
      }
    } catch (error) {
      console.warn('Warning: Could not copy viewer files:', error.message);
    }
  }

  async convertToMarkdown(inputPath, outputPath) {
    try {
      const ext = path.extname(inputPath).toLowerCase().slice(1);
      const Converter = await this.getFileType(ext);
      
      if (!Converter) {
        throw new Error(`Unsupported file type: ${ext}`);
      }

      const converter = new Converter();
      const markdown = await converter.convert(inputPath);
      
      if (outputPath) {
        await fs.writeFile(outputPath, markdown);
        await this.copyViewerHtml(outputPath);
      }
      
      return markdown;
    } catch (error) {
      throw new Error(`Conversion failed: ${error.message}`);
    }
  }

  async getFileType(ext) {
    const CodeConverter = require('./converters/code');
    
    const typeMap = {
      'pdf': './converters/pdf',
      'txt': './converters/txt',
      'docx': './converters/docx',
      'pptx': './converters/pptx',
      'xlsx': './converters/xlsx',
      '7z': './converters/7zip',
      'zip': './converters/zip',
      ...Object.fromEntries(
        CodeConverter.supportedExtensions.map(ext => 
          [ext, './converters/code']
        )
      )
    };

    const converterPath = typeMap[ext];
    if (!converterPath) return null;

    return require(converterPath);
  }
}

module.exports = {
  MarkitDown,
  convertToMarkdown: async (input, output, options) => {
    const converter = new MarkitDown(options);
    return converter.convertToMarkdown(input, output);
  }
};