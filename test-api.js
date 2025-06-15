const FileToMarkdown = require('filetomarkdown');

async function testAPI() {
  console.log('🧪 Testing FileToMarkdown API...');
  
  // Test supported file types
  console.log('\n📋 Supported file types:');
  const supportedTypes = FileToMarkdown.getSupportedFileTypes();
  console.log(`Total: ${supportedTypes.length} file types`);
  
  // Check LibreOffice support specifically
  const libreOfficeTypes = supportedTypes.filter(type => 
    type.extension === 'odt' || type.extension === 'ods' || type.extension === 'odp'
  );
  
  console.log('\n🏢 LibreOffice formats supported:');
  libreOfficeTypes.forEach(type => {
    console.log(`  ✅ ${type.extension.toUpperCase()} - ${type.description}`);
  });
  
  // Test conversion from URL
  try {
    console.log('\n🌐 Testing ODT conversion from GitHub...');
    const odtUrl = 'https://raw.githubusercontent.com/jojomondag/FileToMarkdown/main/examples/exampleFiles/exampleDocumentLibreOffice.odt';
    const result = await FileToMarkdown.convertUrl(odtUrl);
    console.log(`✅ ODT conversion successful: ${result.length} characters`);
    console.log(`📄 Preview: ${result.substring(0, 100)}...`);
  } catch (error) {
    console.log(`❌ Error testing ODT: ${error.message}`);
  }
  
  console.log('\n🎉 API test completed!');
}

testAPI().catch(console.error); 