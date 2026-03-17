import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserCart, saveUserCart } from '../utils/cartHelpers';

function FabricDetails() {
  const { id } = useParams();  // Get fabric ID from URL
  
  const [fabric, setFabric] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState('yards');
  const [showCartButton, setShowCartButton] = useState(false);

  const [selectedMeasurements, setSelectedMeasurements] = useState({
    chest: '',
    waist: '',
    hips: '',
    shoulder: '',
    sleeveLength: '',
    length: ''
  });

  // Fetch fabric from API
  useEffect(() => {
    const fetchFabric = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`http://localhost:5000/api/mygarb/fabrics/${id}`);
        const result = await response.json();
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to load fabric');
        }
        
        setFabric(result.data);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchFabric();
    } else {
      // If no ID, show placeholder (for /product route)
      setFabric({
        _id: '67890abcdef12345678901ab',
        name: 'Premium Fabric (Placeholder)',
        price: 2500,
        description: 'Coming soon - Fabric details will be added once catalog is available',
        category: 'Coming Soon',
        images: [{ url: 'https://via.placeholder.com/600x600?text=Product+Image+Coming+Soon' }]
      });
      setLoading(false);
    }
  }, [id]);

  const handleMeasurementChange = (e) => {
    setSelectedMeasurements({
      ...selectedMeasurements,
      [e.target.name]: e.target.value
    });
  };

  const handleAddToCart = () => {
    if (!quantity || quantity < 1) {
      alert('Please select a valid quantity');
      return;
    }

    if (!selectedUnit) {
      alert('Please select a unit (yards/meters/pieces)');
      return;
    }

    const cartItem = {
      id: fabric._id,
      name: fabric.name,
      price: fabric.price,
      quantity: parseInt(quantity),
      unit: selectedUnit,
      category: fabric.category,
      measurements: selectedMeasurements
    };

    const currentCart = getUserCart();
    const updatedCart = [...currentCart, cartItem];
    saveUserCart(updatedCart);

    alert('✅ Added ' + fabric.name + ' to cart!');
    setShowCartButton(true);
  };

  const handleViewCart = () => {
    window.location.href = '/cart';
  };

  // Loading state
  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="product-container">
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ fontSize: '48px' }}>⏳</p>
            <h2>Loading fabric details...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-detail-page">
        <div className="product-container">
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ fontSize: '48px' }}>⚠️</p>
            <h2>Oops! Something went wrong</h2>
            <p style={{ color: '#666', marginTop: '12px' }}>{error}</p>
            <button 
              onClick={() => window.location.href = '/fabrics'}
              style={{
                marginTop: '24px',
                padding: '12px 24px',
                background: '#8B5CF6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Browse All Fabrics
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No fabric found
  if (!fabric) {
    return (
      <div className="product-detail-page">
        <div className="product-container">
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ fontSize: '48px' }}>🔍</p>
            <h2>Fabric not found</h2>
            <p style={{ color: '#666', marginTop: '12px' }}>This fabric may have been removed or doesn't exist.</p>
            <button 
              onClick={() => window.location.href = '/fabrics'}
              style={{
                marginTop: '24px',
                padding: '12px 24px',
                background: '#8B5CF6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Browse All Fabrics
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="product-container">
        
        {/* Product Image */}
        <div className="product-image-section">
          <img 
            src={fabric.images?.[0]?.url || 'https://via.placeholder.com/600x600?text=No+Image'} 
            alt={fabric.name} 
          />
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <h1>{fabric.name}</h1>
          <p className="product-category">{fabric.category}</p>
          <p className="product-price">₦{fabric.price.toLocaleString()}</p>
          <p className="product-description">{fabric.description}</p>

          {/* Quantity Selection */}
          <div className="product-options">
            <div className="option-group">
              <label>Quantity:</label>
              <input
                type="number"
                min="1"
                max="9999"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="option-group">
              <label>Unit:</label>
              <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}>
                <option value="yards">Yards</option>
                <option value="meters">Meters</option>
                <option value="pieces">Pieces</option>
              </select>
            </div>
          </div>

          {/* Measurements Section */}
          <div className="measurements-section">
            <h3>Custom Measurements (Optional)</h3>
            <p className="measurements-subtitle">Provide your measurements for custom tailoring</p>

            <div className="measurements-grid">
              <div className="measurement-input">
                <label>Chest (inches)</label>
                <input
                  type="number"
                  name="chest"
                  value={selectedMeasurements.chest}
                  onChange={handleMeasurementChange}
                  placeholder="e.g. 42"
                />
              </div>

              <div className="measurement-input">
                <label>Waist (inches)</label>
                <input
                  type="number"
                  name="waist"
                  value={selectedMeasurements.waist}
                  onChange={handleMeasurementChange}
                  placeholder="e.g. 34"
                />
              </div>

              <div className="measurement-input">
                <label>Hips (inches)</label>
                <input
                  type="number"
                  name="hips"
                  value={selectedMeasurements.hips}
                  onChange={handleMeasurementChange}
                  placeholder="e.g. 40"
                />
              </div>

              <div className="measurement-input">
                <label>Shoulder (inches)</label>
                <input
                  type="number"
                  name="shoulder"
                  value={selectedMeasurements.shoulder}
                  onChange={handleMeasurementChange}
                  placeholder="e.g. 18"
                />
              </div>

              <div className="measurement-input">
                <label>Sleeve Length (inches)</label>
                <input
                  type="number"
                  name="sleeveLength"
                  value={selectedMeasurements.sleeveLength}
                  onChange={handleMeasurementChange}
                  placeholder="e.g. 24"
                />
              </div>

              <div className="measurement-input">
                <label>Length (inches)</label>
                <input
                  type="number"
                  name="length"
                  value={selectedMeasurements.length}
                  onChange={handleMeasurementChange}
                  placeholder="e.g. 28"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="product-actions">
            {!showCartButton ? (
              <button className="btn-add-to-cart" onClick={handleAddToCart}>
                Add to Cart
              </button>
            ) : (
              <button className="btn-view-cart" onClick={handleViewCart}>
                View Cart
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default FabricDetails;