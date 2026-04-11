import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function OrderConfirmation() {
  const { state } = useLocation();  // ✅ read from state not URL params
  const navigate = useNavigate();
  const order = state?.order || JSON.parse(localStorage.getItem('mygarb_last_order'));

  useEffect(() => {
  if (order) localStorage.removeItem('mygarb_last_order');
}, []);
  // No order in state
  if (!order) {
    return (
      <div className="order-confirmation-page">
        <div className="confirmation-container">
          <div className="error-box">
            <p style={{ fontSize: '60px', marginBottom: '20px' }}>❌</p>
            <h2>Order Not Found</h2>
            <p>We couldn't load your order details.</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <div className="confirmation-container">

        {/* Success Header */}
        <div className="confirmation-header">
          <div className="success-icon">✓</div>
          <h1>ORDER CONFIRMED</h1>
          <p className="success-message">Your order has been successfully placed.</p>
          <p className="order-id">Order ID: <strong>{order.orderNumber}</strong></p>
        </div>

        {/* Order Summary — ✅ updated for designer model */}
        <div className="order-summary-box">
          <h2>Order Summary</h2>

          <div className="order-items">
            <div className="order-item-row">
              <span className="item-name">{order.orderDescription}</span>
              <span className="item-price">₦{order.agreedAmount?.toLocaleString()}</span>
            </div>
          </div>

          <div className="order-divider"></div>

          <div className="order-total">
            <span>Total Paid:</span>
            {/* ✅ agreedAmount instead of totalAmount */}
            <span className="total-amount">₦{order.agreedAmount?.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="confirmation-actions">
          <a href="/orders" className="btn-view-orders">View My Orders</a>
          <a href="/" className="btn-continue-shopping">Back to Home</a>
        </div>

        {/* Extra Details */}
        <div className="order-details-extra">
          <h3>Order Details</h3>

          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className="detail-value status-badge">{order.status}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Payment:</span>
            <span className="detail-value">{order.paymentMethod || 'Paystack'} ✓</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Shipping to:</span>
            <span className="detail-value">
              {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state}
            </span>
          </div>

          {order.customMeasurements && 
           Object.values(order.customMeasurements).some(v => v) && (
            <div className="detail-row">
              <span className="detail-label">Measurements:</span>
              <span className="detail-value">Provided ✓</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default OrderConfirmation;