'use client';

import React from 'react';
import Link from 'next/link';
import {
  FaFacebookF,
  FaTiktok,
  FaLinkedinIn,
  FaInstagram,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaCcApplePay,
  FaCcAmazonPay,
  FaCcStripe,
  FaPaperPlane
} from 'react-icons/fa';

// Animation CSS pour le soulignement des liens au survol
const animationStyles = `
  .hover-underline-animation {
    position: relative;
    padding-bottom: 2px;
  }
  .hover-underline-animation::after {
    content: '';
    position: absolute;
    width: 100%;
    transform: scaleX(0);
    height: 1.5px;
    bottom: 0;
    left: 0;
    background-color: #f97316;
    transform-origin: bottom right;
    transition: transform 0.3s ease-out;
  }
  .hover-underline-animation:hover::after {
    transform: scaleX(1);
    transform-origin: bottom left;
  }
`;

const Footer: React.FC = () => {
  const brandName = "Prime World STORE";

  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-800">
      <style>{animationStyles}</style>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* --- Colonne 1 : Présentation & Réseaux Sociaux --- */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-white text-2xl font-extrabold tracking-tighter transition-colors group-hover:text-orange-400">
              {brandName}<span className="text-orange-500">.</span>
            </span>
          </Link>
          
          <p className="text-sm leading-relaxed text-neutral-400">
            Votre destination premium pour des produits d'exception et des partenaires d'affaires de confiance.
          </p>

          <div className="flex gap-5 mt-3 text-lg">
            {[
              { 
                href: "https://www.facebook.com/profile.php?id=61588543877180", 
                icon: FaFacebookF, 
                label: "Facebook" 
              },
              { 
                href: "https://www.tiktok.com/@primeworld.store?_r=1&_t=ZS-94yeAe8EMg1", 
                icon: FaTiktok, 
                label: "TikTok" 
              },
              { 
                href: "#", 
                icon: FaLinkedinIn, 
                label: "LinkedIn" 
              },
              { 
                href: "https://www.instagram.com/primeworld_store?igsh=MTdhN2c1ZmpwZHR5bA==", 
                icon: FaInstagram, 
                label: "Instagram" 
              },
            ].map((social, index) => (
              <a 
                key={index}
                href={social.href} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={`Suivez-nous sur ${social.label}`}
                className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-orange-500 hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-md"
              >
                <social.icon />
              </a>
            ))}
          </div>
        </div>

        {/* --- Colonne 2 : Navigation --- */}
        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-6 pb-2 border-b border-neutral-800 inline-block">
            Navigation
          </h4>
          <nav aria-label="Navigation du footer">
            <ul className="space-y-3.5 text-sm">
              <li><Link href="/" className="hover-underline-animation hover:text-white transition">Accueil</Link></li>
              <li><Link href="/products" className="hover-underline-animation hover:text-white transition">Nos Produits</Link></li>
              <li><Link href="/login" className="hover-underline-animation hover:text-white transition">Espace Acheteur</Link></li>
              <li><Link href="/login" className="hover-underline-animation hover:text-white transition">Espace Fournisseur</Link></li>
              <li><Link href="/Contact" className="hover-underline-animation hover:text-white transition">Contact</Link></li>
            </ul>
          </nav>
        </div>

        {/* --- Colonne 3 : Aide & Légal --- */}
        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-6 pb-2 border-b border-neutral-800 inline-block">
            Aide & Légal
          </h4>
          <ul className="space-y-3.5 text-sm">
            <li><Link href="#" className="hover-underline-animation hover:text-white transition">Centre d'aide</Link></li>
            <li><Link href="/privacy" className="hover-underline-animation hover:text-white transition">Confidentialité</Link></li>
            <li><Link href="/terms" className="hover-underline-animation hover:text-white transition">Conditions d'utilisation</Link></li>
          </ul>
        </div>

        {/* --- Colonne 4 : Newsletter --- */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-6 pb-2 border-b border-neutral-800 inline-block">
            Newsletter
          </h4>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Inscrivez-vous pour recevoir les dernières offres et nouvelles.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-stretch mt-2 rounded-full overflow-hidden border border-neutral-700 focus-within:ring-2 focus-within:ring-orange-500/50 transition-shadow duration-300"
          >
            <input
              type="email"
              placeholder="Votre email"
              required
              className="flex-1 px-5 py-3 text-sm text-white outline-none bg-neutral-800 placeholder:text-neutral-500"
              aria-label="Adresse email"
            />
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-3 transition-colors flex items-center gap-2 group"
            >
              <span className="text-sm font-semibold">S'inscrire</span>
              <FaPaperPlane className="text-xs transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* --- Bas du footer : Paiements & Copyright --- */}
      <div className="border-t border-neutral-800 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex flex-wrap justify-center gap-5 text-3xl text-neutral-600">
            {[
              { icon: FaCcVisa, color: "hover:text-[#1a1f71]", label: "Visa" },
              { icon: FaCcMastercard, color: "hover:text-[#eb001b]", label: "Mastercard" },
              { icon: FaCcPaypal, color: "hover:text-[#003087]", label: "PayPal" },
              { icon: FaCcApplePay, color: "hover:text-white", label: "Apple Pay" },
              { icon: FaCcAmazonPay, color: "hover:text-[#ff9900]", label: "Amazon Pay" },
              { icon: FaCcStripe, color: "hover:text-[#6772e5]", label: "Stripe" },
            ].map((pay, index) => (
              <pay.icon 
                key={index} 
                className={`transition-colors duration-300 ${pay.color}`} 
                title={pay.label} 
                aria-label={pay.label} 
              />
            ))}
          </div>

          <div className="text-center sm:text-right">
            <p className="text-xs text-neutral-500">
              © {new Date().getFullYear()} <span className="font-semibold text-neutral-400">{brandName} Global</span>. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;