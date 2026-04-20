// Navbar.tsx
'use client'; 

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../Data';
import { logout } from '../../Data/slices/authSlice';
import { authService } from '../../../services/auth.service';
// Importation de FaShoppingCart pour l'icône du panier
import { FaUser, FaSearch, FaShoppingCart, FaChevronDown, FaSignOutAlt, FaUserCircle } from 'react-icons/fa'; 

// Importation du hook personnalisé pour accéder à l'état du panier
import { useCart } from '../../Context/CartContext'; 

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Récupérer l'état d'authentification depuis Redux
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  
  // Récupérer la quantité totale d'articles dans le panier
  const { cartTotalQuantity } = useCart();

  // Fermer le menu utilisateur quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logout());
      router.push('/');
      setShowUserMenu(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

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

            {/* Menu utilisateur ou bouton de connexion */}
            {isAuthenticated && user ? (
              <div className="relative user-menu">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md transition"
                >
                  <FaUserCircle className="text-lg" />
                  <span className="hidden sm:inline font-medium">{user.name}</span>
                  <FaChevronDown className="text-sm" />
                </button>
                
                {/* Menu déroulant utilisateur */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                        Connecté en tant que {user.name}
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaUserCircle />
                        Mon profil
                      </Link>
                      {user.roles?.includes('admin') && (
                        <Link
                          href="/Dashbord"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaUser />
                          Administration
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <FaSignOutAlt />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
              >
                <FaUser /> <span className="hidden sm:inline">Connexion</span>
              </Link>
            )}

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
            {/* Informations utilisateur en mobile */}
            {isAuthenticated && user && (
              <li className="border-b bg-gray-50 px-5 py-3">
                <div className="flex items-center gap-2">
                  <FaUserCircle className="text-gray-600" />
                  <span className="font-medium text-gray-800">{user.name}</span>
                </div>
                {user.roles?.includes('admin') && (
                  <span className="text-xs text-orange-600 font-medium">Administrateur</span>
                )}
              </li>
            )}
            
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
            
            {/* Menu conditionnel selon l'état de connexion */}
            {isAuthenticated && user ? (
              <>
                {user.roles?.includes('admin') && (
                  <li className="border-t">
                    <Link href="/Dashbord" className="block px-5 py-3 hover:bg-orange-50">
                      🛠️ Administration
                    </Link>
                  </li>
                )}
                <li className="border-t">
                  <Link href="/profile" className="block px-5 py-3 hover:bg-orange-50">
                    👤 Mon profil
                  </Link>
                </li>
                <li className="border-t">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 hover:bg-red-50 text-red-600"
                  >
                    🚪 Déconnexion
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="border-t">
                  <Link href="/login" className="block px-5 py-3 hover:bg-orange-50">
                    🔐 Connexion
                  </Link>
                </li>
                <li className="border-t">
                  <Link href="/register" className="block px-5 py-3 hover:bg-orange-50">
                    📝 Inscription
                  </Link>
                </li>
              </>
            )}
            
            <li className="border-t">
              <Link href="/Contact" className="block px-5 py-3 hover:bg-orange-50">
                📞 Contact
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}