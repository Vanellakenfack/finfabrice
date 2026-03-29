"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "../Data/products";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService"; 
import Carousel from "../componets/carousel/Carousel";
import { useCart } from "../Context/CartContext";
import Navbar from "../componets/nav/Navbar";

const ProductsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("Tous");
  const [dynamicProducts, setDynamicProducts] = useState<Product[]>([]);
  
  // ÉTAT POUR LES CATÉGORIES DYNAMIQUES (Initialisé avec "Tous")
  const [availableCategories, setAvailableCategories] = useState<string[]>(["Tous"]);
  
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    // Charger les produits et catégories depuis l'API
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        // 1. CHARGEMENT DES PRODUITS DEPUIS L'API
        const productsData = await productService.getAll();
        console.log('Produits reçus:', productsData);
        setDynamicProducts(Array.isArray(productsData) ? productsData : []);
        
        // 2. CHARGEMENT DES CATÉGORIES DEPUIS L'API
        const categoriesData = await categoryService.getAll();
        console.log('Catégories reçues:', categoriesData);
        
        if (categoriesData && categoriesData.length > 0) {
          const categoryNames = categoriesData.map((cat: any) => cat.name);
          setAvailableCategories(["Tous", ...categoryNames]);
        }
      } catch (err: any) {
        console.error('Erreur chargement données:', err);
        setError(err.response?.data?.message || 'Impossible de charger les produits. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  const showNotification = (productName: string) => {
    setNotification(`${productName} ajouté au panier !`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Fonction pour ignorer les accents et les majuscules lors du filtrage
  const normalize = (str: string) => 
    str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
  
  // Filtrer les produits par catégorie
  const filteredProducts = activeCategory === "Tous" 
    ? dynamicProducts 
    : dynamicProducts.filter((p: any) => {
        // Gérer les deux cas: category comme objet ou comme string
        const productCategory = typeof p.category === 'object' ? p.category?.name : p.category;
        return normalize(productCategory) === normalize(activeCategory);
      });

  return (
    <>
      <Navbar />
      <Carousel />

      {/* Notification flottante */}
      {notification && (
        <div className="fixed top-24 right-5 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl animate-bounce border border-orange-500 font-bold text-sm">
          {notification}
        </div>
      )}

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* 👉 BARRE DE FILTRES DYNAMIQUE */}
          <div className="flex gap-2 mb-10 overflow-x-auto pb-2 no-scrollbar">
            {availableCategories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)} 
                className={`px-5 py-2 rounded-full text-sm font-bold border transition-all whitespace-nowrap ${
                  activeCategory === cat 
                  ? "bg-orange-500 text-white border-orange-500 shadow-md" 
                  : "bg-white border-gray-200 text-gray-600 hover:border-orange-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ÉTAT DE CHARGEMENT */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Chargement des produits...</p>
            </div>
          )}

          {/* MESSAGE D'ERREUR */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md mx-auto">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* GRILLE DES PRODUITS */}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product: any) => (
                  <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all block overflow-hidden border border-gray-100 group relative">
                    
                    <Link href={`/product/${product.id}`}>
                      <div className="h-56 relative bg-white p-4">
                        {product.label && product.label !== "Aucun" && (
                          <span className={`absolute top-3 left-3 z-10 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                            product.label === 'Nouveau' ? 'bg-green-500' : 
                            product.label === 'Promo' ? 'bg-red-500' : 'bg-orange-500'
                          }`}>
                            {product.label}
                          </span>
                        )}
                        {/* Affichage de l'image */}
                        <div className="w-full h-full flex items-center justify-center rounded-2xl">
                          {product.images && typeof product.images === 'string' ? (
                            <>
                              {(() => {
                                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
                                // Utiliser la route API /api/v1/images/ au lieu de /storage/
                                const imageUrl = product.images.startsWith('http') 
                                  ? product.images 
                                  : `${apiUrl}/images${product.images.replace('/storage', '')}`;
                                console.log('URL image construite:', imageUrl);
                                return (
                                  <img 
                                    src={imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    onError={(e) => {
                                      console.error('Erreur chargement image:', product.images, 'URL:', (e.target as HTMLImageElement).src);
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                );
                              })()}
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <span className="text-gray-400 text-sm">Pas d'image</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="p-4 space-y-1.5">
                      <div className="flex items-center gap-0.5 text-yellow-400 text-[10px]">
                        {"★".repeat(Math.floor(product.rating || 5)) + "☆".repeat(5 - Math.floor(product.rating || 5))}
                      </div>
                      
                      <Link href={`/product/${product.id}`}>
                        <h3 className="font-bold text-gray-800 text-sm line-clamp-2 h-10 leading-snug hover:text-orange-600 cursor-pointer">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="text-[10px] text-gray-400">Vendu par: {product.seller?.name || product.brand || 'Inconnu'}</p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-orange-600 font-black text-lg">
                          {product.price ? product.price.toFixed(2) : "0.00"}€
                        </span>
                        <div className="text-[10px] text-green-600 font-bold italic">
                          🚚 {product.shipping || "Gratuit"}
                        </div>
                      </div>

                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          if ((product.quantity || product.stock) > 0) {
                            addToCart(product);
                            showNotification(product.name);
                          }
                        }}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs mt-2 transition-all ${
                          (product.quantity || product.stock) > 0 
                          ? "bg-indigo-900 text-white hover:bg-orange-600" 
                          : "bg-indigo-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {(product.quantity || product.stock) > 0 ? "Ajouter au panier" : "Rupture de stock"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 text-gray-400">
                  Aucun produit trouvé dans cette catégorie.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ProductsSection;