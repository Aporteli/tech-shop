import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const BASE_URL = 'http://localhost:5001';
const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const prevAuthRef = useRef(isAuthenticated);

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // 1. ამოწმებს Logout-ის მომენტს და ასუფთავებს State-ს
  useEffect(() => {
    if (prevAuthRef.current === true && isAuthenticated === false) {
      setCartItems([]);
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // 2. ვინახავთ LocalStorage-ში მხოლოდ მაშინ, როცა მომხმარებელი სტუმარია
  useEffect(() => {
    if (isAuthenticated) {
      if (cartItems.length > 0) {
        localStorage.setItem('cart', JSON.stringify(cartItems));
      } else {
        localStorage.removeItem('cart');
      }
    }
  }, [cartItems, isAuthenticated]);

  // 🛒 3. კალათაში დამატება (Local State + Backend API)
  const addToCart = async product => {
    const productId = product.id || product.product_id;

    // ა) თუ დალოგინებულია, ვაგზავნით ბექენდზე
    if (isAuthenticated && user?.id) {
      try {
        await fetch(`${BASE_URL}/api/cart/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            productId: productId,
            quantity: 1
          })
        });
      } catch (error) {
        console.error('კალათაში დამატების შეცდომა:', error);
      }
    }

    // ბ) ვანახლებთ UI-ის Local State-ს
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => (item.id || item.product_id) === productId);
      if (existingItem) {
        return prevItems.map(item =>
          (item.id || item.product_id) === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // 🗑️ 4. კალათიდან ამოღება (Local State + Backend API)
  const removeFromCart = async productId => {
    // ა) თუ დალოგინებულია, ვშლით ბექენდიდან
    if (isAuthenticated && user?.id) {
      try {
        await fetch(`${BASE_URL}/api/cart/remove`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            productId: productId
          })
        });
      } catch (error) {
        console.error('კალათიდან წაშლის შეცდომა:', error);
      }
    }

    // ბ) ვშლით Local State-იდან
    setCartItems(prevItems => prevItems.filter(item => (item.id || item.product_id) !== productId));
  };

  // ➕/➖ 5. რაოდენობის შეცვლა (Local State + Backend API)
  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // ა) თუ დალოგინებულია, ვაახლებთ ბექენდზე
    if (isAuthenticated && user?.id) {
      try {
        await fetch(`${BASE_URL}/api/cart/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            productId: productId,
            quantity: quantity
          })
        });
      } catch (error) {
        console.error('რაოდენობის განახლების შეცდომა:', error);
      }
    }

    // ბ) ვაახლებთ Local State-ს
    setCartItems(prevItems =>
      prevItems.map(item =>
        (item.id || item.product_id) === productId ? { ...item, quantity } : item
      )
    );
  };

  // 🧹 6. კალათის სრული გასუფთავება
  const clearCart = () => {
    setCartItems([]);
    if (!isAuthenticated) {
      localStorage.removeItem('cart');
    }
  };

  // 💰 7. ჯამური ფასის გამოთვლა (ვითვალისწინებთ discount_price-ს და discountPrice-ს)
  const cartTotal = cartItems.reduce((total, item) => {
    const currentPrice = item.discount_price || item.discountPrice;
    const originalPrice = item.price;

    const price =
      Number(currentPrice) && Number(currentPrice) < Number(originalPrice)
        ? Number(currentPrice)
        : Number(originalPrice);

    return total + price * item.quantity;
  }, 0);

  // 🔢 8. პროდუქტების საერთო რაოდენობა კალათაში
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems, // 👈 `useAppSync`-ისთვის გატანილია
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount
      }}>
      {children}
    </CartContext.Provider>
  );
};
