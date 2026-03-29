// Navbar.tsx
'use client'; 

import { useState, useEffect } from 'react';
import Link from 'next/link';
// Importation de FaShoppingCart pour l'icône du panier
import { FaUser, FaSearch, FaShoppingCart } from 'react-icons/fa'; 

// Importation du hook personnalisé pour accéder à l'état du panier
import { useCart } from '../../Context/CartContext'; 

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Récupérer la quantité totale d'articles dans le panier
  const { cartTotalQuantity } = useCart();

  // ✅ Gérer la détection de la taille d’écran
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative z-50">
      {/* --- Barre supérieure --- */}
      <div className="bg-neutral-900 text-orange-500 text-sm py-2">
        <div className="max-w-7xl mx-auto flex justify-end gap-5 px-4">
          <a href="#" className="hover:text-white transition">Aide</a>
          <a href="#" className="hover:text-white transition">Rejoignez-nous</a>
          <Link href="/login" className="hover:text-white transition">Mode Fournisseur</Link>
        </div>
      </div>

      {/* --- Barre principale --- */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-orange-500">
            MaSociété
          </Link>

          {/* --- Menu Desktop --- */}
          {!isMobile && (
            <ul className="flex items-center space-x-6 font-medium">
              <li>
                <Link href="/" className="hover:text-orange-500 transition">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-orange-500 transition">
                  Nos produits
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-orange-500 transition">
                  Acheteurs
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-orange-500 transition">
                  Fournisseurs
                </Link>
              </li>
              <li>
                <Link href="/Contact" className="hover:text-orange-500 transition">
                  Contact
                </Link>
              </li>
            </ul>
          )}

          {/* --- Barre de recherche (desktop) --- */}
          {!isMobile && (
            <div className="relative w-96">
              <input
                type="text"
                placeholder="🔍 Rechercher des produits, fournisseurs..."
                className="w-full py-2.5 pl-4 pr-16 text-gray-800 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-300"
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full flex items-center justify-center shadow-md transition"
              >
                <FaSearch />
              </button>
            </div>
          )}

          {/* --- Boutons à droite --- */}
          <div className="flex items-center gap-2">
            
            {/* Lien vers le panier avec l'icône et le badge de quantité */}
            <Link
              href="/cart"
              className="relative p-2 rounded-full text-gray-700 hover:bg-gray-100 transition"
              aria-label={`Panier (${cartTotalQuantity} articles)`}
            >
              <FaShoppingCart className="text-2xl" />
              {/* Afficher le badge si la quantité est > 0 */}
              {cartTotalQuantity > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {cartTotalQuantity}
                </span>
              )}
            </Link>

            <Link
              href="/login"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
            >
              <FaUser /> <span className="hidden sm:inline">Connexion</span>
            </Link>

            {/* --- Bouton menu mobile --- */}
            {isMobile && (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-2xl text-gray-800 focus:outline-none"
              >
                ☰
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* --- Menu Mobile --- */}
      {isMobile && showMobileMenu && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md border-t">
          <ul className="flex flex-col">
            <li>
              <Link href="/" className="block px-5 py-3 hover:bg-orange-50">
                Accueil
              </Link>
            </li>
            <li className="border-t">
              <Link href="/products" className="block px-5 py-3 hover:bg-orange-50">
                Nos produits
              </Link>
            </li>
            <li className="border-t">
              <Link href="/Acheteur" className="block px-5 py-3 hover:bg-orange-50">
                Acheteurs
              </Link>
            </li>
            <li className="border-t">
              <Link href="/fournisseur" className="block px-5 py-3 hover:bg-orange-50">
                Fournisseurs
              </Link>
            </li>
            <li className="border-t">
              <Link href="/Contact" className="block px-5 py-3 hover:bg-orange-50">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}