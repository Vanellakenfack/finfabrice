'use client';

import React from 'react';
import Link from 'next/link';
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaCcApplePay,
  FaCcAmazonPay,
  FaCcStripe
} from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* --- Colonne 1 : Présentation --- */}
        <div>
          <h4 className="text-white text-lg font-semibold mb-3">Shopping Line</h4>
          <p className="text-sm mb-4">
            Le meilleur endroit pour trouver des produits et fournisseurs fiables.
          </p>

          <nav aria-label="Navigation principale"> {/* Ajout d'un aria-label */}
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-orange-500 transition">Accueil</Link></li>
              <li><Link href="/categories" className="hover:text-orange-500 transition">Catégories de produit</Link></li>
              <li><Link href="/acheteur" className="hover:text-orange-500 transition">Espace Acheteur</Link></li> {/* Amélioration du texte du lien */}
              <li><Link href="/fournisseur" className="hover:text-orange-500 transition">Espace Fournisseur</Link></li> {/* Amélioration du texte du lien */}
              <li><Link href="/contact" className="hover:text-orange-500 transition">Contactez-nous</Link></li> {/* Amélioration du texte du lien */}
            </ul>
          </nav>

          <div className="flex gap-4 mt-4 text-xl">
            <Link href="#" aria-label="Notre page Facebook" className="hover:text-orange-500"><FaFacebook /></Link> {/* aria-label plus précis */}
            <Link href="#" aria-label="Notre fil Twitter" className="hover:text-orange-500"><FaTwitter /></Link> {/* aria-label plus précis */}
            <Link href="#" aria-label="Notre page LinkedIn" className="hover:text-orange-500"><FaLinkedin /></Link> {/* aria-label plus précis */}
            <Link href="#" aria-label="Notre galerie Instagram" className="hover:text-orange-500"><FaInstagram /></Link> {/* aria-label plus précis */}
          </div>
        </div>

        {/* --- Colonne 2 : Paiements --- */}
        <div>
          <h5 className="text-white text-base font-semibold mb-4 border-b border-gray-700 pb-2">
            Moyens de paiement
          </h5>
          <div className="flex flex-wrap gap-4 text-3xl mt-3">
            <FaCcVisa className="text-[#1a1f71]" title="Visa" aria-label="Visa" /> {/* Ajout d'un aria-label */}
            <FaCcMastercard className="text-[#eb001b]" title="Mastercard" aria-label="Mastercard" /> {/* Ajout d'un aria-label */}
            <FaCcPaypal className="text-[#003087]" title="PayPal" aria-label="PayPal" /> {/* Ajout d'un aria-label */}
            <FaCcApplePay className="text-black" title="Apple Pay" aria-label="Apple Pay" /> {/* Ajout d'un aria-label */}
            <FaCcAmazonPay className="text-[#ff9900]" title="Amazon Pay" aria-label="Amazon Pay" /> {/* Ajout d'un aria-label */}
            <FaCcStripe className="text-[#6772e5]" title="Stripe" aria-label="Stripe" /> {/* Ajout d'un aria-label */}
          </div>
        </div>

        {/* --- Colonne 3 : Support --- */}
        <div>
          <h4 className="text-white text-lg font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-orange-500 transition">Centre d'aide</Link></li>
            <li><Link href="/contact" className="hover:text-orange-500 transition">Contactez-nous</Link></li> {/* Lien direct vers la page de contact */}
            <li><Link href="/privacy" className="hover:text-orange-500 transition">Politique de confidentialité</Link></li> {/* Ajout d'un lien vers la politique de confidentialité */}
            <li><Link href="/terms" className="hover:text-orange-500 transition">Conditions d'utilisation</Link></li> {/* Ajout d'un lien vers les conditions d'utilisation */}
          </ul>
        </div>

        {/* --- Colonne 4 : Newsletter --- */}
        <div>
          <h4 className="text-white text-lg font-semibold mb-3">Newsletter</h4>
          <p className="text-sm mb-3">
            Inscrivez-vous pour recevoir les dernières offres et nouvelles.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row sm:items-stretch gap-2"
          >
            <input
              type="email"
              placeholder="Votre email"
              required
              className="flex-1 px-3 py-2 rounded-md text-gray-800 outline-none focus:ring-2 focus:ring-orange-500 bg-gray-100"
              aria-label="Adresse email" // Ajout d'un aria-label
            />
          </form>
           <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-md transition sm:h-auto mt-2"
            >
              S'inscrire
            </button>
        </div>
      </div>

      {/* --- Bas du footer --- */}
      <div className="border-t border-gray-700 text-center py-4 text-xs text-gray-400">
        © {new Date().getFullYear()} Shopping Line. Tous droits réservés.
      </div>
    </footer>
  );
};

export default Footer;