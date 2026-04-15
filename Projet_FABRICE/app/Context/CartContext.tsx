// Context/CartContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
// Assurez-vous d'ajuster le chemin si nécessaire.
// Si le dossier Data est à la racine, cela devrait fonctionner.
import { Product } from "../Data/products";

// 1. Définir le type d'un article dans le panier
export interface CartItem {
  product: Product;
  quantity: number;
}

// 2. Définir le type du contexte
interface CartContextType {
  cartItems: CartItem[];
  cartTotalQuantity: number;
  cartTotalPrice: number;
  addToCart: (product: Product) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
}

// Valeur initiale par défaut (utilisée pour créer le contexte)
const CartContext = createContext<CartContextType | undefined>(undefined);

// 3. Le Provider qui enveloppe l'application
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Fonction pour ajouter un produit au panier
  const addToCart = useCallback((product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id);

      if (existingItem) {
        // Si le produit existe, augmente la quantité de 1
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Sinon, ajoute un nouvel article avec quantité 1
        return [...prevItems, { product, quantity: 1 }];
      }
    });
  }, []);

  // Fonction pour mettre à jour la quantité d'un produit
  const updateQuantity = useCallback(
    (productId: number, newQuantity: number) => {
      setCartItems((prevItems) => {
        if (newQuantity <= 0) {
          // Si la quantité est <= 0, on supprime l'article
          return prevItems.filter((item) => item.product.id !== productId);
        }

        return prevItems.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        );
      });
    },
    []
  );

  // Fonction pour supprimer un produit du panier
  const removeFromCart = useCallback((productId: number) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
  }, []);

  // 4. Calculs des totaux (optimisés avec useMemo)
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

  // 5. La valeur du contexte fournie aux composants
  const contextValue = useMemo(
    () => ({
      cartItems,
      cartTotalQuantity,
      cartTotalPrice,
      addToCart,
      updateQuantity,
      removeFromCart,
    }),
    [
      cartItems,
      cartTotalQuantity,
      cartTotalPrice,
      addToCart,
      updateQuantity,
      removeFromCart,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

// 6. Hook personnalisé pour une utilisation facile dans les composants
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};