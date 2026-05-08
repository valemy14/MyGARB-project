import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faBehance, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { 
  faMapMarkerAlt, 
  faStar, 
  faClock, 
  faCheckCircle,
  faArrowLeft,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';

function DesignerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [designer, setDesigner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('portfolio');
  const [startingChat, setStartingChat] = useState(false); 

  useEffect(() => {
    fetchDesignerDetails();
  }, [id]);

  const fetchDesignerDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`http://localhost:5000/api/mygarb/designers/${id}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch designer details');
      }

      setDesigner(result.data);
    } catch (err) {
      console.error('Fetch designer error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContactDesigner = () => {
    const token = localStorage.getItem('mygarb_token');

    if (!token) {
      navigate('/login'); 
      return;
    }

    setStartingChat(true); 
    navigate(`/chat?designerId=${designer._id}`); 
  };

  const formatSpecialty = (specialty) => {
    return specialty
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} className="star-icon filled" />);
    }
    if (hasHalfStar) {
      stars.push(<FontAwesomeIcon key="half" icon={faStar} className="star-icon half" />);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} className="star-icon empty" />);
    }
    return stars;
  };

  // FIX: Guard against missing or zero rating to avoid toFixed() crash
  const safeRating = designer?.rating ?? 0;
  const safeTotalReviews = designer?.totalReviews ?? 0;

  if (loading) {
    return (
      <div className="designer-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading designer profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="designer-detail-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Failed to Load Designer</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/ourdesigners')} className="btn-back">
            Back to Designers
          </button>
        </div>
      </div>
    );
  }

  if (!designer) {
    return (
      <div className="designer-detail-page">
        <div className="error-container">
          <h2>Designer Not Found</h2>
          <button onClick={() => navigate('/ourdesigners')} className="btn-back">
            Back to Designers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="designer-detail-page">
      <div className="designer-detail-container">

        {/* Back Button */}
        <button className="btn-back-top" onClick={() => navigate('/ourdesigners')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Designers
        </button>

        {/* Header Section */}
        <div className="designer-header">

          {/* Profile Image */}
          <div className="designer-profile-image">
            {designer.profilePicture ? (
            <img src={designer.profilePicture} alt={designer.businessName} />
            ) : (
            <div className="profile-placeholder">
                {designer.businessName?.charAt(0) || 'D'}
            </div>
            )}
            {designer.verified && (
              <div className="verified-badge">
                <FontAwesomeIcon icon={faCheckCircle} /> Verified
              </div>
            )}
          </div>

          {/* Designer Info */}
          <div className="designer-header-info">
            <h1 className="designer-name">{designer.businessName}</h1>

            {/* Rating */}
            <div className="designer-rating-section">
              <div className="stars">
                {renderStars(safeRating)}
              </div>
              <span className="rating-text">
                {safeRating.toFixed(1)} ({safeTotalReviews} reviews)
              </span>
            </div>

            {/* Location */}
            {designer.location && (
              <div className="designer-location">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>
                  {designer.location.city}, {designer.location.state}, {designer.location.country}
                </span>
              </div>
            )}

            {/* Stats */}
            <div className="designer-stats-grid">
              <div className="stat-item">
                <div className="stat-number">{designer.completedOrders ?? 0}</div>
                <div className="stat-label">Orders Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{designer.experience ?? 0}+</div>
                <div className="stat-label">Years Experience</div>
              </div>
              <div className="stat-item">
                <FontAwesomeIcon icon={faClock} className="stat-icon" />
                <div className="stat-label">{designer.responseTime ?? 'N/A'}</div>
              </div>
            </div>

            {/* Specialties */}
            {designer.specialties?.length > 0 && ( 
              <div className="designer-specialties-section">
                <h3>Specialties</h3>
                <div className="specialties-tags">
                  {designer.specialties.map((spec, idx) => (
                    <span key={idx} className="specialty-tag">
                      {formatSpecialty(spec)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            {designer.pricing?.startingPrice && (
              <div className="designer-pricing">
                <span className="pricing-label">Starting from</span>
                <span className="pricing-amount">
                  ₦{designer.pricing.startingPrice.toLocaleString()}
                </span>
              </div>
            )}

            {/* Contact Button */}
            <button
              className="btn-contact-designer"
              onClick={handleContactDesigner}
              disabled={startingChat}
            >
              <FontAwesomeIcon icon={faEnvelope} />
              {startingChat ? ' Starting Chat...' : ' Contact Designer'}
            </button>

            {/* Social Links */}
            <div className="designer-social-links">
              {designer.socialLinks?.instagram && ( 
                <a href={designer.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
              )}
              {designer.socialLinks?.behance && (
                <a href={designer.socialLinks.behance} target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faBehance} />
                </a>
              )}
              {designer.socialLinks?.linkedin && (
                <a href={designer.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faLinkedin} />
                </a>
              )}
            </div>

          </div>
        </div>

        {/* Tabs Section */}
        <div className="designer-tabs">
          <button
            className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            Portfolio
          </button>
          <button
            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({safeTotalReviews})
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="portfolio-section">
              {designer.portfolio && designer.portfolio.length > 0 ? (
                <div className="portfolio-grid">
                  {designer.portfolio.map((item, idx) => (
                    <div key={idx} className="portfolio-item" 
                      onClick={() => navigate(`/fabric/${item._id}`)} 
                      style={{ cursor: 'pointer' }}>
                      <img src={item.image} alt={item.title} />
                      <div className="portfolio-overlay">
                        {item.isForSale && item.price > 0 && (
                        <span className="portfolio-price-badge">₦{item.price.toLocaleString()}</span>
                      )}
                         <h4>{item.title}</h4>
                        {item.description && <p>{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No portfolio items yet</p>
                </div>
              )}
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="about-section">
              <div className="about-content">
                <h3>About {designer.businessName}</h3>
                <p className="bio-text">{designer.bio}</p>

                <div className="about-details">
                  <div className="detail-item">
                    <strong>Experience:</strong>
                    <span>{designer.experience} years in fashion design</span>
                  </div>
                  <div className="detail-item">
                    <strong>Availability:</strong>
                    <span className={designer.availability ? 'available' : 'unavailable'}>
                      {designer.availability ? 'Available for new projects' : 'Currently unavailable'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Response Time:</strong>
                    <span>{designer.responseTime ?? 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="reviews-section">
              {safeTotalReviews > 0 ? (
                <div className="reviews-list">
                  <div className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">A</div>
                        <div>
                          <h4>Anonymous Customer</h4>
                          <div className="review-stars">
                            {renderStars(5)}
                          </div>
                        </div>
                      </div>
                      <span className="review-date">2 weeks ago</span>
                    </div>
                    <p className="review-text">
                      Excellent work! Very professional and delivered on time. Highly recommended!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No reviews yet. Be the first to work with this designer!</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default DesignerDetail;
