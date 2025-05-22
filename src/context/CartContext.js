// context/CartContext.tsx
import React, { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [carts, setCarts] = useState({}); // { restaurantId: [item, item] }

  const addToCart = (restaurantId, item) => {
    setCarts((prev) => {
      const currentCart = prev[restaurantId] || [];
      const existing = currentCart.find((i) => i.id === item.id);

      let updatedCart;
      if (existing) {
        updatedCart = currentCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        updatedCart = [...currentCart, { ...item, quantity: 1 }];
      }

      return { ...prev, [restaurantId]: updatedCart };
    });
  };

  const decreaseFromCart = (restaurantId, itemId) => {
    setCarts((prev) => {
      const currentCart = prev[restaurantId] || [];
      const updatedCart = currentCart
        .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0);

      return { ...prev, [restaurantId]: updatedCart };
    });
  };

  const getCartItems = (restaurantId) => carts[restaurantId] || [];

  const hasItems = (restaurantId) =>
    carts[restaurantId] && carts[restaurantId].length > 0;

  const clearCart = (restaurantId) => {
    setCarts((prev) => ({ ...prev, [restaurantId]: [] }));
  };

  return (
    <CartContext.Provider
      value={{
        carts,
        addToCart,
        decreaseFromCart,
        getCartItems,
        hasItems,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
