import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setError('No order ID provided');
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('mygarb_token');

      const response = await fetch(`http://localhost:5000/api/mygarb/orders/${orderId}`, {
        headers: {
          'x-auth-token': token || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const result = await response.json();
      setOrder(result.data);
    } catch (err) {
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="order-confirmation-page">
        <div className="confirmation-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="order-confirmation-page">
        <div className="confirmation-container">
          <div className="error-box">
            <p style={{fontSize: '60px', marginBottom: '20px'}}>❌</p>
            <h2>Order Not Found</h2>
            <p>{error || 'Unable to load order details'}</p>
            <a href="/" className="btn-primary">Return to Home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <div className="confirmation-container">
        {/* Success Message */}
        <div className="confirmation-header">
          <div className="success-icon">✓</div>
          <h1>ORDER CONFIRMED</h1>
          <p className="success-message">Your order has been successfully placed.</p>
          <p className="order-id">Order ID: <strong>{order.orderNumber}</strong></p>
        </div>

        {/* Order Summary */}
        <div className="order-summary-box">
          <h2>Order Summary</h2>
          
          <div className="order-items">
            {order.items.map((item, index) => (
              <div key={index} className="order-item-row">
                <span className="item-name">
                  {item.fabric?.name || 'Fabric'} x {item.quantity}
                </span>
                <span className="item-price">
                  ₦{((item.fabric?.price || 0) * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="order-divider"></div>

          <div className="order-total">
            <span>Total Paid:</span>
            <span className="total-amount">₦{order.totalAmount?.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="confirmation-actions">
          <a href="/orders" className="btn-view-orders">
            View My Orders
          </a>
          <a href="/" className="btn-continue-shopping">
            Continue Shopping
          </a>
        </div>

        {/* Additional Order Details (Optional) */}
        <div className="order-details-extra">
          <h3>Order Details</h3>
          
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className="detail-value status-badge">{order.status}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Shipping Address:</span>
            <span className="detail-value">
              {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state}
            </span>
          </div>

          {order.customMeasurements && Object.keys(order.customMeasurements).length > 0 && (
            <div className="detail-row">
              <span className="detail-label">Custom Measurements:</span>
              <span className="detail-value">Provided ✓</span>
            </div>
          )}

          <div className="detail-row">
            <span className="detail-label">Payment Method:</span>
            <span className="detail-value">{order.paymentMethod || 'Paystack'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;