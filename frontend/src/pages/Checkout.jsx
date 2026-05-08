import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';


function calculateServiceFee(agreedPrice, config) {
  const {
    percentageFee = 2,
    baseFee       = 1000,
    cap           = 3500
  } = config;

  if (agreedPrice === 0) return { serviceFee: 0, total: 0, percentageAmount: 0 };
  if (agreedPrice < 0)  return null; // invalid

  const percentageAmount = (percentageFee / 100) * agreedPrice;
  const rawFee           = baseFee + percentageAmount;
  let   finalFee         = Math.min(rawFee, cap);   // apply cap
        finalFee         = Math.max(finalFee, baseFee); // apply floor
        finalFee         = Math.round(finalFee);

  return {
    percentageAmount: Math.round(percentageAmount),
    rawFee:           Math.round(rawFee),
    serviceFee:       finalFee,
    total:            Math.round(agreedPrice + finalFee)
  };
}

function Checkout() {
  // supports both quoteId URL and navigation state
const { state } = useLocation();
const navigate  = useNavigate();
const [searchParams] = useSearchParams();
const quoteId = searchParams.get('quoteId');

const [quoteData, setQuoteData]     = useState(null);
const [quoteLoading, setQuoteLoading] = useState(!!quoteId);
const [quoteError, setQuoteError]   = useState('');

 // ── State ────────────────────────────────────────────────────────────────────
  const [processing, setProcessing]   = useState(false);
  const [error, setError]             = useState('');

  // Service fee state
  const [feeConfig, setFeeConfig]     = useState({ percentageFee: 2, baseFee: 1000, cap: 3500 });
  const [feeLoading, setFeeLoading]   = useState(true);
  const [feeError, setFeeError]       = useState(false);

  const [formData, setFormData] = useState({
    fullName: '', phone: '', address: '', city: '',
    state: '', postalCode: '', chest: '', waist: '',
    hips: '', shoulder: '', sleeveLength: '', length: ''
  });

   // ── Fetch fee config once on mount ──────────────────────────────────────────
  useEffect(() => {
    const fetchFeeConfig = async () => {
      try {
        setFeeLoading(true);
        const { data } = await api.get('/config/service-fee');
        if (data.success) {
          setFeeConfig(data.data);
          if (data.fallback) setFeeError(true); // DB failed, using defaults
        }
      } catch (err) {
        console.error('Failed to fetch fee config, using defaults:', err);
        setFeeError(true); // still usable — defaults are loaded
      } finally {
        setFeeLoading(false);
      }
    };
    fetchFeeConfig();
  }, []);


useEffect(() => {
  if (!quoteId) return;
  api.get(`/chat/quotes/${quoteId}`)
    .then(({ data }) => {
      if (data.success) setQuoteData(data.data);
      else setQuoteError(data.error || 'Quote not found');
    })
    .catch(() => setQuoteError('Failed to load quote'))
    .finally(() => setQuoteLoading(false));
}, [quoteId]);

// Derive order values from quote (if quoteId) or navigation state
const designer         = quoteData?.designerId   || state?.designer;
const designerName     = quoteData?.designerName  || state?.designerName;
const agreedAmount     = quoteData?.amount        || state?.agreedAmount || 0;
const orderDescription = quoteData?.notes         || state?.orderDescription || 'Custom order';
const conversation     = quoteData?.conversation  || state?.conversation || null;
const collection       = state?.collection        || null;

// Loading state while fetching quote
if (quoteLoading) return (
  <div className="checkout-page">
    <div className="checkout-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div className="spinner"></div>
      <p>Loading your quote...</p>
    </div>
  </div>
);

// Error state if quote fetch failed
if (quoteError) return (
  <div className="checkout-page">
    <div className="checkout-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <h2>Quote not found</h2>
      <p style={{ color: '#888', margin: '12px 0 24px' }}>{quoteError}</p>
      <button className="btn-place-order" onClick={() => navigate('/chat')}>
        Back to Messages
      </button>
    </div>
  </div>
);

// No order at all
if (!designer) return (
  <div className="checkout-page">
    <div className="checkout-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <h2>No order found</h2>
      <p style={{ color: '#888', margin: '12px 0 24px' }}>
        Please contact a designer and agree on a price before checking out.
      </p>
      <button className="btn-place-order" onClick={() => navigate('/ourdesigners')}>
        Browse Designers →
      </button>
    </div>
  </div>
);
 
 

  // ── Calculate fees in real time ──────────────────────────────────────────────
  const feeBreakdown = calculateServiceFee(agreedAmount, feeConfig);
  const isInvalidPrice = agreedAmount < 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    //  Edge case: reject negative price
    if (isInvalidPrice) {
      setError('Invalid order amount. Please go back and try again.');
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.address ||
        !formData.city || !formData.state) {
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
      const orderData = {
        designer,
        agreedAmount,
        quoteId: quoteId || null,
        // Send fee breakdown so backend can store it and verify
        serviceFee:   feeBreakdown.serviceFee,
        totalAmount:  feeBreakdown.total,
        orderDescription,
        collection:   collection || null,
        conversation: conversation || null,
        shippingAddress: {
          fullName:   formData.fullName.trim(),
          phone:      formData.phone.trim(),
          address:    formData.address.trim(),
          city:       formData.city.trim(),
          state:      formData.state.trim(),
          country:    'Nigeria',
          postalCode: formData.postalCode.trim() || ''
        },
        customMeasurements: {
          chest:          formData.chest       ? Number(formData.chest)       : undefined,
          waist:          formData.waist       ? Number(formData.waist)       : undefined,
          hips:           formData.hips        ? Number(formData.hips)        : undefined,
          shoulder:       formData.shoulder    ? Number(formData.shoulder)    : undefined,
          sleeveLength:   formData.sleeveLength? Number(formData.sleeveLength): undefined,
          length:         formData.length      ? Number(formData.length)      : undefined,
          measurementUnit: 'inches'
        }
      };

      const { data } = await api.post('/payment/init', orderData);

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
          <div className="checkout-error-banner">
            {error}
          </div>
        )}

        <div className="checkout-content">

          {/* ── Left: Shipping + Measurements form ── */}
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

          {/* ── Right: Order Summary with fee breakdown ── */}
          <div className="order-summary">
            <h2>Order Summary</h2>

            {/* Designer + description */}
            <div className="summary-items">
              <div className="summary-item">
                <div className="item-info">
                  <h4>{designerName}</h4>
                  <p className="summary-item-desc">{orderDescription}</p>
                </div>
                <div className="item-price">₦{agreedAmount.toLocaleString()}</div>
              </div>
            </div>

            {/*  Fee breakdown — the new section */}
            <div className="summary-totals">

              {/* Item / agreed price */}
              <div className="summary-row">
                <span>Item Price</span>
                <span>₦{agreedAmount.toLocaleString()}</span>
              </div>

              {/* Service fee row with loading/error states */}
              <div className="summary-row">
                <span className="summary-fee-label">
                  Service Fee
                  <span className="summary-fee-info" title={
                    `Base ₦${feeConfig.baseFee.toLocaleString()} + ${feeConfig.percentageFee}% of item price (max ₦${feeConfig.cap.toLocaleString()})`
                  }>
                    ⓘ
                  </span>
                </span>

                {feeLoading ? (
                  <span className="summary-fee-loading">Calculating...</span>
                ) : isInvalidPrice ? (
                  <span className="summary-fee-error">Invalid price</span>
                ) : agreedAmount === 0 ? (
                  <span>₦0</span>
                ) : (
                  <span>₦{feeBreakdown.serviceFee.toLocaleString()}</span>
                )}
              </div>

              {/* Fee explanation — shows how fee was calculated */}
              {!feeLoading && !isInvalidPrice && agreedAmount > 0 && (
                <div className="summary-fee-breakdown">
                  <span>
                    Base ₦{feeConfig.baseFee.toLocaleString()} +{' '}
                    {feeConfig.percentageFee}% (₦{feeBreakdown.percentageAmount.toLocaleString()})
                    {feeBreakdown.rawFee > feeConfig.cap
                      ? ` → capped at ₦${feeConfig.cap.toLocaleString()}`
                      : ''}
                  </span>
                </div>
              )}

              {/* Fee config fallback notice */}
              {feeError && (
                <div className="summary-fee-fallback-notice">
                  ⚠️ Using default fee rates
                </div>
              )}

              <div className="summary-divider"></div>

              {/* Total payable */}
              <div className="summary-row summary-total">
                <span>Total Payable</span>
                <span>
                  {feeLoading
                    ? 'Calculating...'
                    : isInvalidPrice
                      ? 'Invalid'
                      : `₦${feeBreakdown.total.toLocaleString()}`
                  }
                </span>
              </div>
            </div>

            {/* Charge notice */}
            <p className="summary-charge-notice">
              You will be charged ₦{feeLoading ? '...' : feeBreakdown?.total?.toLocaleString() || '0'} via Paystack
            </p>

            <div className="checkout-actions">
              <button className="btn-back-to-cart"
                onClick={() => navigate(-1)} type="button" disabled={processing}>
                ← Back
              </button>

              <button
                className="btn-place-order"
                onClick={handlePayment}
                disabled={processing || feeLoading || isInvalidPrice}
                type="button"
              >
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
