'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductImageCarousel from './componets/carousel/ProductImageCarousel';
import { FaShieldAlt, FaHeadset, FaCreditCard, FaShippingFast } from 'react-icons/fa';
import { productService } from './../services/productService';

export default function HomePage() {
  const categories = [
    { img: '/images/art11.jpg', label: 'Électronique' },
    { img: '/images/art10.jpg', label: 'Vêtements' },
    { img: '/images/art13.jpg', label: 'Machines' },
    { img: '/images/art12.jpg', label: 'Maison & Jardin' },
    { img: '/images/art9.jpg', label: 'Beauté' },
    { img: '/images/art14.jpg', label: 'Sports' },
    { img: '/images/art15.jpg', label: 'Automobile' },
    { img: '/images/art16.jpg', label: 'Santé' },
    { img: '/images/art22.jpg', label: 'Bébés & Enfants' },
    { img: '/images/art3.jpg', label: 'Toutes catégories' },
  ];

  // État pour les produits de l'API
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les produits depuis l'API
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);
        const productsData = await productService.getAll();
        // Limiter à 4 produits pour la section phares
        setProducts(Array.isArray(productsData) ? productsData.slice(0, 4) : []);
      } catch (err: any) {
        console.error('Erreur chargement produits:', err);
        setError(err.response?.data?.message || 'Impossible de charger les produits');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      {/* --- Carrousel --- */}
      <ProductImageCarousel />

      {/* --- Catégories --- */}
      <section className="py-12">
        <h2 className="text-center text-2xl font-bold mb-8 text-gray-800 relative after:absolute after:w-20 after:h-[3px] after:bg-gradient-to-r after:from-blue-600 after:to-orange-500 after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2">
          Nos catégories de produits populaires
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-1 flex flex-col items-center text-center p-4"
            >
              <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-orange-500/20 hover:ring-orange-500 transition-all">
                <Image
                  src={cat.img}
                  alt={cat.label}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <h3 className="font-semibold text-gray-700 mt-3">{cat.label}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* --- Produits phares --- */}
      <section className="py-12">
        <h2 className="text-center text-2xl font-bold mb-8 text-gray-800 relative after:absolute after:w-20 after:h-[3px] after:bg-gradient-to-r after:from-blue-600 after:to-orange-500 after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2">
          Produits phares
        </h2>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Chargement des produits...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
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

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((prod) => (
                <div key={prod.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all block overflow-hidden group relative">
                  <Link href={`/product/${prod.id}`}>
                    <div className="relative h-56 bg-gray-100 flex justify-center items-center">
                      {prod.label && prod.label !== 'Aucun' && (
                        <span className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-md text-xs font-semibold">
                          {prod.label}
                        </span>
                      )}
                      {prod.images ? (
                        <img
                          src={prod.images.startsWith('http') ? prod.images : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/images${prod.images.replace('/storage', '')}`}
                          alt={prod.name}
                          className="object-cover h-44 w-full transition-transform group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-44 flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400">Pas d'image</span>
                        </div>
                      )}
                      <span className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-bold">
                        {prod.price ? `${prod.price.toFixed(2)}€` : '0.00€'}
                      </span>
                    </div>
                  </Link>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">{prod.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Vendu par: {prod.seller?.name || 'Inconnu'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                Aucun produit disponible
              </div>
            )}
          </div>
        )}
      </section>

      {/* --- Services --- */}
      <section className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 py-10 border-t border-gray-200">
        <ServiceCard icon={<FaShieldAlt className="text-white text-xl" />} title="Protection d'acheteur" text="Remboursement si non reçu" />
        <ServiceCard icon={<FaHeadset className="text-white text-xl" />} title="Assistance client" text="24h/7j assistance" />
        <ServiceCard icon={<FaCreditCard className="text-white text-xl" />} title="Paiement sécurisé" text="Méthodes de paiement variées" />
        <ServiceCard icon={<FaShippingFast className="text-white text-xl" />} title="Logistique mondiale" text="Expédition dans le monde entier" />
      </section>
    </main>
  );
}

const ServiceCard = ({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) => (
  <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition">
    <div className="bg-gradient-to-br from-blue-600 to-orange-500 w-12 h-12 flex justify-center items-center rounded-full">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      <p className="text-gray-500 text-xs">{text}</p>
    </div>
  </div>
);
