import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FabricDetails() {
  const navigate = useNavigate();
  
  // PLACEHOLDER DATA (Temporary - will replace with real API later)
  const placeholderFabric = {
    id: 'temp-001',
    name: 'Premium Fabric (Placeholder)',
    price: 0,
    description: 'Coming soon - Fabric details will be added once catalog is available',
    category: 'Coming Soon',
    image: 'https://via.placeholder.com/600x600?text=Product+Image+Coming+Soon',
    inStock: true
  };
  
  // Purchase options state
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState('yards');
  
  // Measurements state
  const [measurements, setMeasurements] = useState({
    chest: '',
    waist: '',
    hips: '',
    shoulder: '',
    sleeveLength: '',
    length: ''
  });

  const handleMeasurementChange = (e) => {
    setMeasurements({
      ...measurements,
      [e.target.name]: e.target.value
    });
  };

  const handleAddToCart = () => {
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('mygarb_cart') || '[]');
    
    // Create cart item
    const cartItem = {
      id: placeholderFabric.id,
      name: placeholderFabric.name,
      category: placeholderFabric.category,
      price: placeholderFabric.price,
      quantity: quantity,
      unit: selectedUnit,
      image: placeholderFabric.image,
      measurements: measurements
    };
    
    // Check if item already exists
    const existingIndex = existingCart.findIndex(item => item.id === placeholderFabric.id);
    
    if (existingIndex > -1) {
      // Update quantity
      existingCart[existingIndex].quantity += quantity;
    } else {
      // Add new item
      existingCart.push(cartItem);
    }
    
    // Save to localStorage
    localStorage.setItem('mygarb_cart', JSON.stringify(existingCart));
    
    alert(`✅ Added ${quantity} ${selectedUnit} to cart!`);
  };

  const totalPrice = placeholderFabric.price * quantity;

  return (
    <div className="product-detail-placeholder">
      <div className="container">
        
        {/* Simple Product Layout */}
        <div className="product-grid">
          
          {/* LEFT - Product Image */}
          <div className="product-image-section">
            <div className="product-image">
              <img src={placeholderFabric.image} alt={placeholderFabric.name} />
            </div>
          </div>

          {/* RIGHT - Product Info */}
          <div className="product-info-section">
            
            {/* Fabric Name */}
            <h1 className="product-title">{placeholderFabric.name}</h1>

            {/* Price */}
            <div className="product-price">
              <span className="price">₦{placeholderFabric.price.toLocaleString()}</span>
            </div>

            {/* Description */}
            <div className="product-description">
              <p>{placeholderFabric.description}</p>
            </div>

            <div className="divider"></div>

            {/* Quantity & Unit Selection */}
            <div className="purchase-section">
              <div className="form-group">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <input 
                    type="number" 
                    min="1" 
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>

              <div className="form-group">
                <label>Unit:</label>
                <select 
                  value={selectedUnit} 
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="unit-select"
                >
                  <option value="yards">Yards</option>
                  <option value="meters">Meters</option>
                  <option value="pieces">Pieces</option>
                </select>
              </div>

              <div className="total-price">
                <span>Total:</span>
                <span className="total">₦{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="divider"></div>

            {/* Measurement Inputs */}
            <div className="measurements-section">
              <h3>Custom Measurements (Optional)</h3>
              <p className="measurements-note">Provide your measurements in inches</p>
              
              <div className="measurements-grid">
                <div className="input-group">
                  <label>Chest</label>
                  <input 
                    type="number"
                    name="chest"
                    value={measurements.chest}
                    onChange={handleMeasurementChange}
                    placeholder="e.g. 42"
                  />
                </div>

                <div className="input-group">
                  <label>Waist</label>
                  <input 
                    type="number"
                    name="waist"
                    value={measurements.waist}
                    onChange={handleMeasurementChange}
                    placeholder="e.g. 34"
                  />
                </div>

                <div className="input-group">
                  <label>Hips</label>
                  <input 
                    type="number"
                    name="hips"
                    value={measurements.hips}
                    onChange={handleMeasurementChange}
                    placeholder="e.g. 40"
                  />
                </div>

                <div className="input-group">
                  <label>Shoulder</label>
                  <input 
                    type="number"
                    name="shoulder"
                    value={measurements.shoulder}
                    onChange={handleMeasurementChange}
                    placeholder="e.g. 18"
                  />
                </div>

                <div className="input-group">
                  <label>Sleeve Length</label>
                  <input 
                    type="number"
                    name="sleeveLength"
                    value={measurements.sleeveLength}
                    onChange={handleMeasurementChange}
                    placeholder="e.g. 24"
                  />
                </div>

                <div className="input-group">
                  <label>Length</label>
                  <input 
                    type="number"
                    name="length"
                    value={measurements.length}
                    onChange={handleMeasurementChange}
                    placeholder="e.g. 28"
                  />
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button className="btn-add-to-cart" onClick={handleAddToCart}>
              Add to Cart
            </button>

            <button className="btn-continue" onClick={() => navigate('/cart')}>
              View Cart
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default FabricDetails;