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

      const newCarts = { ...prev, [restaurantId]: updatedCart };
      console.log("addToCart => Updated carts:", newCarts);
      return newCarts;
    });
  };

  const decreaseFromCart = (restaurantId, itemId) => {
    setCarts((prev) => {
      const currentCart = prev[restaurantId] || [];
      const updatedCart = currentCart
        .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0);

      const newCarts = { ...prev, [restaurantId]: updatedCart };
      console.log("decreaseFromCart => Updated carts:", newCarts);
      return newCarts;
    });
  };

  const getCartItems = (restaurantId) => carts[restaurantId] || [];

  const hasItems = (restaurantId) =>
    carts[restaurantId] && carts[restaurantId].length > 0;

  const clearCart = (restaurantId) => {
    setCarts((prev) => {
      const newCarts = { ...prev, [restaurantId]: [] };
      console.log("clearCart => Updated carts:", newCarts);
      return newCarts;
    });
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
