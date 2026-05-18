import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faMapMarkerAlt, faClock, faArrowLeft, faEnvelope, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { getUserCart, saveUserCart } from '../utils/cartHelpers';
import { API_BASE } from '../config';

const formatLabel = (str) =>
  str?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

function FabricDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startingChat, setStartingChat] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false); 

  useEffect(() => { if (id) fetchItem(); }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE}/api/mygarb/designers/portfolio/item/${id}`);
      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'Product not found');
      setItem(result.data);
    } catch (err) {
      console.error('Fetch product error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContactDesigner = () => {
    const token = localStorage.getItem('mygarb_token');
    if (!token) { navigate('/login'); return; }
    setStartingChat(true);
    navigate(`/chat?designerId=${item.designer._id}`);
  };

  // Add fixed-price item to cart
  const handleAddToCart = () => {
    const cartItem = {
      id:       item._id,
      name:     item.title,
      price:    item.price,
      quantity: 1,
      unit:     'piece',
      category: item.category || '',
      image:    item.image,
      designerName: item.designer.businessName,
      designerId:   item.designer._id,
    };

    const currentCart = getUserCart();
    // Check if already in cart
    const exists = currentCart.find(c => c.id === item._id);
    if (exists) {
      navigate('/cart');
      return;
    }
    saveUserCart([...currentCart, cartItem]);
    setAddedToCart(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating ?? 0);
    const empty = 5 - Math.ceil(rating ?? 0);
    for (let i = 0; i < full; i++) stars.push(<FontAwesomeIcon key={`f${i}`} icon={faStar} className="star-icon filled" />);
    for (let i = 0; i < empty; i++) stars.push(<FontAwesomeIcon key={`e${i}`} icon={faStar} className="star-icon empty" />);
    return stars;
  };

  if (loading) return (
    <div className="fd-page"><div className="fd-container"><div className="fd-loading"><div className="spinner"></div><p>Loading product details...</p></div></div></div>
  );

  if (error) return (
    <div className="fd-page"><div className="fd-container"><div className="fd-error">
      <div style={{ fontSize: '3rem' }}>⚠️</div>
      <h2>Product not found</h2>
      <p>{error}</p>
      <button className="fd-btn-primary" onClick={() => navigate('/fabrics')}>← Back to Products</button>
    </div></div></div>
  );

  if (!item) return null;

  const { designer } = item;

  return (
    <div className="fd-page">
      <div className="fd-container">

        <button className="fd-btn-back" onClick={() => navigate('/fabrics')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Products
        </button>

        <div className="fd-layout">

          {/* Image */}
          <div className="fd-image-section">
            <div className="fd-image-wrap">
              <img src={item.image} alt={item.title} className="fd-main-image" />
            </div>
            {item.category && (
              <span className="fd-category-badge">{formatLabel(item.category)}</span>
            )}
          </div>

          {/* Details */}
          <div className="fd-details-section">
            <h1 className="fd-title">{item.title}</h1>

            {/* Show price prominently if for sale */}
            {item.isForSale && item.price > 0 && (
              <div className="fd-sale-price">
                <span className="fd-sale-label">Price</span>
                <span className="fd-sale-amount">₦{item.price.toLocaleString()}</span>
              </div>
            )}

            {item.description && <p className="fd-description">{item.description}</p>}

            {/* Designer card */}
            <div className="fd-designer-card">
              <div className="fd-designer-top">
                <div className="fd-designer-avatar">
                  {designer.profilePicture ? (
                    <img src={designer.profilePicture} alt={designer.businessName} />
                  ) : (
                    <span>{designer.businessName?.charAt(0)?.toUpperCase() || 'D'}</span>
                  )}
                </div>
                <div className="fd-designer-info">
                  <h3 className="fd-designer-name">{designer.businessName}</h3>
                  <div className="fd-designer-rating">
                    {renderStars(designer.rating)}
                    <span className="fd-rating-text">{(designer.rating ?? 0).toFixed(1)} ({designer.totalReviews ?? 0} reviews)</span>
                  </div>
                  {designer.location?.city && (
                    <div className="fd-designer-meta">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      <span>{designer.location.city}{designer.location.state ? `, ${designer.location.state}` : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="fd-designer-stats">
                <div className="fd-stat">
                  <div className="fd-stat-val">{designer.experience ?? 0}+</div>
                  <div className="fd-stat-lbl">Yrs Exp</div>
                </div>
                <div className="fd-stat">
                  <FontAwesomeIcon icon={faClock} style={{ color: '#673BB7', marginBottom: 4 }} />
                  <div className="fd-stat-lbl">{designer.responseTime ?? 'N/A'}</div>
                </div>
                <div className="fd-stat">
                  <div className="fd-stat-val" style={{ color: designer.availability ? '#22c55e' : '#ef4444' }}>
                    {designer.availability ? '✓' : '✗'}
                  </div>
                  <div className="fd-stat-lbl">{designer.availability ? 'Available' : 'Busy'}</div>
                </div>
              </div>

              {designer.specialties?.length > 0 && (
                <div className="fd-specialties">
                  {designer.specialties.slice(0, 4).map((s, i) => (
                    <span key={i} className="fd-specialty-tag">{formatLabel(s)}</span>
                  ))}
                </div>
              )}
            </div>

            {/*  Action buttons — split based on isForSale */}
            <div className="fd-actions">
              {item.isForSale && item.price > 0 ? (
                /* Fixed price → Add to Cart */
                <>
                  {addedToCart ? (
                    <button className="fd-btn-primary" onClick={() => navigate('/cart')}>
                      <FontAwesomeIcon icon={faShoppingCart} /> View Cart →
                    </button>
                  ) : (
                    <button className="fd-btn-primary" onClick={handleAddToCart}>
                      <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
                    </button>
                  )}
                  <button className="fd-btn-secondary" onClick={handleContactDesigner} disabled={!designer.availability}>
                    <FontAwesomeIcon icon={faEnvelope} /> Ask Designer a Question
                  </button>
                </>
              ) : (
                /* Custom work → Contact only */
                <>
                  <button
                    className="fd-btn-primary"
                    onClick={handleContactDesigner}
                    disabled={startingChat || !designer.availability}
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                    {startingChat ? ' Starting Chat...' : designer.availability ? ' Contact Designer' : ' Currently Unavailable'}
                  </button>
                  <button className="fd-btn-secondary" onClick={() => navigate(`/designer/${designer._id}`)}>
                    View Full Profile →
                  </button>
                </>
              )}
            </div>

            {/* Context hint */}
            <p className="fd-contact-hint">
              {item.isForSale && item.price > 0
                ? '🛒 Add to cart and proceed to checkout. You can also message the designer for questions about sizing or customisation.'
                : '💬 Contact the designer to discuss price, timeline, and custom measurements for this piece.'}
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

export default FabricDetails;
