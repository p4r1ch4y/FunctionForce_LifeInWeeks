#!/usr/bin/env node

// CLI Test Runner for LifeWeeks Application
// Run with: node test-runner.js

const http = require('http');
const https = require('https');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test configuration
const config = {
  baseUrl: 'http://localhost:3000',
  timeout: 10000
};

// Test suites
const tests = [
  {
    category: 'Application Health',
    tests: [
      {
        name: 'Landing Page',
        path: '/',
        expectedStatus: 200,
        checkContent: (body) => body.includes('LifeWeeks')
      },
      {
        name: 'Sign In Page',
        path: '/auth/signin',
        expectedStatus: 200,
        checkContent: (body) => body.includes('Sign in')
      },
      {
        name: 'Sign Up Page',
        path: '/auth/signup',
        expectedStatus: 200,
        checkContent: (body) => body.includes('Create account')
      },
      {
        name: 'Test Dashboard',
        path: '/test',
        expectedStatus: 200,
        checkContent: (body) => body.includes('Connection Tests')
      }
    ]
  },
  {
    category: 'API Endpoints',
    tests: [
      {
        name: 'Historical Events API',
        path: '/api/historical-events',
        expectedStatus: 401, // Should require auth
        method: 'GET'
      },
      {
        name: 'Seed Data API',
        path: '/api/seed-data',
        expectedStatus: 401, // Should require auth
        method: 'GET'
      },
      {
        name: 'Generate Art Styles',
        path: '/api/generate-art',
        expectedStatus: 405, // GET not allowed, should be POST
        method: 'GET'
      }
    ]
  },
  {
    category: 'Environment Check',
    tests: [
      {
        name: 'Environment Variables',
        test: async () => {
          const envVars = [
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'HUGGINGFACE_API_KEY'
          ];
          
          const missing = envVars.filter(varName => !process.env[varName]);
          
          if (missing.length > 0) {
            return {
              success: false,
              message: `Missing environment variables: ${missing.join(', ')}`
            };
          }
          
          return {
            success: true,
            message: 'All required environment variables are set'
          };
        }
      }
    ]
  }
];

// Utility functions
function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function logStatus(status, message) {
  const symbols = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  const colorMap = {
    success: 'green',
    error: 'red',
    warning: 'yellow',
    info: 'blue'
  };
  
  console.log(`${symbols[status]} ${colorize(message, colorMap[status])}`);
}

function makeRequest(url, method = 'GET', timeout = config.timeout) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method,
      timeout,
      headers: {
        'User-Agent': 'LifeWeeks-Test-Runner/1.0'
      }
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function runHttpTest(test) {
  const url = `${config.baseUrl}${test.path}`;
  const startTime = Date.now();
  
  try {
    const response = await makeRequest(url, test.method || 'GET');
    const duration = Date.now() - startTime;
    
    const statusMatch = response.statusCode === test.expectedStatus;
    const contentMatch = test.checkContent ? test.checkContent(response.body) : true;
    
    const success = statusMatch && contentMatch;
    
    return {
      name: test.name,
      success,
      duration,
      details: {
        url,
        expectedStatus: test.expectedStatus,
        actualStatus: response.statusCode,
        statusMatch,
        contentMatch,
        contentLength: response.body.length
      }
    };
  } catch (error) {
    return {
      name: test.name,
      success: false,
      duration: Date.now() - startTime,
      error: error.message,
      details: { url }
    };
  }
}

async function runCustomTest(test) {
  const startTime = Date.now();
  
  try {
    const result = await test.test();
    const duration = Date.now() - startTime;
    
    return {
      name: test.name,
      success: result.success,
      duration,
      message: result.message,
      details: result.details
    };
  } catch (error) {
    return {
      name: test.name,
      success: false,
      duration: Date.now() - startTime,
      error: error.message
    };
  }
}

async function runTestSuite() {
  console.log(colorize('\n🧪 LifeWeeks Connection Test Suite', 'bright'));
  console.log(colorize('=====================================\n', 'cyan'));
  
  const allResults = [];
  let totalTests = 0;
  let passedTests = 0;
  
  for (const suite of tests) {
    console.log(colorize(`\n📋 ${suite.category}`, 'bright'));
    console.log(colorize('-'.repeat(suite.category.length + 4), 'cyan'));
    
    for (const test of suite.tests) {
      totalTests++;
      
      let result;
      if (test.test) {
        result = await runCustomTest(test);
      } else {
        result = await runHttpTest(test);
      }
      
      allResults.push(result);
      
      if (result.success) {
        passedTests++;
        logStatus('success', `${result.name} (${result.duration}ms)`);
      } else {
        logStatus('error', `${result.name} - ${result.error || result.message || 'Failed'}`);
        if (result.details) {
          console.log(colorize(`   Details: ${JSON.stringify(result.details, null, 2)}`, 'yellow'));
        }
      }
    }
  }
  
  // Summary
  console.log(colorize('\n📊 Test Summary', 'bright'));
  console.log(colorize('===============', 'cyan'));
  console.log(`Total Tests: ${totalTests}`);
  console.log(colorize(`Passed: ${passedTests}`, 'green'));
  console.log(colorize(`Failed: ${totalTests - passedTests}`, 'red'));
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log(colorize('\n🎉 All tests passed! Application is ready.', 'green'));
  } else {
    console.log(colorize('\n⚠️  Some tests failed. Check the details above.', 'yellow'));
  }
  
  return {
    total: totalTests,
    passed: passedTests,
    failed: totalTests - passedTests,
    results: allResults
  };
}

// Check if server is running
async function checkServer() {
  try {
    await makeRequest(config.baseUrl, 'GET', 5000);
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log(colorize('Checking if development server is running...', 'blue'));
  
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log(colorize('❌ Development server is not running!', 'red'));
    console.log(colorize('Please start the server with: npm run dev', 'yellow'));
    process.exit(1);
  }
  
  logStatus('success', 'Development server is running');
  
  const results = await runTestSuite();
  
  // Exit with error code if tests failed
  if (results.failed > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error(colorize(`\n💥 Test runner crashed: ${error.message}`, 'red'));
    process.exit(1);
  });
}

module.exports = { runTestSuite, checkServer };
