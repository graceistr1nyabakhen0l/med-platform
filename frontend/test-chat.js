const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'pasien@test.com',
      password: 'password123'
    });
    console.log("Login success:", res.data.token);
    
    // get bookings
    const bookings = await axios.get('http://localhost:3000/api/v1/transaction/bookings', {
      headers: { Authorization: `Bearer ${res.data.token}` }
    });
    console.log("Bookings:", bookings.data);
    
    if (bookings.data.length > 0) {
      const chats = await axios.get(`http://localhost:3000/api/v1/transaction/chats/${bookings.data[0].id}`, {
        headers: { Authorization: `Bearer ${res.data.token}` }
      });
      console.log("Chats:", chats.data);
    }
  } catch (e) {
    console.error(e.response?.data || e.message);
  }
}
test();
