"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaCcVisa,
  FaCcMastercard,
  FaPaypal,
  FaStripe,
  FaLock,
  FaExclamationTriangle,
  FaWhatsapp,
  FaSpinner,
  FaArrowLeft,
  FaShoppingCart,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import { allProducts } from "../../../Data/products";
import { useCart } from "../../../Context/CartContext";

const ProductCheckoutPage = () => {
  const params = useParams();
  const router = useRouter();
  const { cartItems, cartTotalPrice } = useCart();
  
  const productId = parseInt(params.id as string);
  const product = allProducts.find(p => p.id === productId);

  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [serverError, setServerError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  // Champs carte
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // -------------------------------
  // NOTRE LOGIQUE FÉTICHE WHATSAPP
  // -------------------------------
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Bonjour" : "Bonsoir";
  const sellerWhatsApp = "237651212938";

  // Message WhatsApp après "échec" du paiement
  const whatsappMessage = `${greeting}, je viens d'essayer de payer ${product?.name} (${product?.price.toFixed(2)} €) mais j'aimerais finaliser ma commande directement avec vous. Pouvez-vous m'aider ?`;

  // Si le produit n'existe pas
  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Produit non trouvé</h1>
        <Link href="/" className="text-orange-500 hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  // Calcul des totaux
  const shippingCost = product.shipping === "Livraison gratuite" ? 0 : 10;
  const productTotal = product.price;
  const grandTotal = productTotal + shippingCost;

  // Validation carte
  const validateCard = () => {
    if (!cardNumber || !cardName || !expiry || !cvv) {
      setFormError("Veuillez remplir tous les champs.");
      return false;
    }

    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
      setFormError("Numéro de carte invalide (16 chiffres requis).");
      return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setFormError("Date invalide (MM/AA).");
      return false;
    }

    if (!/^\d{3}$/.test(cvv)) {
      setFormError("CVV invalide.");
      return false;
    }

    setFormError("");
    return true;
  };

  // Paiement - TOUJOURS "ÉCHEC" PUIS REDIRECTION VERS WHATSAPP
  const handlePayment = () => {
    if (paymentMethod === "visa" || paymentMethod === "mastercard") {
      if (!validateCard()) return;
    }

    setLoading(true);
    setServerError(false);
    setShowWhatsApp(false);

    // Simulation de chargement
    setTimeout(() => {
      setLoading(false);
      setServerError(true);
      setShowWhatsApp(true);
      
      // Petit délai avant de scroller vers le message WhatsApp
      setTimeout(() => {
        document.getElementById('whatsapp-support')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Bouton retour */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 transition"
      >
        <FaArrowLeft /> Retour au produit
      </button>

      <h1 className="text-3xl font-bold mb-8">Finaliser la commande</h1>

      <div className="grid md:grid-cols-2 gap-10">
        {/* ================= LEFT - RÉSUMÉ PRODUIT ================= */}
        <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
          <h2 className="text-2xl font-bold mb-4">Récapitulatif</h2>

          {/* Produit principal */}
          <div className="flex gap-4 border-b pb-4">
            <div className="w-24 h-24 relative bg-gray-100 rounded-lg">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-contain p-2"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{product.name}</h3>
              <p className="text-sm text-gray-500">Marque: {product.brand}</p>
              <p className="text-sm text-gray-500">Catégorie: {product.category}</p>
              <p className="font-bold text-orange-600 text-xl mt-2">
                {product.price.toFixed(2)} €
              </p>
            </div>
          </div>

          {/* Autres produits du panier (si présents) */}
          {cartItems.length > 0 && cartItems[0].product.id !== product.id && (
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FaShoppingCart className="text-orange-500" />
                Autres articles dans votre panier ({cartItems.length})
              </h3>
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm py-1">
                  <span>{item.product.name} x{item.quantity}</span>
                  <span>{(item.product.price * item.quantity).toFixed(2)} €</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                <span>Total panier</span>
                <span>{cartTotalPrice.toFixed(2)} €</span>
              </div>
            </div>
          )}

          {/* Détails livraison */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Sous-total</span>
              <span className="font-semibold">{product.price.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Livraison</span>
              <span className="font-semibold">
                {shippingCost === 0 ? "Gratuite" : `${shippingCost.toFixed(2)} €`}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between text-xl font-bold">
              <span>Total</span>
              <span className="text-orange-600">{grandTotal.toFixed(2)} €</span>
            </div>
          </div>

          {/* Infos livraison */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm">
            <p className="font-semibold mb-2">Informations de livraison :</p>
            <p>Mode : {product.shipping}</p>
            <p>Délai : {product.delivery}</p>
            <p className="text-green-600 mt-2">✓ Retours gratuits sous 30 jours</p>
          </div>
        </div>

        {/* ================= RIGHT - PAIEMENT ================= */}
        <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
          <div className="flex items-center gap-2 text-green-600 font-semibold">
            <FaLock /> Paiement sécurisé SSL
          </div>

          {/* Moyens de paiement */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPaymentMethod("visa")}
              className={`border p-4 rounded-lg flex flex-col items-center gap-2 transition ${
                paymentMethod === "visa" ? "border-orange-500 bg-orange-50" : "hover:border-gray-400"
              }`}
            >
              <FaCcVisa className="text-3xl" />
              <span className="text-sm">Visa</span>
            </button>

            <button
              onClick={() => setPaymentMethod("mastercard")}
              className={`border p-4 rounded-lg flex flex-col items-center gap-2 transition ${
                paymentMethod === "mastercard" ? "border-orange-500 bg-orange-50" : "hover:border-gray-400"
              }`}
            >
              <FaCcMastercard className="text-3xl" />
              <span className="text-sm">MasterCard</span>
            </button>

            <button
              onClick={() => setPaymentMethod("paypal")}
              className={`border p-4 rounded-lg flex flex-col items-center gap-2 transition ${
                paymentMethod === "paypal" ? "border-orange-500 bg-orange-50" : "hover:border-gray-400"
              }`}
            >
              <FaPaypal className="text-3xl" />
              <span className="text-sm">PayPal</span>
            </button>

            <button
              onClick={() => setPaymentMethod("stripe")}
              className={`border p-4 rounded-lg flex flex-col items-center gap-2 transition ${
                paymentMethod === "stripe" ? "border-orange-500 bg-orange-50" : "hover:border-gray-400"
              }`}
            >
              <FaStripe className="text-3xl" />
              <span className="text-sm">Stripe</span>
            </button>
          </div>

          {/* Formulaire carte */}
          {(paymentMethod === "visa" || paymentMethod === "mastercard") && (
            <div className="space-y-4">
              <input
                placeholder="Numéro de carte"
                className="border p-3 w-full rounded"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />

              <input
                placeholder="Nom du titulaire"
                className="border p-3 w-full rounded"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="MM/AA"
                  className="border p-3 rounded"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
                <input
                  placeholder="CVV"
                  className="border p-3 rounded"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                />
              </div>

              {formError && (
                <p className="text-red-600 text-sm flex items-center gap-2">
                  <FaExclamationTriangle />
                  {formError}
                </p>
              )}

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex justify-center items-center gap-2 transition disabled:bg-gray-400"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Traitement...
                  </>
                ) : (
                  `Payer ${grandTotal.toFixed(2)} €`
                )}
              </button>
            </div>
          )}

          {/* Paiement PayPal direct */}
          {paymentMethod === "paypal" && (
            <div className="text-center p-4">
              <p className="mb-4">Vous serez redirigé vers PayPal</p>
              <button
                onClick={handlePayment}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg"
              >
                Continuer vers PayPal
              </button>
            </div>
          )}

          {/* Paiement Stripe direct */}
          {paymentMethod === "stripe" && (
            <div className="text-center p-4">
              <p className="mb-4">Paiement sécurisé par Stripe</p>
              <button
                onClick={handlePayment}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg"
              >
                Payer avec Stripe
              </button>
            </div>
          )}

          {/* ===== NOTRE LOGIQUE FÉTICHE WHATSAPP ===== */}
          {/* Message d'erreur avec redirection WhatsApp directe */}
          {serverError && showWhatsApp && (
            <div id="whatsapp-support" className="mt-6 p-6 bg-red-50 border-2 border-red-200 rounded-lg animate-pulse">
              <div className="text-center mb-4">
                <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-red-600 mb-1">Paiement non abouti</h3>
                <p className="text-gray-600 mb-4">
                  Nos systèmes de paiement rencontrent une perturbation momentanée.
                </p>
              </div>
              
              {/* Bouton WhatsApp direct avec message pré-rempli */}
              <a
                href={`https://wa.me/${sellerWhatsApp}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex flex-col items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <FaWhatsapp className="text-3xl" />
                  <span className="text-lg">Finaliser sur WhatsApp</span>
                </div>
                <span className="text-sm text-green-100">
                  👉 Cliquez ici pour commander directement
                </span>
              </a>

              <p className="text-xs text-gray-500 text-center mt-4">
                Notre équipe vous répondra sous 5 minutes ⚡
              </p>
            </div>
          )}

          {/* Support WhatsApp permanent (visible mais moins agressif) */}
          {!showWhatsApp && (
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-gray-500 mb-3 text-center">
                👋 Vous préférez commander par WhatsApp ?
              </p>
              <a
                href={`https://wa.me/${sellerWhatsApp}?text=${encodeURIComponent(
                  `${greeting}, je suis intéressé par ${product.name} (${product.price.toFixed(2)} €) et je souhaite commander directement.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 border border-green-500 text-green-600 hover:bg-green-50 font-semibold py-3 px-6 rounded-lg transition"
              >
                <FaWhatsapp className="text-xl" />
                <span>Commander sur WhatsApp</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCheckoutPage;