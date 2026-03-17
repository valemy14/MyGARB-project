// Get current logged-in user ID
export const getCurrentUserId = () => {
  const user = localStorage.getItem('mygarb_user');
  if (!user) return null;
  
  try {
    const userData = JSON.parse(user);
    return userData._id;
  } catch {
    return null;
  }
};

// Get cart key for current user
export const getCartKey = () => {
  const userId = getCurrentUserId();
  // If logged in, use user-specific cart key
  // If not logged in, use guest cart (for browsing before login)
  return userId ? `mygarb_cart_${userId}` : 'mygarb_cart_guest';
};

// Get user's cart from localStorage
export const getUserCart = () => {
  const cartKey = getCartKey();
  const saved = localStorage.getItem(cartKey);
  return saved ? JSON.parse(saved) : [];
};

// Save user's cart to localStorage
export const saveUserCart = (cartItems) => {
  const cartKey = getCartKey();
  localStorage.setItem(cartKey, JSON.stringify(cartItems));
};

// Clear current user's cart
export const clearUserCart = () => {
  const cartKey = getCartKey();
  localStorage.removeItem(cartKey);
};