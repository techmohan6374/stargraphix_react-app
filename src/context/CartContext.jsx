import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('sg_cart');
    if (stored) {
      try { setCart(JSON.parse(stored)); } catch {}
    }
  }, []);

  const saveCart = (items) => {
    setCart(items);
    localStorage.setItem('sg_cart', JSON.stringify(items));
  };

  const addToCart = (product, qty = 1) => {
    const existing = cart.find(i => i.id === product.id);
    let updated;
    if (existing) {
      updated = cart.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      toast.success('Quantity updated in cart');
    } else {
      updated = [...cart, { ...product, qty }];
      toast.success('Added to cart!');
    }
    saveCart(updated);
  };

  const removeFromCart = (productId) => {
    const updated = cart.filter(i => i.id !== productId);
    saveCart(updated);
    toast.success('Removed from cart');
  };

  const updateQty = (productId, qty) => {
    if (qty < 1) return removeFromCart(productId);
    const updated = cart.map(i => i.id === productId ? { ...i, qty } : i);
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
    localStorage.removeItem('sg_cart');
  };

  const isInCart = (productId) => cart.some(i => i.id === productId);

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartSavings = cart.reduce((sum, i) => sum + ((i.originalPrice || i.price) - i.price) * i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, isInCart, cartTotal, cartCount, cartSavings }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
