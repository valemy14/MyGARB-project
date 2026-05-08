import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | success | failed
  const [message, setMessage] = useState('');
  const [orderData, setOrderData] = useState(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return; 
    hasRun.current = true;      
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const reference = searchParams.get('reference');
    
    if (!reference) {
      setStatus('failed');
      setMessage('Payment reference not found');
      return;
    }

    try {
      const { data } = await api.post('/payment/verify', { reference });

            if (data.success) {
        setStatus('success');
        setMessage(data.message || 'Payment verified successfully!');
        setOrderData(data.order);

        // ADD THIS — save to localStorage as backup
        localStorage.setItem('mygarb_last_order', JSON.stringify(data.order));

        


      } else {
        setStatus('failed');
        setMessage(data.message || 'Payment verification failed');
      }

    } catch (error) {
      console.error('Verification error:', error);
      setStatus('failed');
      setMessage(error.message || 'Failed to verify payment');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9f9f9',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        
        {status === 'verifying' && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              border: '5px solid #f3f3f3',
              borderTop: '5px solid #8B5CF6',
              borderRadius: '50%',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite'
            }}></div>
            <h2 style={{ color: '#333', marginBottom: '10px' }}>
              ⏳ Verifying your payment...
            </h2>
            <p style={{ color: '#666' }}>
              Please wait while we confirm your payment
            </p>
          </>
        )}

        {status === 'success' && (
            <>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
                <h2 style={{ color: '#4caf50', marginBottom: '10px' }}>
                Payment confirmed!
                </h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>{message}</p>
                {orderData && (
                <div style={{ 
                    background: '#f0f0f0', 
                    padding: '15px', 
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <p style={{ margin: '5px 0' }}>
                    <strong>Order Number:</strong> {orderData.orderNumber}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                    <strong>Amount:</strong> ₦{orderData.agreedAmount?.toLocaleString()}
                    </p>
                </div>
                )}
                {/* Manual button instead of auto-redirect */}
                <button
                onClick={() => navigate('/order-confirmation', { state: { order: orderData } })}
                style={{
                    padding: '12px 30px',
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '16px'
                }}
                >
                View Order Details →
                </button>
            </>
            )}


        {status === 'failed' && (
          <>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>❌</div>
            <h2 style={{ color: '#d32f2f', marginBottom: '10px' }}>
              Payment could not be verified
            </h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>
              {message}
            </p>
            <button
              onClick={() => navigate('/cart')}
              style={{
                padding: '12px 30px',
                background: '#8B5CF6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              Return to Cart
            </button>
          </>
        )}

      </div>
    </div>
  );
}