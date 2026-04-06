// app/checkout/subscription/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  FaCcVisa,
  FaCcMastercard,
  FaPaypal,
  FaStripe,
  FaLock,
  FaExclamationTriangle,
  FaWhatsapp,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";

export default function SubscriptionCheckoutPage() {
  const searchParams = useSearchParams();

  const type = searchParams.get("type");
  const plan = searchParams.get("plan");
  const cycle = searchParams.get("cycle");

  const [price, setPrice] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [paymentError, setPaymentError] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Champs carte
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const sellerWhatsApp = "237699123456";

  useEffect(() => {
    if (!type || !plan || !cycle) return;

    const pricing: any = {
      vendor: {
        starter: { monthly: 19, yearly: 190 },
        pro: { monthly: 39, yearly: 390 },
        enterprise: { monthly: 79, yearly: 790 },
      },
      supplier: {
        basic: { monthly: 49, yearly: 490 },
        premium: { monthly: 129, yearly: 1290 },
        enterprise: { monthly: 299, yearly: 2990 },
      },
    };

    if (pricing[type]?.[plan]?.[cycle]) {
      setPrice(pricing[type][plan][cycle]);
    }
  }, [type, plan, cycle]);

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

  const handlePayment = () => {
    if (paymentMethod === "visa" || paymentMethod === "mastercard") {
      if (!validateCard()) return;
    }

    setLoading(true);
    setPaymentError(false);
    setPaymentSuccess(false);

    // Simulation d'un paiement qui échoue
    setTimeout(() => {
      setLoading(false);
      setPaymentError(true); // Affiche l'erreur de paiement
      // Si vous voulez simuler un succès occasionnel, vous pouvez utiliser :
      // Math.random() > 0.5 ? setPaymentSuccess(true) : setPaymentError(true);
    }, 2000);
  };

  const resetForm = () => {
    setPaymentMethod(null);
    setCardNumber("");
    setCardName("");
    setExpiry("");
    setCvv("");
    setFormError("");
    setPaymentError(false);
    setPaymentSuccess(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">
      
      {/* Résumé de commande */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-orange-100">
        <h2 className="text-2xl font-bold mb-6 text-orange-600">Résumé de votre abonnement</h2>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Type :</span>
            <span className="font-semibold capitalize text-gray-900">{type === 'supplier' ? 'Fournisseur' : type}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Plan :</span>
            <span className="font-semibold capitalize text-gray-900">
              {plan === 'basic' && 'Distributeur'}
              {plan === 'premium' && 'Grossiste Pro'}
              {plan === 'enterprise' && 'Usine & Import'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Cycle :</span>
            <span className="font-semibold capitalize text-gray-900">
              {cycle === 'monthly' ? 'Mensuel' : 'Annuel'}
              {cycle === 'yearly' && <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">-20%</span>}
            </span>
          </div>

          <div className="border-t-2 border-orange-100 pt-4 mt-4 flex justify-between text-xl font-bold">
            <span className="text-gray-800">Total à payer :</span>
            <span className="text-orange-600">{price} €</span>
          </div>
        </div>
      </div>

      {/* Paiement */}
      <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6 border-2 border-orange-100">
        <div className="flex items-center gap-2 text-orange-600 font-semibold">
          <FaLock /> Paiement sécurisé SSL
        </div>

        {/* Message de succès (optionnel) */}
        {paymentSuccess && (
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center">
            <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-green-700 mb-2">Paiement réussi !</h3>
            <p className="text-green-600 mb-4">Votre abonnement a été activé avec succès.</p>
            <button
              onClick={resetForm}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Retour aux abonnements
            </button>
          </div>
        )}

        {/* Message d'erreur de paiement */}
        {paymentError && !paymentSuccess && (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 text-center">
            <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-red-700 mb-2">Échec du paiement</h3>
            <p className="text-red-600 mb-4">
              Votre paiement n'a pas pu être traité. Veuillez contacter notre support pour finaliser votre abonnement.
            </p>
            
            {/* Bouton WhatsApp */}
            <a
              href={`https://wa.me/${sellerWhatsApp}?text=${encodeURIComponent(
                `Bonjour, j'ai un problème de paiement pour mon abonnement ${plan} (${cycle}). Montant: ${price}€`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <FaWhatsapp className="text-xl" />
              Contacter le support WhatsApp
            </a>

            <button
              onClick={resetForm}
              className="block mx-auto mt-4 text-gray-500 hover:text-gray-700 underline text-sm"
            >
              Réessayer avec un autre moyen de paiement
            </button>
          </div>
        )}

        {/* Formulaire de paiement (caché si erreur ou succès) */}
        {!paymentError && !paymentSuccess && (
          <>
            {/* Moyens de paiement */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod("visa")}
                className={`border-2 p-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === "visa" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <FaCcVisa className="text-2xl text-blue-600" /> Visa
              </button>

              <button
                onClick={() => setPaymentMethod("mastercard")}
                className={`border-2 p-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === "mastercard" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <FaCcMastercard className="text-2xl text-orange-600" /> MasterCard
              </button>

              <button
                onClick={() => setPaymentMethod("paypal")}
                className={`border-2 p-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === "paypal" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <FaPaypal className="text-2xl text-blue-600" /> PayPal
              </button>

              <button
                onClick={() => setPaymentMethod("stripe")}
                className={`border-2 p-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === "stripe" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <FaStripe className="text-2xl text-purple-600" /> Stripe
              </button>
            </div>

            {/* Formulaire carte */}
            {(paymentMethod === "visa" || paymentMethod === "mastercard") && (
              <div className="space-y-4 animate-fadeIn">
                <input
                  placeholder="Numéro de carte"
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:border-orange-500 focus:outline-none"
                  onChange={(e) => setCardNumber(e.target.value)}
                  value={cardNumber}
                />

                <input
                  placeholder="Nom du titulaire"
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:border-orange-500 focus:outline-none"
                  onChange={(e) => setCardName(e.target.value)}
                  value={cardName}
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    placeholder="MM/AA"
                    className="border-2 border-gray-200 p-3 rounded-xl focus:border-orange-500 focus:outline-none"
                    onChange={(e) => setExpiry(e.target.value)}
                    value={expiry}
                  />
                  <input
                    placeholder="CVV"
                    className="border-2 border-gray-200 p-3 rounded-xl focus:border-orange-500 focus:outline-none"
                    onChange={(e) => setCvv(e.target.value)}
                    value={cvv}
                  />
                </div>

                {formError && (
                  <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">
                    {formError}
                  </p>
                )}

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    `Payer ${price} €`
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}