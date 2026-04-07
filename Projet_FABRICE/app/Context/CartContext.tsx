// Context/CartContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
  useEffect,
} from "react";

// Type d'un article dans le panier
export interface CartItem {
  product: {
    id: number;
    name: string;
    price: number;
    images: string[];
    brand?: string;
  };
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartTotalQuantity: number;
  cartTotalPrice: number;
  addToCart: (product: CartItem["product"]) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "elite_shop_cart";

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Erreur lors du chargement du panier:", error);
    }
    setIsLoaded(true);
  }, []);

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (error) {
        console.error("Erreur lors de la sauvegarde du panier:", error);
      }
    }
  }, [cartItems, isLoaded]);

  const addToCart = useCallback((product: CartItem["product"]) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id);

      if (existingItem) {
        toast.success(`${product.name} ajouté au panier (${existingItem.quantity + 1})`);
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        toast.success(`${product.name} ajouté au panier`);
        return [...prevItems, { product, quantity: 1 }];
      }
    });
  }, []);

  const updateQuantity = useCallback((productId: number, newQuantity: number) => {
    setCartItems((prevItems) => {
      if (newQuantity <= 0) {
        toast.info("Article retiré du panier");
        return prevItems.filter((item) => item.product.id !== productId);
      }

      return prevItems.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
    toast.info("Article retiré du panier");
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    toast.info("Panier vidé");
  }, []);

  const { cartTotalQuantity, cartTotalPrice } = useMemo(() => {
    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    return { cartTotalQuantity: totalQuantity, cartTotalPrice: totalPrice };
  }, [cartItems]);

  const contextValue = useMemo(
    () => ({
      cartItems,
      cartTotalQuantity,
      cartTotalPrice,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [cartItems, cartTotalQuantity, cartTotalPrice, addToCart, updateQuantity, removeFromCart, clearCart]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};