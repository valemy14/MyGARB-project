import { useState } from 'react';
import api from '../services/api'; // your axios instance with JWT header

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const pay = async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/payments/init', orderData);
      // Hand off to Paystack's hosted page
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start payment');
      setLoading(false);
    }
  };

  return { pay, loading, error };
};