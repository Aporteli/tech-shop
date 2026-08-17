import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { API_URL as BASE_URL } from '../api/apiBase';
const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const prevAuthRef = useRef(isAuthenticated);

  const [wishlistItems, setWishlistItems] = useState(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  // 1. Logout-ისას State-ის გასუფთავება
  useEffect(() => {
    if (prevAuthRef.current === true && isAuthenticated === false) {
      setWishlistItems([]);
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // 2. LocalStorage-ის მართვა (მხოლოდ სტუმრებისთვის / ცარიელი მასივისას წაშლა)
  useEffect(() => {
    if (isAuthenticated) {
      if (wishlistItems.length > 0) {
        localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
      } else {
        localStorage.removeItem('wishlist');
      }
    }
  }, [wishlistItems, isAuthenticated]);

  const isInWishlist = productId => {
    return wishlistItems.some(item => (item.id || item.product_id) === productId);
  };

  // 💖 Toggle (დამატება / წაშლა ბექენდზე და Local State-ში)
  const toggleWishlist = async product => {
    const productId = product.id || product.product_id;

    // ა) თუ დალოგინებულია, ვაგზავნით ბექენდზე
    if (isAuthenticated && user?.id) {
      try {
        await fetch(`${BASE_URL}/api/wishlist/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            productId: productId
          })
        });
      } catch (error) {
        console.error('Wishlist-ის შეცდომა:', error);
      }
    }

    // ბ) ვანახლებთ Local State-ს
    setWishlistItems(prevItems => {
      const exists = prevItems.some(item => (item.id || item.product_id) === productId);
      if (exists) {
        return prevItems.filter(item => (item.id || item.product_id) !== productId);
      }
      return [...prevItems, product];
    });
  };

  const removeFromWishlist = productId => {
    const item = wishlistItems.find(i => (i.id || i.product_id) === productId);
    if (item) {
      toggleWishlist(item);
    }
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    if (!isAuthenticated) {
      localStorage.removeItem('wishlist');
    }
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        setWishlistItems, // 👈 `useAppSync`-ისთვის გატანილია
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount
      }}>
      {children}
    </WishlistContext.Provider>
  );
};
