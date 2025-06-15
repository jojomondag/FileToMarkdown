export class FileToMarkdownClient {
  
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

    async getSupportedTypes() {
      const response = await fetch(`${this.baseURL}/api/filetypes`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    }
  }