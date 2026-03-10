import { useState } from 'react';

function Cart() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Premium Ankara Fabric',
      category: 'Ankara',
      price: 2500,
      quantity: 2,
      unit: 'yard'
    },
    {
      id: 2,
      name: 'Luxury Silk Fabric',
      category: 'Silk',
      price: 5000,
      quantity: 1,
      unit: 'meter'
    }
  ]);

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) {
      removeItem(id);
      return;
    }
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQty } : item
    ));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50000 ? 0 : 2000;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <h1>YOUR CART</h1>
        <div className="empty-message">
          <p style={{fontSize: '60px'}}>🛒</p>
          <h2>Your Cart is Empty</h2>
          <p>Add some fabrics to get started!</p>
          <a href="/" className="btn-shop">Browse Fabrics</a>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1>YOUR CART</h1>
        <p>{cartItems.length} items</p>

        <div className="cart-grid">
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <div className="placeholder">📦</div>
                </div>

                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p className="category">{item.category}</p>
                  <p className="price-per">₦{item.price.toLocaleString()} per {item.unit}</p>
                </div>

                <div className="item-quantity">
                  <label>Quantity</label>
                  <div className="qty-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                    <input 
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    />
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>

                <div className="item-total">
                  <p>Total</p>
                  <h4>₦{(item.price * item.quantity).toLocaleString()}</h4>
                </div>

                <button className="remove-btn" onClick={() => removeItem(item.id)}>✕</button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `₦${shipping.toLocaleString()}`}</span>
            </div>

            {subtotal < 50000 && (
              <p className="shipping-note">
                Add ₦{(50000 - subtotal).toLocaleString()} for free shipping!
              </p>
            )}

            <hr />

            <div className="summary-total">
              <span>TOTAL</span>
              <span>₦{total.toLocaleString()}</span>
            </div>

            <a href="/checkout" className="btn-checkout">Proceed to Checkout</a>
            <a href="/" className="btn-continue">Continue Shopping</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;