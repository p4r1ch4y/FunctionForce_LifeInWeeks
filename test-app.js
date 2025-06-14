const http = require('http');

// Test the application endpoints
const tests = [
  {
    name: 'Landing Page',
    path: '/',
    expectedStatus: 200
  },
  {
    name: 'Sign In Page',
    path: '/auth/signin',
    expectedStatus: 200
  },
  {
    name: 'Sign Up Page',
    path: '/auth/signup',
    expectedStatus: 200
  }
];

async function testEndpoint(test) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: test.path,
      method: 'GET',
      headers: {
        'User-Agent': 'Test-Agent'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const success = res.statusCode === test.expectedStatus;
        resolve({
          ...test,
          actualStatus: res.statusCode,
          success,
          hasContent: data.length > 0,
          contentLength: data.length
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        ...test,
        success: false,
        error: error.message
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        ...test,
        success: false,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing LifeWeeks Application...\n');
  
  const results = [];
  
  for (const test of tests) {
    console.log(`Testing ${test.name}...`);
    const result = await testEndpoint(test);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${test.name}: OK (${result.actualStatus}, ${result.contentLength} bytes)`);
    } else {
      console.log(`❌ ${test.name}: FAILED (${result.actualStatus || 'N/A'}) - ${result.error || 'Unknown error'}`);
    }
  }
  
  console.log('\n📊 Test Summary:');
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Application is running correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above.');
  }
  
  return results;
}

// Run tests
runTests().catch(console.error);
