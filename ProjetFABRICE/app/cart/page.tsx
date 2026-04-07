"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation"; 
import { FaTrashAlt, FaMinus, FaPlus, FaLock, FaArrowRight, FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import { useCart, CartItem as CartItemType } from "../Context/CartContext";
import { Button } from "../componets/ui/button"; 

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
    <div className="flex items-center border-b py-6 group">
      <div className="w-24 h-24 relative mr-6 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 p-2">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-contain transition-transform group-hover:scale-110"
        />
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h3>
        <p className="text-orange-600 font-black mb-3">{product.price.toFixed(2)} €</p>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
            <button
              onClick={() => handleUpdateQuantity(quantity - 1)}
              className="p-2 hover:bg-gray-100 transition-colors text-gray-600"
            >
              <FaMinus size={12} />
            </button>
            <span className="w-10 text-center font-bold text-gray-800">{quantity}</span>
            <button
              onClick={() => handleUpdateQuantity(quantity + 1)}
              className="p-2 hover:bg-gray-100 transition-colors text-gray-600"
            >
              <FaPlus size={12} />
            </button>
          </div>
          <button
            onClick={() => removeFromCart(product.id)}
            className="text-red-400 hover:text-red-600 transition-colors p-2"
            title="Supprimer l'article"
          >
            <FaTrashAlt />
          </button>
        </div>
      </div>
      <div className="text-right">
        <p className="font-black text-gray-900">{(product.price * quantity).toFixed(2)} €</p>
      </div>
    </div>
  );
};

const CartPage = () => {
  const router = useRouter();
  const { cartItems, cartTotalPrice } = useCart();
  
  // Paramètres de simulation (Livraison)
  const shippingCost = cartItems.length > 0 ? 0 : 0; // Offerte ou fixe
  const grandTotal = cartTotalPrice + shippingCost;

  // --- LOGIQUE D'AUTHENTIFICATION (SIMULATION) ---
  // À lier plus tard avec votre système réel (ex: const { user } = useAuth())
  const isAuthenticated = false; 

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      // Redirection vers login avec mémoire du retour vers le panier
      const returnUrl = encodeURIComponent("/cart");
      router.push(`/login?redirect=${returnUrl}`);
    } else {
      // L'utilisateur est connecté, on l'envoie vers la page de paiement globale
      router.push("/checkout");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <FaShoppingCart className="text-gray-300 text-4xl" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Votre panier est vide</h1>
        <p className="text-gray-500 mb-8 text-center max-w-sm">
          Il semblerait que vous n'ayez pas encore ajouté d'articles à votre panier.
        </p>
        <Link href="/products">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 rounded-xl font-bold">
            Découvrir nos produits
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black text-gray-900 mb-10 tracking-tight">Mon Panier</h1>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* LISTE DES ARTICLES */}
        <div className="lg:col-span-2 space-y-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {cartItems.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 mt-6 text-gray-500 hover:text-orange-500 font-bold transition-colors">
            <FaArrowLeft /> Continuer mes achats
          </Link>
        </div>

        {/* RÉCAPITULATIF & PAIEMENT */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
            <h2 className="text-2xl font-black text-gray-900 mb-6 pb-4 border-b border-gray-100">Récapitulatif</h2>
            
            <div className="space-y-4 text-gray-600 mb-8 font-medium">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span className="text-gray-900">{cartTotalPrice.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Livraison</span>
                <span className="text-green-600 font-bold">Gratuite</span>
              </div>
              
              <div className="pt-6 mt-6 border-t border-dashed border-gray-200">
                <div className="flex justify-between items-center font-black text-3xl text-gray-900">
                  <span>Total</span>
                  <span className="text-orange-600">{grandTotal.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            {/* LE BOUTON AVEC LA LOGIQUE DE VÉRIFICATION */}
            <Button 
              onClick={handleProceedToCheckout}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-7 text-lg rounded-2xl shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <FaLock className="text-sm opacity-80" />
              PROCÉDER AU PAIEMENT
            </Button>
            
            <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col items-center">
               <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold mb-4">Paiements 100% sécurisés</p>
               <div className="flex gap-4 opacity-40 grayscale hover:grayscale-0 transition-all">
                  <div className="w-10 h-6 bg-gray-200 rounded"></div>
                  <div className="w-10 h-6 bg-gray-200 rounded"></div>
                  <div className="w-10 h-6 bg-gray-200 rounded"></div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;