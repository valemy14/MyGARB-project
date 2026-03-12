import { useState } from 'react';
import { P1, P2, P3, P5, P6, P7, P8, P9, P10, P11, P12, P13 } from '../assets/Index';

function Fabrics() {
  const [activeTab, setActiveTab] = useState('HOT');

  // PLACEHOLDER DATA - Using local images
  const placeholderFabrics = [
    // Row 1 - HOT products
    { id: 1, name: 'Kaftan Shine', image: P1, category: 'HOT' },
    { id: 2, name: 'Yellow Mix Agbada', image: P2, category: 'HOT' },
    { id: 3, name: 'Shine On Me Gown', image: P3, category: 'HOT' },
    { id: 4, name: 'Angelic Dress', image: P5, category: 'HOT' },
    
    // Row 2 - HOT products
    { id: 5, name: 'Grey Fitted Kaftan', image: P6, category: 'HOT' },
    { id: 6, name: 'Summer Blue Men Agbada', image: P7, category: 'HOT' },
    { id: 7, name: 'Tailored 2 pieces', image: P8, category: 'HOT' },
    { id: 8, name: 'Solid V Neck Agbada', image: P9, category: 'HOT' },
    
    // Row 3 - HOT products (shirts, trousers)
    { id: 9, name: 'Blue Fitted Shirt', image: P10, category: 'HOT' },
    { id: 10, name: 'Black Trousers', image: P11, category: 'HOT' },
    { id: 11, name: 'White Shirt Collection', image: P12, category: 'HOT' },
    { id: 12, name: 'Solid V Neck Agbada', image: P13, category: 'HOT' },
    
    // Sale products
    { id: 13, name: 'Premium Ankara Set', image: P1, category: 'Sale' },
    { id: 14, name: 'Designer Agbada', image: P2, category: 'Sale' },
    { id: 15, name: 'Traditional Kaftan', image: P3, category: 'Sale' },
    { id: 16, name: 'Modern Agbada', image: P5, category: 'Sale' },
    
    // New Arrivals
    { id: 17, name: 'Custom Kaftan Design', image: P6, category: 'New Arrivals' },
    { id: 18, name: 'Bespoke Agbada', image: P7, category: 'New Arrivals' },
    { id: 19, name: 'Tailored Ensemble', image: P8, category: 'New Arrivals' },
    { id: 20, name: 'Custom Traditional Wear', image: P9, category: 'New Arrivals' },
    
    // CUSTOMIZATION
    { id: 21, name: 'Custom Design 1', image: P10, category: 'CUSTOMIZATION' },
    { id: 22, name: 'Custom Design 2', image: P11, category: 'CUSTOMIZATION' },
    { id: 23, name: 'Custom Design 3', image: P12, category: 'CUSTOMIZATION' },
    { id: 24, name: 'Custom Design 4', image: P13, category: 'CUSTOMIZATION' },
  ];

  // Filter fabrics by active tab
  const filteredFabrics = placeholderFabrics.filter(fabric => fabric.category === activeTab);

  return (
    <div className="fabrics-listing-page">
      <div className="container">
        
        {/* Page Title */}
        <div className="products-header">
          <h1>Our Products</h1>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          <button
            className={`tab-btn ${activeTab === 'Sale' ? 'active' : ''}`}
            onClick={() => setActiveTab('Sale')}
          >
            Sale
          </button>
          <button
            className={`tab-btn ${activeTab === 'HOT' ? 'active' : ''}`}
            onClick={() => setActiveTab('HOT')}
          >
            HOT
          </button>
          <button
            className={`tab-btn ${activeTab === 'New Arrivals' ? 'active' : ''}`}
            onClick={() => setActiveTab('New Arrivals')}
          >
            New Arrivals
          </button>
          <button
            className={`tab-btn ${activeTab === 'CUSTOMIZATION' ? 'active' : ''}`}
            onClick={() => setActiveTab('CUSTOMIZATION')}
          >
            CUSTOMIZATION
          </button>
        </div>

        {/* Products Grid - NOW SHOWS 12 PRODUCTS (3 ROWS) */}
        <div className="products-grid">
          {filteredFabrics.slice(0, 12).map((fabric) => (
            <div key={fabric.id} className="product-card">
              
              {/* Product Image */}
              <div className="product-image">
                <img src={fabric.image} alt={fabric.name} />
              </div>

              {/* Product Name */}
              <div className="product-name">
                <h3>{fabric.name}</h3>
              </div>

            </div>
          ))}
        </div>

        {/* See All Button */}
        <div className="see-all-section">
          <button className="btn-see-all">
            See all <span className="arrow">→</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default Fabrics;
