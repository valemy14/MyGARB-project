import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('mygarb_cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mygarb_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (fabric, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === fabric._id);

      if (existingItem) {
        // Item already in cart, update quantity
        return prevItems.map((item) =>
          item._id === fabric._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // New item, add to cart
        return [...prevItems, { ...fabric, quantity }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (fabricId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== fabricId));
  };

  // Update item quantity
  const updateQuantity = (fabricId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(fabricId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === fabricId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate totals
  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getShipping = () => {
    const subtotal = getSubtotal();
    if (subtotal === 0) return 0;
    if (subtotal > 50000) return 0; // Free shipping over ₦50,000
    return 2000; // Flat rate shipping
  };

  const getTotal = () => {
    return getSubtotal() + getShipping();
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getSubtotal,
    getShipping,
    getTotal,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}