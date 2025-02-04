export class FileToMarkdownClient {
    constructor(baseURL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000') {
      this.baseURL = baseURL;
    }
  
    async convertFile(file) {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${this.baseURL}/api/convert`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    }
  
    async renderMarkdown(content, options = {}) {
      const response = await fetch(`${this.baseURL}/api/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          markdown: content,
          options: {
            highlight: options.highlight !== undefined ? options.highlight : true
          }
        })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    }
  
    async getSupportedTypes() {
      const response = await fetch(`${this.baseURL}/api/filetypes`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    }
  }