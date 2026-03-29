'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductImageCarousel from '../componets/carousel/ProductImageCarousel';
import { FaShieldAlt, FaHeadset, FaCreditCard, FaShippingFast } from 'react-icons/fa';

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

  const products = [
    { id: 1, img: '/images/art3.jpg', title: 'Smartphone Android 128GB Double SIM', price: '€189.99', old: '€229.99', badge: 'Nouveau' },
    { id: 2, img: '/images/art4.jpg', title: 'Montre connectée étanche', price: '€45.50', old: '€59.99', badge: 'Promo' },
    { id: 3, img: '/images/art31.jpg', title: 'Casque Bluetooth sans fil', price: '€32.99' },
    { id: 4, img: '/images/art30.jpg', title: 'Sac à dos professionnel 15.6"', price: '€28.75', badge: 'Meilleure vente' },
  ];

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

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((prod) => (
            <Link
              key={prod.id}
              href={`/product/${prod.id}`}
              className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="relative h-56 bg-gray-100 flex justify-center items-center">
                {prod.badge && (
                  <span className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-md text-xs font-semibold">
                    {prod.badge}
                  </span>
                )}
                <Image
                  src={prod.img}
                  alt={prod.title}
                  width={250}
                  height={200}
                  className="object-contain h-44"
                />
                <span className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-bold">
                  {prod.price}
                </span>
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-gray-800 text-sm">{prod.title}</h3>
              </div>
            </Link>
          ))}
        </div>
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
