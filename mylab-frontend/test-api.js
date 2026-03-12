import axios from 'axios';

async function testApi() {
  try {
    const loginRes = await axios.post('http://localhost:8082/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginRes.data.token;
    console.log("Got token: " + token.substring(0, 10) + "...");

    const pcsRes = await axios.get('http://localhost:8082/api/pcs/lab/1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("SUCCESS. Response Status:", pcsRes.status);
    console.log("Response Data Length:", pcsRes.data.length);

  } catch (error) {
    console.error("ERROR CAUGHT!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data.substring(0, 1500));
    } else {
      console.error(error.message);
    }
  }
}

testApi();
