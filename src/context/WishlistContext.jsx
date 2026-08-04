import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('sg_wishlist');
    if (stored) {
      try { setWishlist(JSON.parse(stored)); } catch {}
    }
  }, []);

  const saveWishlist = (items) => {
    setWishlist(items);
    localStorage.setItem('sg_wishlist', JSON.stringify(items));
  };

  const toggleWishlist = (product) => {
    const exists = wishlist.find(i => i.id === product.id);
    if (exists) {
      saveWishlist(wishlist.filter(i => i.id !== product.id));
      toast.success('Removed from wishlist');
    } else {
      saveWishlist([...wishlist, product]);
      toast.success('Added to wishlist!');
    }
  };

  const removeFromWishlist = (productId) => {
    saveWishlist(wishlist.filter(i => i.id !== productId));
  };

  const isInWishlist = (productId) => wishlist.some(i => i.id === productId);
  const clearWishlist = () => saveWishlist([]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, removeFromWishlist, isInWishlist, clearWishlist, wishlistCount: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
