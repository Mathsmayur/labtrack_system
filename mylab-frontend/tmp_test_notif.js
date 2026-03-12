
import axios from 'axios';

const test = async () => {
    try {
        // We need a token. I'll try to login first.
        const loginRes = await axios.post('http://localhost:8081/api/auth/login', {
            username: 'Ankit_Admin',
            password: 'password123',
            department: 'CE'
        });
        const token = loginRes.data.token;
        console.log('Login success');
        
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };
        
        const res = await axios.get('http://localhost:8081/api/notifications', config);
        console.log('Notifications:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error('Test failed:', err.response?.data || err.message);
    }
};

test();
