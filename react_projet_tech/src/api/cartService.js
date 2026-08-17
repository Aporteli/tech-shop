import { API_URL as BASE_URL } from "./apiBase";

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Helper function to check if user is logged in
const isUserLoggedIn = () => {
  return !!getAuthToken();
};

// Add item to cart (localStorage or database)
export const addToCart = async (product) => {
  if (isUserLoggedIn()) {
    try {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Fallback to localStorage if API fails
      throw error;
    }
  }
  // If not logged in, the cart context handles localStorage
  return null;
};

// Get cart items from database
export const getCartItems = async () => {
  if (isUserLoggedIn()) {
    try {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/api/cart`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cart items");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw error;
    }
  }
  return null;
};

// Update cart item quantity
export const updateCartItem = async (productId, quantity) => {
  if (isUserLoggedIn()) {
    try {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/api/cart`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update cart item");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating cart:", error);
      throw error;
    }
  }
  return null;
};

// Remove item from cart
export const removeFromCart = async (productId) => {
  if (isUserLoggedIn()) {
    try {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/api/cart/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove item from cart");
      }

      return await response.json();
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  }
  return null;
};

// Clear cart
export const clearCart = async () => {
  if (isUserLoggedIn()) {
    try {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/api/cart`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to clear cart");
      }

      return await response.json();
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  }
  return null;
};
