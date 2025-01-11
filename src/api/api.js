const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

class MarkitDown {
  constructor(options = {}) {
    this.options = options;
  }

  async convertToMarkdown(inputPath) {
    try {
      const ext = path.extname(inputPath).toLowerCase().slice(1);
      const Converter = await this.getFileType(ext);
      
      if (!Converter) {
        throw new Error(`Unsupported file type: ${ext}`);
      }

      const converter = new Converter();
      return await converter.convert(inputPath);
    } catch (error) {
      throw new Error(`Conversion failed: ${error.message}`);
    }
  }

  getFileType(ext) {
    const CodeConverter = require('../converters/code');
    
    const typeMap = {
      'pdf': '../converters/pdf',
      'txt': '../converters/txt',
      'docx': '../converters/docx',
      'pptx': '../converters/pptx',
      'xlsx': '../converters/xlsx',
      '7z': '../converters/7zip',
      'zip': '../converters/zip',
      ...Object.fromEntries(
        CodeConverter.supportedExtensions.map(ext => 
          [ext, '../converters/code']
        )
      )
    };

    const converterPath = typeMap[ext];
    if (!converterPath) return null;

    return require(converterPath);
  }
}

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file upload
const upload = multer({ 
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const tempDir = path.join(os.tmpdir(), 'filetomarkdown-uploads');
      await fs.mkdir(tempDir, { recursive: true });
      cb(null, tempDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
});

app.use(cors());

// Simplified filetypes endpoint
app.get('/api/filetypes', (req, res) => {
  try {
    const converter = new MarkitDown();
    const CodeConverter = require('../converters/code');
    
    const typeMap = {
      'pdf': 'PDF Documents',
      'txt': 'Text Files',
      'docx': 'Word Documents',
      'pptx': 'PowerPoint Presentations',
      'xlsx': 'Excel Spreadsheets',
      '7z': '7-Zip Archives',
      'zip': 'ZIP Archives',
      ...Object.fromEntries(
        CodeConverter.supportedExtensions.map(ext => 
          [ext, `${ext.toUpperCase()} Source Files`]
        )
      )
    };

    res.json({
      fileTypes: Object.keys(typeMap)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/convert', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const converter = new MarkitDown();
  
  try {
    const markdown = await converter.convertToMarkdown(req.file.path);
    await fs.unlink(req.file.path);
    res.json({ markdown });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});

module.exports = app; 