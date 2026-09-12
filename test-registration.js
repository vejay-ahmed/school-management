// Simple test script using built-in http module
// Usage: node test-registration.js

const http = require('http');

function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: body
        });
      });
    });

    req.on('error', (error) => reject(error));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testRegistration() {
  console.log('Testing Registration API...\n');

  // Test 1: Check if server is running
  try {
    const healthCheck = await makeRequest('http://localhost:5000', 'GET');
    console.log('✅ Server is running:', healthCheck.data);
  } catch (error) {
    console.log('❌ Server is NOT running!');
    console.log('   Please start the backend server first: cd server && npm start');
    return;
  }

  // Test 2: Register an admin user
  console.log('\n--- Testing Admin Registration ---');
  try {
    const response = await makeRequest('http://localhost:5000/api/auth/register', 'POST', {
      name: 'Test Admin',
      email: 'testadmin_' + Date.now() + '@example.com',
      password: 'admin123',
      role: 'admin',
      phone: '1234567890'
    });
    console.log('✅ Registration response:');
    console.log('   Status:', response.status);
    console.log('   Data:', response.data);
  } catch (error) {
    console.log('❌ Registration failed!');
    console.log('   Error:', error.message);
  }

  // Test 3: Register a student user
  console.log('\n--- Testing Student Registration ---');
  try {
    const response = await makeRequest('http://localhost:5000/api/auth/register', 'POST', {
      name: 'Test Student',
      email: 'teststudent_' + Date.now() + '@example.com',
      password: 'student123',
      role: 'student',
      phone: '1234567890',
      rollNo: '101',
      class: '10',
      section: 'A',
      dateOfBirth: '2005-01-01',
      gender: 'Male',
      parentName: 'Parent Name',
      parentPhone: '0987654321',
      contactNumber: '1234567890'
    });
    console.log('✅ Registration response:');
    console.log('   Status:', response.status);
    console.log('   Data:', response.data);
  } catch (error) {
    console.log('❌ Registration failed!');
    console.log('   Error:', error.message);
  }

  // Test 4: Register a teacher user
  console.log('\n--- Testing Teacher Registration ---');
  try {
    const response = await makeRequest('http://localhost:5000/api/auth/register', 'POST', {
      name: 'Test Teacher',
      email: 'testteacher_' + Date.now() + '@example.com',
      password: 'teacher123',
      role: 'teacher',
      phone: '1234567890',
      employeeId: 'EMP001',
      qualification: 'M.Sc',
      experience: 5
    });
    console.log('✅ Registration response:');
    console.log('   Status:', response.status);
    console.log('   Data:', response.data);
  } catch (error) {
    console.log('❌ Registration failed!');
    console.log('   Error:', error.message);
  }
}

testRegistration();
