import { useState, useEffect } from 'react';

function Checkout() {
  // Get cart items (from dummy data for now)
  const [cartItems] = useState([
    {
      id: 1,
      name: 'Premium Ankara Fabric',
      price: 2500,
      quantity: 2,
      unit: 'yard'
    },
    {
      id: 2,
      name: 'Luxury Silk Fabric',
      price: 5000,
      quantity: 1,
      unit: 'meter'
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    // Measurements (optional)
    chest: '',
    waist: '',
    hips: '',
    shoulder: '',
    sleeveLength: '',
    length: ''
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50000 ? 0 : 2000;
  const total = subtotal + shipping;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.state) {
      setError('Please fill in all required shipping fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare order data for API
      const orderData = {
  items: cartItems.map(item => ({
    fabric: item.id,
    quantity: item.quantity,
    unit: item.unit === 'yard' ? 'yards' : 
          item.unit === 'meter' ? 'meters' : 
          item.unit === 'piece' ? 'pieces' : 
          item.unit  // Convert singular to plural
  })),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: 'Nigeria'
        },
        customMeasurements: {
          chest: formData.chest ? Number(formData.chest) : undefined,
          waist: formData.waist ? Number(formData.waist) : undefined,
          hips: formData.hips ? Number(formData.hips) : undefined,
          shoulder: formData.shoulder ? Number(formData.shoulder) : undefined,
          sleeveLength: formData.sleeveLength ? Number(formData.sleeveLength) : undefined,
          length: formData.length ? Number(formData.length) : undefined,
          measurementUnit: 'inches'
        },
        paymentMethod: 'paystack'
      };

      // Get token from localStorage (if user is logged in)
      const token = localStorage.getItem('mygarb_token');

      // Make API call
      const response = await fetch('http://localhost:5000/api/mygarb/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || '' // Include token if available
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const result = await response.json();
      
      // Success! Redirect to confirmation page
      alert('Order placed successfully! Order #' + result.data.orderNumber);
      
      // Clear cart and redirect
      localStorage.removeItem('mygarb_cart');
      window.location.href = '/order-confirmation?order=' + result.data._id;

    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h1>CHECKOUT</h1>
        <div className="empty-message">
          <p style={{fontSize: '60px'}}>🛒</p>
          <h2>Your Cart is Empty</h2>
          <p>Add items to your cart before checking out</p>
          <a href="/" className="btn-shop">Browse Fabrics</a>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>CHECKOUT</h1>

        <form onSubmit={handleSubmit} className="checkout-grid">
          {/* Left Column - Forms */}
          <div className="checkout-forms">
            {/* Shipping Information */}
            <div className="form-section">
              <h2>Shipping Information</h2>
              
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+234 XXX XXX XXXX"
                  required
                />
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Custom Measurements (Optional) */}
            <div className="form-section">
              <h2>Custom Measurements (Optional)</h2>
              <p className="form-subtitle">Provide your measurements for custom tailoring</p>

              <div className="form-row">
                <div className="form-group">
                  <label>Chest (inches)</label>
                  <input
                    type="number"
                    name="chest"
                    value={formData.chest}
                    onChange={handleChange}
                    placeholder="e.g. 42"
                  />
                </div>

                <div className="form-group">
                  <label>Waist (inches)</label>
                  <input
                    type="number"
                    name="waist"
                    value={formData.waist}
                    onChange={handleChange}
                    placeholder="e.g. 34"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hips (inches)</label>
                  <input
                    type="number"
                    name="hips"
                    value={formData.hips}
                    onChange={handleChange}
                    placeholder="e.g. 40"
                  />
                </div>

                <div className="form-group">
                  <label>Shoulder (inches)</label>
                  <input
                    type="number"
                    name="shoulder"
                    value={formData.shoulder}
                    onChange={handleChange}
                    placeholder="e.g. 18"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sleeve Length (inches)</label>
                  <input
                    type="number"
                    name="sleeveLength"
                    value={formData.sleeveLength}
                    onChange={handleChange}
                    placeholder="e.g. 24"
                  />
                </div>

                <div className="form-group">
                  <label>Length (inches)</label>
                  <input
                    type="number"
                    name="length"
                    value={formData.length}
                    onChange={handleChange}
                    placeholder="e.g. 28"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>

            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <div className="item-details">
                    <p className="item-name">{item.name}</p>
                    <p className="item-qty">Qty: {item.quantity} {item.unit}(s)</p>
                  </div>
                  <p className="item-price">₦{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>

              <div className="total-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₦${shipping.toLocaleString()}`}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="total-row total-final">
                <span>TOTAL</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-place-order"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>

            <a href="/cart" className="btn-back-cart">Back to Cart</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Checkout;