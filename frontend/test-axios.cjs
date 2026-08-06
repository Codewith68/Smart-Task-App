const axios = require('axios');

async function run() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/signup', {
      name: 'bhartee',
      email: 'bhartee12@gmail.com',
      password: 'Bhartee@123'
    });
    console.log('Success:', res.data);
  } catch (error) {
    const message = error.response?.data?.message || 'Fallback error message';
    console.log('Error caught! Message:', message);
    console.log('Raw error response data:', error.response?.data);
  }
}

run();
