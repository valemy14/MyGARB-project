import { useState, useEffect } from 'react';
import { getUserCart, saveUserCart } from '../utils/cartHelpers';
import { useNavigate } from 'react-router-dom';

function Cart() {
  // Get user-specific cart
  const [cartItems, setCartItems] = useState(() => getUserCart());
  const navigate = useNavigate();

  // Save to user-specific cart when changed
  useEffect(() => {
    saveUserCart(cartItems);
  }, [cartItems]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0;  // Free shipping
  const total = subtotal + shipping;

  // Remove item from cart
  const removeFromCart = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Update quantity
  const updateQuantity = (id, newQuantity) => {
  const qty = parseInt(newQuantity);
  
  if (qty <= 0 || isNaN(qty)) {
    removeFromCart(id);
    return;
  }
  
  // Cap at 9999 silently
  const finalQty = Math.min(qty, 9999);
  
  setCartItems(prevItems =>
    prevItems.map(item =>
      item.id === id ? { ...item, quantity: finalQty } : item
    )
  );
};
  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <h1>SHOPPING CART</h1>
          <div className="empty-cart">
            <p style={{fontSize: '60px'}}>🛒</p>
            <h2>Your Cart is Empty</h2>
            <p>Start adding items to your cart!</p>
            <a href="/fabrics" className="btn-continue-shopping">Browse Fabrics</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1>SHOPPING CART</h1>

        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="cart-item">
                <div className="item-image">
                  <div className="placeholder-image">📦</div>
                </div>

                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-category">{item.category}</p>
                  <p className="item-price">₦{item.price?.toLocaleString() || 0} per {item.unit}</p>
                  
                  {/* Show measurements if available */}
                  {item.measurements && Object.values(item.measurements).some(val => val) && (
                    <div className="item-measurements">
                      <p><strong>Measurements:</strong></p>
                      {item.measurements.chest && <p>Chest: {item.measurements.chest}"</p>}
                      {item.measurements.waist && <p>Waist: {item.measurements.waist}"</p>}
                      {item.measurements.hips && <p>Hips: {item.measurements.hips}"</p>}
                      {item.measurements.shoulder && <p>Shoulder: {item.measurements.shoulder}"</p>}
                      {item.measurements.sleeveLength && <p>Sleeve: {item.measurements.sleeveLength}"</p>}
                      {item.measurements.length && <p>Length: {item.measurements.length}"</p>}
                    </div>
                  )}
                </div>

                <div className="item-quantity">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    value={item.quantity || 1}
                    onChange={(e) => updateQuantity(item.id, e.target.value)}
                  />
                </div>

                <div className="item-total">
                  <p className="total-label">Total:</p>
                  <p className="total-price">₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                </div>

                <button 
                  className="btn-remove"
                  onClick={() => removeFromCart(item.id)}
                  aria-label="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal ({cartItems.length} item{cartItems.length > 1 ? 's' : ''})</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `₦${shipping.toLocaleString()}`}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₦{total.toLocaleString()}</span>
            </div>

            <button className="btn-checkout" onClick={() => {
                const token = localStorage.getItem('mygarb_token');
                if (!token) { navigate('/login'); return; }
                const firstItem = cartItems[0];
                const orderDescription = cartItems.map(i => `${i.name} x${i.quantity}`).join(', ');
                navigate('/checkout', {
                  state: {
                    designer:         firstItem.designerId,
                    designerName:     firstItem.designerName || 'Designer',
                    agreedAmount:     total,
                    orderDescription: orderDescription,
                    collection:       null,
                    conversation:     null
                  }
                });
              }}>
              Proceed to Checkout
            </button>

            <a href="/fabrics" className="btn-continue-shopping">Continue Shopping</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;