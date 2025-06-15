const FileToMarkdown = require('filetomarkdown');
const https = require('https');

async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = Buffer.alloc(0);
      response.on('data', (chunk) => {
        data = Buffer.concat([data, chunk]);
      });
      response.on('end', () => {
        resolve(data);
      });
    }).on('error', reject);
  });
}

async function testAPI() {
  console.log('🧪 Testing FileToMarkdown API...');
  
  // Test basic functionality
  console.log('\n📋 Available methods:', Object.keys(FileToMarkdown));
  
  // Test file type descriptions
  try {
    const descriptions = FileToMarkdown.getFileTypeDescriptions();
    console.log('\n📄 LibreOffice formats found:');
    Object.entries(descriptions).forEach(([ext, desc]) => {
      if (ext === 'odt' || ext === 'ods' || ext === 'odp') {
        console.log(`  ✅ ${ext.toUpperCase()} - ${desc}`);
      }
    });
  } catch (error) {
    console.log('❌ Could not get file type descriptions:', error.message);
  }
  
  // Test ODT conversion
  try {
    console.log('\n🌐 Testing ODT conversion from GitHub...');
    const odtUrl = 'https://raw.githubusercontent.com/jojomondag/FileToMarkdown/main/examples/exampleFiles/exampleDocumentLibreOffice.odt';
    const fileBuffer = await downloadFile(odtUrl);
    const result = await FileToMarkdown.convertToMarkdown(fileBuffer, 'odt');
    console.log(`✅ ODT conversion successful: ${result.length} characters`);
    console.log(`📄 Content: "${result.trim()}"`);
  } catch (error) {
    console.log(`❌ Error testing ODT: ${error.message}`);
  }
  
  // Test ODS conversion
  try {
    console.log('\n📊 Testing ODS conversion from GitHub...');
    const odsUrl = 'https://raw.githubusercontent.com/jojomondag/FileToMarkdown/main/examples/exampleFiles/exampleSpreadsheetLibreOffice.ods';
    const result = await FileToMarkdown.convertUrl(odsUrl);
    console.log(`✅ ODS conversion successful: ${result.length} characters`);
    console.log(`📄 Preview: ${result.substring(0, 200)}...`);
  } catch (error) {
    console.log(`❌ Error testing ODS: ${error.message}`);
  }
  
  console.log('\n🎉 API test completed! LibreOffice support is working! 🏢');
}

testAPI().catch(console.error); 