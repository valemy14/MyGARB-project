import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const formatLabel = (str) =>
  str?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

function Fabrics() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchItems();
  }, [search]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');

      let url = 'http://localhost:5000/api/mygarb/designers/portfolio/all';
      if (search) url += `?search=${encodeURIComponent(search)}`;

      const response = await fetch(url);
      const result = await response.json();

      if (!result.success) throw new Error(result.message || 'Failed to load products');
      setItems(result.data);
    } catch (err) {
      console.error('Fetch products error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearch('');
    setSearchInput('');
  };

  if (loading) {
    return (
      <div className="fabrics-listing-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading designs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fabrics-listing-page">
        <div className="container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button onClick={fetchItems} className="btn-retry">Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fabrics-listing-page">
      <div className="container">

        <div className="products-header">
          <h1>Our Designers' Work</h1>
          <p className="products-subtitle">
            Browse pieces made by our talented designers — click any item to see full details
          </p>
        </div>

        {/* Search — only filter needed */}
        <form className="products-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by design name or designer..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="products-search-input"
          />
          <button type="submit" className="products-search-btn">Search</button>
          {search && (
            <button type="button" className="products-search-clear" onClick={handleClearSearch}>
              ✕ Clear
            </button>
          )}
        </form>

        {search && (
          <p className="products-search-label">
            Results for "<strong>{search}</strong>" — {items.length} found
          </p>
        )}

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="products-empty">
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎨</div>
            <h3>No designs found</h3>
            <p>{search ? 'Try a different search term' : 'No designs uploaded yet'}</p>
            {search && (
              <button className="btn-retry" onClick={handleClearSearch}>
                Show All Designs
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="products-count">{items.length} design{items.length !== 1 ? 's' : ''}</p>

            <div className="products-grid">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="product-card"
                  onClick={() => navigate(`/fabric/${item._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="product-image">
                    <img src={item.image} alt={item.title} />
                    {item.category && (
                      <span className="product-category-badge">
                        {formatLabel(item.category)}
                      </span>
                    )}
                  </div>

                  <div className="product-info">
                    <h3 className="product-title">{item.title}</h3>

                    <div className="product-designer-credit">
                      <div className="product-designer-avatar">
                        {item.designer.profilePicture ? (
                          <img src={item.designer.profilePicture} alt={item.designer.businessName} />
                        ) : (
                          <span>{item.designer.businessName?.charAt(0)?.toUpperCase() || 'D'}</span>
                        )}
                      </div>
                      <div className="product-designer-info">
                        <span className="product-designer-by">by</span>
                        <span className="product-designer-name">{item.designer.businessName}</span>
                        {item.designer.location?.city && (
                          <span className="product-designer-location">
                            📍 {item.designer.location.city}
                          </span>
                        )}
                      </div>
                    </div>

                    {item.description && (
                      <p className="product-description">{item.description}</p>
                    )}

                    <button className="product-view-btn">View Details →</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Fabrics;
