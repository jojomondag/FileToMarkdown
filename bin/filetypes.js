#!/usr/bin/env node

const { MarkitDown } = require('../dist/main');

function displayFileTypes() {
    try {
        const fileTypes = Object.keys(MarkitDown.typeMap);
        const descriptions = MarkitDown.getTypeDescriptions();
        
        console.log('\n📁 Supported File Types:\n');
        
        fileTypes.forEach(type => {
            console.log(`  • ${type.padEnd(6)} - ${descriptions[type]}`);
        });
        
        console.log('\nUse these file types with the filetomarkdown-convert command.\n');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

displayFileTypes(); 