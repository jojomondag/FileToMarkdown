const fs = require('fs');
const path = require('path');

// Read the test suite file
const testSuitePath = path.join(__dirname, 'renderer-test-suite.js');
const testSuiteContent = fs.readFileSync(testSuitePath, 'utf-8');

// Extract the test cases
const testCasesRegex = /const TEST_CASES = \[([\s\S]*?)\];/;
const testCasesMatch = testSuiteContent.match(testCasesRegex);
if (testCasesMatch) {
  const testCasesContent = testCasesMatch[1];
  
  // Extract individual test case objects
  const testCaseObjects = [];
  let braceCount = 0;
  let currentTest = '';
  
  for (let i = 0; i < testCasesContent.length; i++) {
    const char = testCasesContent[i];
    currentTest += char;
    
    if (char === '{') {
      braceCount++;
    } else if (char === '}') {
      braceCount--;
      
      if (braceCount === 0) {
        testCaseObjects.push(currentTest);
        currentTest = '';
      }
    }
  }
  
  // Print the check functions
  console.log('TEST CHECK FUNCTIONS:\n');
  
  testCaseObjects.forEach(testObj => {
    // Extract name and check function
    const nameMatch = testObj.match(/name: ['"]([^'"]+)['"]/);
    const checkFnMatch = testObj.match(/checkFunction: html => \(\{([\s\S]*?)\}\)/);
    
    if (nameMatch && checkFnMatch) {
      console.log(`Test: ${nameMatch[1]}`);
      console.log(`Check function: ${checkFnMatch[1].trim()}`);
      
      // Analyze what the check function is looking for
      const passedTest = checkFnMatch[1].match(/passed: ([\s\S]*?),/);
      if (passedTest) {
        console.log('Passes when:');
        
        const conditions = passedTest[1]
          .replace(/html\.includes\(['"]([^'"]+)['"]\)/g, '- HTML includes "$1"')
          .replace(/html\.match\(\/([^/]+)\/g\)/g, '- HTML matches regex /$1/g')
          .replace(/&&/g, 'AND')
          .replace(/\|\|/g, 'OR')
          .split('AND').map(s => s.trim());
        
        conditions.forEach(condition => {
          console.log(condition);
        });
      }
      
      console.log('\n');
    }
  });
} else {
  console.log('Could not find test cases in the file.');
} 