const axios = require('axios');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  throw new Error('Paystack secret key is missing');
}

const paystackClient = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

const paystackService = {
  async initializeTransaction(data) {
  const response = await paystackClient.post('/transaction/initialize', {
    email: data.email,
    amount: Math.round(data.amount * 100),
    callback_url: `${process.env.FRONTEND_URL}/verify`,
    metadata: data.metadata
  });
  return response.data.data;
},
  async verifyTransaction(reference) {
    let lastError;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await paystackClient.get(`/transaction/verify/${reference}`);
        return response.data.data;
      } catch (err) {
        lastError = err;
        if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
      }
    }

    throw lastError;
  }
};

module.exports = paystackService;