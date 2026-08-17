import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { API_URL } from '../api/apiBase';

export const useAppSync = () => {
  // 2. ამოვიღებთ იმ ფუნქციებს, რომლებიც ამ კონტექსტების State-ებს ანახლებენ
  const { setCartItems } = useCart();
  const { setWishlistItems } = useWishlist();
  const { setCompareItems } = useCompare();
  const { user: authUser } = useAuth();
  console.log(authUser, 'authUser');

  useEffect(() => {
    // თუ მომხმარებელი დალოგინებული არ არის, არაფერს ვაკეთებთ
    if (!authUser?.id) return;

    const syncWithBackend = async () => {
      // ა) ვკითხულობთ LocalStorage-ს
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      const localWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      const localCompare = JSON.parse(localStorage.getItem('compare')) || [];

      try {
        // ბ) ვაგზავნით ბექენდზე
        const response = await fetch(`${API_URL}/api/user/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: authUser.id,
            cart: localCart,
            wishlist: localWishlist,
            compare: localCompare
          })
        });

        const data = await response.json();
        console.log(data, 'სინქრონიზაცია წარმატებით დასრულდა და 3 კონტექსტი განახლდა!');
        if (response.ok) {
          setCartItems(data.updatedData.cart);
          setWishlistItems(data.updatedData.wishlist);
          setCompareItems(data.updatedData.compare);

          // დ) ვასუფთავებთ LocalStorage-ს
          localStorage.removeItem('cart');
          localStorage.removeItem('wishlist');
          localStorage.removeItem('compare');
        }
      } catch (error) {
        console.error('სინქრონიზაციის შეცდომა:', error);
      }
    };

    syncWithBackend();
  }, [authUser?.id]); // ამოქმედდება მხოლოდ მაშინ, როცა user დალოგინდება
};
