"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const CART_STORAGE_KEY = "pharmacy-cart";
const USER_STORAGE_KEY = "pharmacy-user";

const demoUser = {
  email: "user@mauryapharmacy.com",
  name: "Guest User",
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedCart = typeof window !== "undefined" ? localStorage.getItem(CART_STORAGE_KEY) : null;
    const storedUser = typeof window !== "undefined" ? localStorage.getItem(USER_STORAGE_KEY) : null;

    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        setCartItems([]);
      }
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        setUser(null);
      }
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems, isReady]);

  useEffect(() => {
    if (!isReady) return;
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user, isReady]);

  const login = (email, password) => {
    if (!email || !password) {
      return { success: false, message: "Please enter email and password." };
    }

    if (email.trim().toLowerCase() !== demoUser.email || password !== "password123") {
      return { success: false, message: "Invalid email or password. Use user@mauryapharmacy.com / password123" };
    }

    setUser({ ...demoUser, email: email.trim().toLowerCase() });
    return { success: true, message: "Login successful." };
  };

  // Called after phone OTP is verified and backend returns customer data
  const loginWithPhone = (customer) => {
    if (!customer?.id && !customer?.phone) return { success: false, message: "Invalid customer data." };
    setUser({
      id: customer.id,
      phone: customer.phone,
      name: customer.name || customer.phone,
      email: customer.email || "",
    });
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setCartItems([]);
  };

  const addToCart = (product, quantity = 1) => {
    if (!product) return;

    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id || item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item._id === existing._id || item.id === existing.id
            ? {
                ...item,
                quantity: Math.min((item.quantity || 1) + quantity, product.stock || 999),
              }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          quantity,
        },
      ];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id && item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id || item.id === id
          ? {
              ...item,
              quantity: Math.max(1, quantity),
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

  const value = useMemo(
    () => ({
      cartItems,
      user,
      isAuthenticated: Boolean(user),
      totalItems,
      totalPrice,
      login,
      loginWithPhone,
      logout,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [cartItems, user, totalItems, totalPrice]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
