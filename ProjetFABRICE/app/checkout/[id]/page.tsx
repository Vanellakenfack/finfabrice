"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  FaCcVisa,
  FaCcMastercard,
  FaPaypal,
  FaStripe,
  FaApplePay,
  FaGooglePay,
  FaLock,
  FaExclamationTriangle,
  FaWhatsapp,
  FaSpinner,
} from "react-icons/fa";

const CheckoutPage = () => {
  const searchParams = useSearchParams();

  const type = searchParams.get("type");
  const plan = searchParams.get("plan");
  const cycle = searchParams.get("cycle");

  const [price, setPrice] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [serverError, setServerError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Champs carte
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const sellerWhatsApp = "237699123456";

  /* ============================
     CALCUL DU PRIX
  ============================ */

  useEffect(() => {
    if (!type || !plan || !cycle) return;

    const pricing: any = {
      vendor: {
        starter: { monthly: 19, yearly: 190 },
        pro: { monthly: 39, yearly: 390 },
        enterprise: { monthly: 79, yearly: 790 },
      },
      supplier: {
        basic: { monthly: 29, yearly: 290 },
        premium: { monthly: 59, yearly: 590 },
      },
    };

    if (pricing[type]?.[plan]?.[cycle]) {
      setPrice(pricing[type][plan][cycle]);
    }
  }, [type, plan, cycle]);

  /* ============================
     VALIDATION CARTE
  ============================ */

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

  /* ============================
     PAIEMENT
  ============================ */

  const handlePayment = () => {
    if (paymentMethod === "visa" || paymentMethod === "mastercard") {
      if (!validateCard()) return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("Paiement réussi ✅ Abonnement activé !");
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">

      {/* ================= LEFT - RESUME ================= */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Résumé de commande</h2>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Type :</span>
            <span className="font-semibold capitalize">{type}</span>
          </div>

          <div className="flex justify-between">
            <span>Plan :</span>
            <span className="font-semibold capitalize">{plan}</span>
          </div>

          <div className="flex justify-between">
            <span>Cycle :</span>
            <span className="font-semibold capitalize">{cycle}</span>
          </div>

          <div className="border-t pt-4 flex justify-between text-xl font-bold">
            <span>Total :</span>
            <span>{price} €</span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT - PAYMENT ================= */}
      <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
        <div className="flex items-center gap-2 text-green-600 font-semibold">
          <FaLock /> Paiement sécurisé SSL
        </div>

        {/* Moyens paiement */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setPaymentMethod("visa")}
            className="border p-4 rounded-lg"
          >
            <FaCcVisa /> Visa
          </button>

          <button
            onClick={() => setPaymentMethod("mastercard")}
            className="border p-4 rounded-lg"
          >
            <FaCcMastercard /> MasterCard
          </button>

          <button
            onClick={() => setPaymentMethod("paypal")}
            className="border p-4 rounded-lg"
          >
            <FaPaypal /> PayPal
          </button>

          <button
            onClick={() => setPaymentMethod("stripe")}
            className="border p-4 rounded-lg"
          >
            <FaStripe /> Stripe
          </button>
        </div>

        {/* Form carte */}
        {(paymentMethod === "visa" ||
          paymentMethod === "mastercard") && (
          <div className="space-y-4">
            <input
              placeholder="Numéro de carte"
              className="border p-3 w-full rounded"
              onChange={(e) =>
                setCardNumber(e.target.value)
              }
            />

            <input
              placeholder="Nom du titulaire"
              className="border p-3 w-full rounded"
              onChange={(e) =>
                setCardName(e.target.value)
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="MM/AA"
                className="border p-3 rounded"
                onChange={(e) =>
                  setExpiry(e.target.value)
                }
              />
              <input
                placeholder="CVV"
                className="border p-3 rounded"
                onChange={(e) =>
                  setCvv(e.target.value)
                }
              />
            </div>

            {formError && (
              <p className="text-red-600">
                {formError}
              </p>
            )}

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg flex justify-center items-center gap-2"
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

        {/* Erreur serveur */}
        {serverError && (
          <div className="p-4 bg-red-50 border border-red-500 rounded">
            <p className="text-red-600 flex items-center gap-2">
              <FaExclamationTriangle />
              Erreur serveur
            </p>

            <a
              href={`https://wa.me/${sellerWhatsApp}`}
              className="text-green-600 flex items-center gap-2 mt-2"
            >
              <FaWhatsapp /> Contacter le support
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
