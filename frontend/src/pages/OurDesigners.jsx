import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { G26, G27 } from '../assets/Index';

// Import Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faBehance, faLinkedin } from "@fortawesome/free-brands-svg-icons";

const OurDesigners = () => {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();

  // Specialty filters
  const specialties = [
    { label: 'All', value: 'All' },
    { label: 'Suits', value: 'suits' },
    { label: 'Native Wear (Men)', value: 'native_wear_men' },
    { label: 'Native Wear (Women)', value: 'native_wear_women' },
    { label: 'Wedding Dresses', value: 'wedding_dresses' },
    { label: 'Casual Wear', value: 'casual_wear' },
    { label: 'Corporate Wear', value: 'corporate_wear' },
    { label: 'Traditional Attire', value: 'traditional_attire' },
    { label: 'Unisex', value: 'unisex' },
    { label: 'Children', value: 'children' }
  ];

  // Fetch designers from API
  useEffect(() => {
    fetchDesigners();
  }, [activeFilter]);

  const fetchDesigners = async () => {
    try {
      setLoading(true);
      setError('');

      let url = 'http://localhost:5000/api/mygarb/designers';
      
      // Add filter if not "All"
      if (activeFilter !== 'All') {
        url += `?specialty=${activeFilter}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch designers');
      }

      setDesigners(result.data);
      
    } catch (err) {
      console.error('Fetch designers error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle specialty filter change
  const handleFilterChange = (value) => {
    setActiveFilter(value);
  };

  // Loading state
  if (loading) {
    return (
      <div className="designers-container">
        <div className="loading-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner" style={{ 
            width: '50px', 
            height: '50px', 
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #8B5CF6',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ fontSize: '18px', color: '#666' }}>Loading designers...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="designers-container">
        <div className="error-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ color: '#d32f2f', marginBottom: '10px' }}>Oops! Something went wrong</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>{error}</p>
          <button 
            onClick={fetchDesigners}
            style={{
              padding: '12px 30px',
              background: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="designers-container">
      <h3 className="title">Meet Our Experienced Designers</h3>

      {/* Specialty Filters */}
      <div className="specialty-filters" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'center',
        marginBottom: '40px',
        padding: '0 20px'
      }}>
        {specialties.map((specialty) => (
          <button
            key={specialty.value}
            className={`filter-btn ${activeFilter === specialty.value ? 'active' : ''}`}
            onClick={() => handleFilterChange(specialty.value)}
            style={{
              padding: '10px 20px',
              border: activeFilter === specialty.value ? '2px solid #8B5CF6' : '2px solid #e0e0e0',
              background: activeFilter === specialty.value ? '#8B5CF6' : 'white',
              color: activeFilter === specialty.value ? 'white' : '#333',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            {specialty.label}
          </button>
        ))}
      </div>

      {/* Designers Grid */}
      {designers.length === 0 ? (
        <div className="no-designers" style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#666'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>👨‍🎨</div>
          <h3>No designers found</h3>
          <p>Try selecting a different specialty</p>
        </div>
      ) : (
        <div className="designers-grid">
          {designers.map((designer, index) => (
            <div className="card" key={designer._id || index}>
              {/* Designer Image */}
              <img 
                src={designer.profilePicture || designer.portfolio?.[0]?.image || (index % 2 === 0 ? G26 : G27)} 
                alt={designer.businessName} 
                className="designer-img" 
              />

              {/* Designer Name */}
              <h6 className="designer-name">{designer.businessName}</h6>

              {/* Rating */}
              <div className="designer-rating" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
                justifyContent: 'center'
              }}>
                <span style={{ color: '#FFD700', fontSize: '16px' }}>
                  {'★'.repeat(Math.floor(designer.rating))}
                  {'☆'.repeat(5 - Math.floor(designer.rating))}
                </span>
                <span style={{ fontSize: '14px', color: '#666' }}>
                  {(designer.rating ?? 0).toFixed(1)} ({designer.totalReviews ?? 0} reviews)
                </span>
              </div>

              {/* Specialties */}
              <div className="designer-specialties" style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                {designer.specialties.slice(0, 3).map((spec, idx) => (
                  <span key={idx} style={{
                    padding: '4px 10px',
                    background: '#f0f0f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#666',
                    textTransform: 'capitalize'
                  }}>
                    {spec.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="description">{designer.bio}</p>

              {/* Stats */}
              <div className="designer-stats" style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                fontSize: '13px',
                color: '#666',
                marginBottom: '12px'
              }}>
                <span>✓ {designer.completedOrders} orders</span>
                <span>⏱ {designer.responseTime}</span>
              </div>

              {/* Price */}
              {designer.pricing?.startingPrice && (
                <div className="designer-price" style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#8B5CF6',
                  marginBottom: '12px'
                }}>
                  From ₦{designer.pricing.startingPrice.toLocaleString()}
                </div>
              )}

              {/* Social Icons */}
              <div className="social-icons">
                <FontAwesomeIcon icon={faInstagram} />
                <FontAwesomeIcon icon={faBehance} />
                <FontAwesomeIcon icon={faLinkedin} />
              </div>

              {/* Contact Button */}
             <button 
                    className="contact-btn"
                    onClick={() => navigate(`/designer/${designer._id}`)}
                    >
            Contact Designer
</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OurDesigners;