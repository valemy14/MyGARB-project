// ✅ CHANGED: removed getUserCart, saveUserCart imports (not needed for designer flow)
// ✅ CHANGED: added useLocation, useNavigate imports
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // ====================================================
  // 🧪 TEST DATA — REMOVE THIS BLOCK WHEN DESIGNER 
  // FLOW (chat → agree price → navigate to checkout) IS READY
  // ====================================================
  const testState = {
    designer: '6748a1b2c3d4e5f6a7b8c9d0',  // fake designer ID for testing
    designerName: 'Adire by Tola',
    agreedAmount: 5000,                      // ₦5,000 test charge
    orderDescription: 'Custom agbada - test order',
    collection: null,
    conversation: null
  };
  // Uses real state if coming from designer page, otherwise uses test data above
  const orderContext = state?.designer ? state : testState;
  const { designer, designerName, agreedAmount, orderDescription, collection, conversation } = orderContext;
  // ====================================================
  // 🧪 END TEST DATA
  // ====================================================

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // ✅ CHANGED: removed cart-related fields (cartItems, subtotal, total)
  // ✅ CHANGED: removed designNotes from formData (now comes from chat/orderDescription)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    chest: '',
    waist: '',
    hips: '',
    shoulder: '',
    sleeveLength: '',
    length: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.state) {
      setError('Please fill in all required fields (Full Name, Phone, Address, City, State)');
      return;
    }

    const token = localStorage.getItem('mygarb_token');
    if (!token) {
      setError('Please login to continue');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setProcessing(true);

    try {
      // ✅ CHANGED: orderData now sends designer fields instead of fabric cart items
      const orderData = {
        designer,
        agreedAmount,
        orderDescription,
        collection: collection || null,
        conversation: conversation || null,
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          country: 'Nigeria',
          postalCode: formData.postalCode.trim() || ''
        },
        customMeasurements: {
          chest: formData.chest ? Number(formData.chest) : undefined,
          waist: formData.waist ? Number(formData.waist) : undefined,
          hips: formData.hips ? Number(formData.hips) : undefined,
          shoulder: formData.shoulder ? Number(formData.shoulder) : undefined,
          sleeveLength: formData.sleeveLength ? Number(formData.sleeveLength) : undefined,
          length: formData.length ? Number(formData.length) : undefined,
          measurementUnit: 'inches'
        }
      };

      console.log('Sending order data:', orderData);

      const { data } = await api.post('/payment/init', orderData);

      console.log('Payment init response:', data);

      if (!data.success) throw new Error(data.message || 'Payment initialization failed');

      window.location.href = data.authorizationUrl;

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment initialization failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Checkout</h1>

        {error && (
          <div className="error-message" style={{
            padding: '15px',
            background: '#ffebee',
            border: '1px solid #ef5350',
            borderRadius: '8px',
            color: '#c62828',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <div className="checkout-content">
          {/* Left Column - Form — UNCHANGED */}
          <div className="checkout-form">

            <div className="checkout-section">
              <h2>Shipping Information</h2>

              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" name="fullName" value={formData.fullName}
                  onChange={handleChange} placeholder="Enter your full name" autoComplete="off" />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input type="tel" name="phone" value={formData.phone}
                  onChange={handleChange} placeholder="08012345678" autoComplete="off" />
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input type="text" name="address" value={formData.address}
                  onChange={handleChange} placeholder="Street address" autoComplete="off" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input type="text" name="city" value={formData.city}
                    onChange={handleChange} placeholder="e.g. Lagos" autoComplete="off" />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input type="text" name="state" value={formData.state}
                    onChange={handleChange} placeholder="e.g. Lagos" autoComplete="off" />
                </div>
              </div>

              <div className="form-group">
                <label>Postal Code (Optional)</label>
                <input type="text" name="postalCode" value={formData.postalCode}
                  onChange={handleChange} placeholder="100001" autoComplete="off" />
              </div>
            </div>

            <div className="checkout-section">
              <h2>Custom Measurements (Optional)</h2>
              <p className="section-note">Provide your measurements for a custom fit</p>

              <div className="form-row">
                <div className="form-group">
                  <label>Chest (inches)</label>
                  <input type="number" name="chest" value={formData.chest}
                    onChange={handleChange} placeholder="e.g. 42" autoComplete="off" />
                </div>
                <div className="form-group">
                  <label>Waist (inches)</label>
                  <input type="number" name="waist" value={formData.waist}
                    onChange={handleChange} placeholder="e.g. 34" autoComplete="off" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hips (inches)</label>
                  <input type="number" name="hips" value={formData.hips}
                    onChange={handleChange} placeholder="e.g. 40" autoComplete="off" />
                </div>
                <div className="form-group">
                  <label>Shoulder (inches)</label>
                  <input type="number" name="shoulder" value={formData.shoulder}
                    onChange={handleChange} placeholder="e.g. 18" autoComplete="off" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sleeve Length (inches)</label>
                  <input type="number" name="sleeveLength" value={formData.sleeveLength}
                    onChange={handleChange} placeholder="e.g. 24" autoComplete="off" />
                </div>
                <div className="form-group">
                  <label>Length (inches)</label>
                  <input type="number" name="length" value={formData.length}
                    onChange={handleChange} placeholder="e.g. 28" autoComplete="off" />
                </div>
              </div>
            </div>
          </div>

          {/* ✅ CHANGED: Right column now shows designer order summary instead of cart items */}
          <div className="order-summary">
            <h2>Order Summary</h2>

            <div className="summary-items">
              <div className="summary-item">
                <div className="item-info">
                  <h4>{designerName}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#888', marginTop: 4 }}>
                    {orderDescription}
                  </p>
                </div>
                <div className="item-price">₦{agreedAmount.toLocaleString()}</div>
              </div>
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₦{agreedAmount.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>₦{agreedAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="checkout-actions">
              {/* ✅ CHANGED: back button uses navigate(-1) instead of hardcoded /cart */}
              <button className="btn-back-to-cart"
                onClick={() => navigate(-1)} type="button" disabled={processing}>
                ← Back
              </button>

              <button className="btn-place-order"
                onClick={handlePayment} disabled={processing} type="button">
                {processing ? 'Initializing Payment...' : 'Proceed to Payment →'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Checkout;
