"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaTrashAlt, FaMinus, FaPlus } from "react-icons/fa";

// ✅ Correction du chemin vers ton contexte panier
// ⚠️ Si ton fichier CartContext se trouve dans `app/Context/CartContext.tsx`, garde ce chemin.
// Sinon, ajuste selon ton arborescence (ex: "../../components/Context/CartContext").
import { useCart, CartItem as CartItemType } from "../Context/CartContext";

// ----------------------------------------------------
// 1. Composant pour un seul article du panier
// ----------------------------------------------------
interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(product.id);
    } else {
      updateQuantity(product.id, newQuantity);
    }
  };

  return (
    <div className="flex items-center border-b py-4">
      {/* Image du produit */}
      <div className="w-20 h-20 relative mr-4">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-contain rounded-lg"
        />
      </div>

      {/* Détails du produit */}
      <div className="flex-grow">
        <h3 className="font-semibold text-gray-800">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.brand}</p>
        <p className="font-bold text-orange-600 mt-1">
          {(product.price * quantity).toFixed(2)} €
        </p>
      </div>

      {/* Contrôles de quantité */}
      <div className="flex items-center border border-gray-300 rounded-md">
        <button
          onClick={() => handleUpdateQuantity(quantity - 1)}
          className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          disabled={quantity <= 1}
        >
          <FaMinus className="text-xs" />
        </button>
        <span className="px-3 text-sm font-medium">{quantity}</span>
        <button
          onClick={() => handleUpdateQuantity(quantity + 1)}
          className="p-2 text-gray-600 hover:bg-gray-100"
        >
          <FaPlus className="text-xs" />
        </button>
      </div>

      {/* Bouton Supprimer */}
      <button
        onClick={() => removeFromCart(product.id)}
        className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-full transition"
        aria-label={`Supprimer ${product.name} du panier`}
      >
        <FaTrashAlt />
      </button>
    </div>
  );
};

// ----------------------------------------------------
// 2. Composant principal de la page Panier
// ----------------------------------------------------
const CartPage: React.FC = () => {
  const { cartItems, cartTotalPrice } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Votre panier est vide
        </h1>
        <p className="text-gray-600 mb-8">
          Il est temps d'explorer nos produits et de remplir votre panier !
        </p>
        <Link
          href="/products"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition shadow-lg"
        >
          Commencer mes achats
        </Link>
      </div>
    );
  }

  // Exemple de coût de livraison
  const shippingCost = 10.0;
  const grandTotal = cartTotalPrice + shippingCost;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Votre Panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste des articles du panier */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          {cartItems.map((item: CartItemType) => (
            <CartItem key={item.product.id} item={item} />
          ))}
          <Link
            href="/products"
            className="inline-block mt-6 text-orange-500 hover:text-orange-600 font-medium"
          >
            ← Continuer mes achats
          </Link>
        </div>

        {/* Récapitulatif de la commande */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md h-fit">
          <h2 className="text-xl font-bold mb-4 border-b pb-3">
            Récapitulatif de la commande
          </h2>

          <div className="space-y-3 text-gray-700">
            <div className="flex justify-between">
              <span>Sous-total des produits :</span>
              <span className="font-medium">
                {cartTotalPrice.toFixed(2)} €
              </span>
            </div>
            <div className="flex justify-between">
              <span>Livraison (Standard) :</span>
              <span className="font-medium">{shippingCost.toFixed(2)} €</span>
            </div>
          </div>

          <div className="flex justify-between font-bold text-lg mt-5 pt-5 border-t border-dashed">
            <span>Total :</span>
            <span className="text-orange-600">{grandTotal.toFixed(2)} €</span>
          </div>

          <button className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition shadow-lg">
            Procéder au paiement
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
