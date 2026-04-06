'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaSearch, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../Context/CartContext';
import { allProducts, Product } from '../../Data/products';

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartTotalQuantity } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  /* Responsive */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* Scroll animation */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Search suggestions */
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      return;
    }
    const filtered = allProducts.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 5));
  }, [searchTerm]);

  return (
    <header className="fixed top-0 w-full z-50">
      {/* GRADIENT ANIMÉ */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-purple-500/10 animate-gradient-x pointer-events-none" />

      {/* BARRE SUP */}
      <div className="bg-neutral-900 text-orange-500 text-sm py-2 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-end gap-5 px-4">
          <a href="#" className="hover:text-white transition">Aide</a>
          <a href="#" className="hover:text-white transition">Rejoignez-nous</a>
          <Link href="/login" className="hover:text-white transition">Mode Fournisseur</Link>
        </div>
      </div>

      {/* NAVBAR */}
      <nav
        className={`
          relative z-10 bg-white/90 backdrop-blur
          transition-all duration-300
          ${scrolled ? 'shadow-lg py-2' : 'shadow-md py-4'}
        `}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4">

          {/* LOGO GRAND + SCROLL */}
          <Link
            href="/"
            className={`
              flex items-center justify-center
              rounded-full bg-white
              border border-gray-200
              overflow-hidden
              transition-all duration-300
              ${scrolled ? 'w-14 h-14' : 'w-20 h-20'}
              hover:shadow-xl hover:ring-2 hover:ring-orange-400
            `}
          >
            <Image
              src="/logo.jpeg"
              alt="EliteShop"
              width={80}
              height={80}
              priority
              sizes="80px"
              className="object-cover transition-transform duration-500 hover:scale-110"
            />
          </Link>

          {/* MENU DESKTOP */}
          {!isMobile && (
            <ul className="flex items-center gap-6 font-medium">
              <li><Link href="/" className="hover:text-orange-500">Accueil</Link></li>
              <li><Link href="/products" className="hover:text-orange-500">Nos produits</Link></li>
              <li><Link href="/login" className="hover:text-orange-500">Acheteurs</Link></li>
              <li><Link href="/login" className="hover:text-orange-500">Fournisseurs</Link></li>
              <li><Link href="/Contact" className="hover:text-orange-500">Contact</Link></li>
            </ul>
          )}

          {/* RECHERCHE DESKTOP */}
          {!isMobile && (
            <div className="relative w-[420px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Rechercher produits, marques, fournisseurs..."
                className="w-full py-3 pl-5 pr-16 bg-gray-100 border rounded-full focus:ring-2 focus:ring-orange-500"
                autoComplete="off"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full">
                <FaSearch />
              </button>
              {suggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 bg-white border rounded-md mt-1 max-h-60 overflow-auto z-20">
                  {suggestions.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/product/${p.id}`}
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                          setSearchTerm('');
                          setSuggestions([]);
                        }}
                      >
                        {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex items-center gap-2">
            <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100">
              <FaShoppingCart className="text-2xl" />
              {cartTotalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                  {cartTotalQuantity}
                </span>
              )}
            </Link>

            {!isMobile && (
              <Link href="/login" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
                <FaUser /> Connexion
              </Link>
            )}

            {/* BURGER */}
            {isMobile && (
              <button onClick={() => setShowMobileMenu(true)} className="text-2xl">
                ☰
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE AMAZON STYLE */}
      {isMobile && showMobileMenu && (
        <div className="fixed inset-0 bg-white z-[60] animate-slide-in">
          <div className="p-4 border-b flex flex-col gap-3 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Rechercher sur EliteShop"
              className="flex-1 py-3 px-4 bg-gray-100 rounded-full"
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 bg-white border rounded-md mt-1 max-h-60 overflow-auto z-20">
                {suggestions.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/product/${p.id}`}
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setSearchTerm('');
                        setSuggestions([]);
                        setShowMobileMenu(false);
                      }}
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setShowMobileMenu(false)} className="text-xl">✕</button>
          </div>

          <ul className="flex flex-col divide-y">
            {['Accueil','Nos produits','Acheteurs','Fournisseurs','Contact'].map((item) => (
              <li key={item}>
                <Link
                  href={item === 'Accueil' ? '/' : `/${item.replace(' ', '')}`}
                  className="block px-6 py-5 text-lg font-medium hover:bg-orange-50"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
