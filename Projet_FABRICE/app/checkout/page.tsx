"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { FaLock, FaArrowLeft, FaCheckCircle, FaCreditCard, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import { useCart } from "../Context/CartContext";
import { buildImageUrl } from "../../lib/imageUrl";
import { RootState } from "../Data";
import toast from "react-hot-toast";

type PaymentMethod = "card";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.name?.split(" ")[0] ?? "",
    lastName: user?.name?.split(" ").slice(1).join(" ") ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: "",
    city: "",
    postalCode: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const grandTotal = cartTotalPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent('/checkout')}`);
      return;
    }
    setLoading(true);
    await toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1800)),
      {
        loading: "Traitement de votre commande...",
        success: "Commande passée avec succès !",
        error: "Une erreur est survenue",
      }
    );
    clearCart();
    router.push("/");
    setLoading(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">Votre panier est vide.</p>
        <Link href="/products" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition">
          Retour aux produits
        </Link>
      </div>
    );
  }

  const inputCls =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white disabled:bg-gray-50";

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link href="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 font-bold transition-colors mb-8">
        <FaArrowLeft /> Retour au panier
      </Link>

      <h1 className="text-4xl font-black text-gray-900 mb-10 tracking-tight">Finaliser la commande</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-10">
          {/* GAUCHE — Formulaire */}
          <div className="lg:col-span-2 space-y-6">

            {/* Infos personnelles */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-black text-gray-800 mb-5 flex items-center gap-2">
                <FaUser className="text-orange-500" /> Informations personnelles
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Prénom</label>
                  <input required value={form.firstName} onChange={e => set("firstName", e.target.value)}
                    className={inputCls} placeholder="Jean" disabled={loading} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Nom</label>
                  <input required value={form.lastName} onChange={e => set("lastName", e.target.value)}
                    className={inputCls} placeholder="Dupont" disabled={loading} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Email</label>
                  <input required type="email" value={form.email} onChange={e => set("email", e.target.value)}
                    className={inputCls} placeholder="jean@exemple.com" disabled={loading} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Téléphone</label>
                  <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)}
                    className={inputCls} placeholder="+33 6 00 00 00 00" disabled={loading} />
                </div>
              </div>
            </section>

            {/* Adresse de livraison */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-black text-gray-800 mb-5 flex items-center gap-2">
                <FaMapMarkerAlt className="text-orange-500" /> Adresse de livraison
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Adresse</label>
                  <input required value={form.address} onChange={e => set("address", e.target.value)}
                    className={inputCls} placeholder="12 rue de la Paix" disabled={loading} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Ville</label>
                    <input required value={form.city} onChange={e => set("city", e.target.value)}
                      className={inputCls} placeholder="Paris" disabled={loading} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Code postal</label>
                    <input required value={form.postalCode} onChange={e => set("postalCode", e.target.value)}
                      className={inputCls} placeholder="75001" disabled={loading} />
                  </div>
                </div>
              </div>
            </section>

            {/* Mode de paiement */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-black text-gray-800 mb-5 flex items-center gap-2">
                <FaLock className="text-orange-500" /> Mode de paiement
              </h2>

              <div className="flex items-center gap-3 p-4 border-2 border-orange-500 bg-orange-50 text-orange-700 rounded-xl font-bold text-sm mb-6">
                <FaCreditCard className="text-lg" />
                Carte bancaire
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Numéro de carte</label>
                  <input required value={form.cardNumber}
                    onChange={e => set("cardNumber", e.target.value.replace(/\D/g, "").slice(0, 16))}
                    className={inputCls} placeholder="1234 5678 9012 3456" disabled={loading}
                    maxLength={16} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Date d'expiration</label>
                    <input required value={form.cardExpiry}
                      onChange={e => set("cardExpiry", e.target.value)}
                      className={inputCls} placeholder="MM/AA" disabled={loading} maxLength={5} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">CVC</label>
                    <input required value={form.cardCvc}
                      onChange={e => set("cardCvc", e.target.value.replace(/\D/g, "").slice(0, 3))}
                      className={inputCls} placeholder="123" disabled={loading} maxLength={3} />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* DROITE — Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
              <h2 className="text-xl font-black text-gray-900 mb-5 pb-4 border-b border-gray-100">Récapitulatif</h2>

              {/* Articles */}
              <div className="space-y-3 mb-5">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <img
                      src={buildImageUrl(item.product.images)}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-100 flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; (e.target as HTMLImageElement).onerror = null; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-400">× {item.quantity}</p>
                    </div>
                    <span className="text-sm font-black text-gray-800 whitespace-nowrap">
                      {(item.product.price * item.quantity).toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="space-y-2 text-sm text-gray-600 border-t border-dashed border-gray-200 pt-4 mb-6">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span className="font-bold text-gray-900">{cartTotalPrice.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span className="font-bold text-green-600">Gratuite</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xl font-black text-gray-900">
                  <span>Total</span>
                  <span className="text-orange-600">{grandTotal.toFixed(2)} €</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 text-base rounded-2xl shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FaLock className="text-sm opacity-80" />
                {loading ? "Traitement..." : "CONFIRMER LA COMMANDE"}
              </button>

              <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-4">
                Paiement 100% sécurisé
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
