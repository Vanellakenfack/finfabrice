'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProductImageCarousel from '../componets/carousel/ProductImageCarousel';
import { 
  FaShieldAlt, FaHeadset, FaCreditCard, FaShippingFast, 
  FaStar, FaFire, FaTruck, FaArrowRight,
  FaHeart, FaGift
} from 'react-icons/fa';

export default function HomePage() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  // Timer pour les offres flash
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ CORRECTION : IDs synchronisés avec products.tsx
  const flashProducts = [
    { id: 1, img: '/images/art3.jpg', title: 'Smartphone Android 128GB', price: '€189.99', old: '€299.99', discount: '-37%', rating: 4.8, reviews: 2345 },
    { id: 2, img: '/images/art4.jpg', title: 'Montre connectée Pro', price: '€45.50', old: '€89.99', discount: '-49%', rating: 4.6, reviews: 1234 },
    { id: 7, img: '/images/medical1.jpg', title: 'Stéthoscope professionnel', price: '€65.99', old: '€89.99', discount: '-26%', rating: 4.9, reviews: 134 }, // ID 7
    { id: 8, img: '/images/agri1.jpg', title: 'Pulvérisateur manuel 5L', price: '€22.99', old: '€34.99', discount: '-34%', rating: 4.5, reviews: 87 }, // ID 8
    { id: 9, img: '/images/indus1.jpg', title: 'Perceuse à percussion 800W', price: '€89.99', old: '€109.99', discount: '-18%', rating: 4.8, reviews: 220 }, // ID 9
    { id: 3, img: '/images/sante1.jpg', title: 'Tensiomètre électronique', price: '€35.99', old: '€49.99', discount: '-28%', rating: 4.6, reviews: 210 }, // ID 3
  ];

  // ✅ CORRECTION : IDs synchronisés avec products.tsx
  const featuredProducts = [
    { id: 1, img: '/images/art3.jpg', title: 'Smartphone Android 128GB Double SIM', price: '€189.99', old: '€229.99', badge: 'Nouveau', rating: 4.8, seller: 'TechPro', livraison: 'Gratuite' },
    { id: 2, img: '/images/art4.jpg', title: 'Montre connectée étanche', price: '€45.50', old: '€59.99', badge: 'Promo', rating: 4.6, seller: 'SmartWear', livraison: '24h' },
    { id: 3, img: '/images/sante1.jpg', title: 'Tensiomètre électronique', price: '€35.99', badge: 'Meilleure vente', rating: 4.6, seller: 'HealthPro', livraison: 'Gratuite' },
    { id: 4, img: '/images/sante2.jpg', title: 'Balance connectée Bluetooth', price: '€39.99', rating: 4.4, seller: 'FitSmart', livraison: '48h' },
    { id: 5, img: '/images/btp1.jpg', title: 'Casque de sécurité avec visière', price: '€25.00', old: '€32.00', badge: '-22%', rating: 4.3, seller: 'ProBTP', livraison: 'Gratuite' },
    { id: 6, img: '/images/btp2.jpg', title: 'Gilet de sécurité fluorescent', price: '€14.50', rating: 4.7, seller: 'BuildSafe', livraison: '24h' },
    { id: 7, img: '/images/medical1.jpg', title: 'Stéthoscope professionnel', price: '€65.99', old: '€89.99', badge: 'Nouveau', rating: 4.9, seller: 'MedLine', livraison: 'Gratuite' },
    { id: 9, img: '/images/indus1.jpg', title: 'Perceuse à percussion 800W', price: '€89.99', rating: 4.8, seller: 'IndusPro', livraison: '48h' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BANNIÈRE PROMO */}
      <div className="bg-gradient-to-r from-orange-600 to-pink-600 text-white py-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center relative z-10">
          <p className="text-sm font-medium flex items-center gap-2">
            <FaFire className="animate-pulse" />
            🔥 LIVRAISON GRATUITE POUR TOUTE COMMANDE {'>'} 50€
          </p>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">🇫🇷 FR</span>
            <span className="flex items-center gap-1">📦 Retours gratuits</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* CARROUSEL PRINCIPAL */}
        <section className="relative">
          <ProductImageCarousel />
          
          {/* BANNIÈRE FLOTTANTE */}
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-80 bg-white/95 backdrop-blur rounded-xl shadow-2xl p-4 z-10">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FaGift className="text-orange-500" />
              Offre spéciale nouveau client
            </h3>
            <p className="text-sm text-gray-600 mb-2">-20% sur votre première commande</p>
            <button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition">
              Je profite de l'offre
            </button>
          </div>
        </section>

        {/* OFFRES FLASH */}
        <section className="my-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <FaFire className="text-4xl animate-pulse" />
              <h2 className="text-2xl font-bold">Offres Flash</h2>
              <div className="flex gap-2 bg-black/30 rounded-lg p-2">
                <div className="bg-white/20 rounded px-3 py-1 text-center">
                  <span className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-xs block">Heures</span>
                </div>
                <span className="text-2xl font-bold">:</span>
                <div className="bg-white/20 rounded px-3 py-1 text-center">
                  <span className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-xs block">Minutes</span>
                </div>
                <span className="text-2xl font-bold">:</span>
                <div className="bg-white/20 rounded px-3 py-1 text-center">
                  <span className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-xs block">Secondes</span>
                </div>
              </div>
            </div>
            <Link href="/flash-sales" className="flex items-center gap-2 hover:underline">
              Voir toutes les offres <FaArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {flashProducts.map((prod) => (
              <Link href={`/product/${prod.id}`} key={prod.id}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl p-3 text-gray-800 relative group cursor-pointer"
                >
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                    {prod.discount}
                  </span>
                  <div className="relative h-32 mb-2">
                    <Image
                      src={prod.img}
                      alt={prod.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h4 className="font-medium text-sm line-clamp-2">{prod.title}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <FaStar className="text-yellow-400 text-xs" />
                    <span className="text-xs font-bold">{prod.rating}</span>
                    <span className="text-xs text-gray-500">({prod.reviews})</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-lg font-bold text-orange-600">{prod.price}</span>
                    <span className="text-xs text-gray-400 line-through ml-2">{prod.old}</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* BANNIÈRE PROMO */}
        <section className="my-12 relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 py-12 px-6 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Jusqu'à -70% sur l'électronique</h2>
            <p className="text-xl mb-6">Smartphones, tablettes, accessoires et plus encore</p>
            <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:shadow-2xl transform hover:scale-105 transition">
              Découvrir les offres
            </button>
          </div>
        </section>

        {/* PRODUITS POPULAIRES */}
        <section className="my-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <FaFire className="text-orange-500" />
            Produits les plus populaires
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <Link href={`/product/${prod.id}`} key={prod.id}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden group cursor-pointer"
                >
                  <div className="relative h-48 bg-gray-100 p-4">
                    {prod.badge && (
                      <span className={`absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-bold
                        ${prod.badge === 'Nouveau' ? 'bg-green-500 text-white' : 
                          prod.badge === 'Promo' ? 'bg-red-500 text-white' : 
                          'bg-orange-500 text-white'}`}>
                        {prod.badge}
                      </span>
                    )}
                    <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-gray-100">
                      <FaHeart className="text-gray-400 hover:text-red-500" />
                    </button>
                    <Image
                      src={prod.img}
                      alt={prod.title}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`text-xs ${i < Math.floor(prod.rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">({prod.rating})</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-2">{prod.title}</h3>
                    {prod.seller && (
                      <p className="text-xs text-gray-500 mb-2">Vendu par: {prod.seller}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xl font-bold text-orange-600">{prod.price}</span>
                        {prod.old && (
                          <span className="text-xs text-gray-400 line-through ml-2">{prod.old}</span>
                        )}
                      </div>
                      {prod.livraison && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <FaTruck /> {prod.livraison}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* MARQUES PARTENAIRES */}
       
             <section className="my-20 overflow-hidden bg-white py-16 border-y border-gray-100">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-widest">
                    Nos Partenaires Officiels
                  </h2>
                  <div className="w-24 h-1 bg-orange-500 mx-auto mt-4"></div>
                </div>

                <div className="relative flex items-center">
                  {/* Conteneur de l'animation - J'ai augmenté le gap à 20 */}
                  <div className="animate-infinite-scroll flex items-center gap-20 px-8">
                    {[
                      { src: '/images/image/appel.jpg', name: 'Apple' },
                      { src: '/images/image/bmw.jpg', name: 'BMW' },
                      { src: '/images/image/chevrolet.jpg', name: 'Chevrolet' },
                      { src: '/images/image/ferari.jpg', name: 'Ferrari' },
                      { src: '/images/image/gmc.jpg', name: 'GMC' },
                      { src: '/images/image/huawei.jpg', name: 'Huawei' },
                      { src: '/images/image/hyundai.jpg', name: 'Hyundai' },
                      { src: '/images/image/ben.jpg', name: 'Mercedes-Benz' },
                      { src: '/images/image/4fa82dc7e581e242809ccf28da846ab8.jpg', name: 'Partner' },
                      { src: '/images/image/fond.jpg', name: 'Brand' },
                      { src: '/images/image/kia.jpg', name: 'Kia' },
                      { src: '/images/image/land-rover.jpg', name: 'Land Rover' },
                      { src: '/images/image/lg.jpg', name: 'LG' },
                      { src: '/images/image/motorola.jpg', name: 'Motorola' },
                      { src: '/images/image/nokia.jpg', name: 'Nokia' },
                      { src: '/images/image/oppel.jpg', name: 'Opel' },
                      { src: '/images/image/peugeot.jpg', name: 'Peugeot' },
                      { src: '/images/image/porche.jpg', name: 'Porsche' },
                      { src: '/images/image/renault.jpg', name: 'Renault' },
                      { src: '/images/image/sony.jpg', name: 'Sony' },
                      { src: '/images/image/tesla.jpg', name: 'Tesla' },
                      { src: '/images/image/toyota.jpg', name: 'Toyota' },
                      { src: '/images/image/xiomi.jpg', name: 'Xiaomi' },
                      { src: '/images/image/SAMSUNG.jpg', name: 'Samsung' },
                    ].concat([
                      // Répétition identique
                      { src: '/images/image/appel.jpg', name: 'Apple' },
                      { src: '/images/image/bmw.jpg', name: 'BMW' },
                      { src: '/images/image/chevrolet.jpg', name: 'Chevrolet' },
                      { src: '/images/image/ferari.jpg', name: 'Ferrari' },
                      { src: '/images/image/gmc.jpg', name: 'GMC' },
                      { src: '/images/image/huawei.jpg', name: 'Huawei' },
                      { src: '/images/image/hyundai.jpg', name: 'Hyundai' },
                      { src: '/images/image/ben.jpg', name: 'Mercedes-Benz' },
                      { src: '/images/image/4fa82dc7e581e242809ccf28da846ab8.jpg', name: 'Partner' },
                      { src: '/images/image/fond.jpg', name: 'Brand' },
                      { src: '/images/image/kia.jpg', name: 'Kia' },
                      { src: '/images/image/land-rover.jpg', name: 'Land Rover' },
                      { src: '/images/image/lg.jpg', name: 'LG' },
                      { src: '/images/image/motorola.jpg', name: 'Motorola' },
                      { src: '/images/image/nokia.jpg', name: 'Nokia' },
                      { src: '/images/image/oppel.jpg', name: 'Opel' },
                      { src: '/images/image/peugeot.jpg', name: 'Peugeot' },
                      { src: '/images/image/porche.jpg', name: 'Porsche' },
                      { src: '/images/image/renault.jpg', name: 'Renault' },
                      { src: '/images/image/sony.jpg', name: 'Sony' },
                      { src: '/images/image/tesla.jpg', name: 'Tesla' },
                      { src: '/images/image/toyota.jpg', name: 'Toyota' },
                      { src: '/images/image/xiomi.jpg', name: 'Xiaomi' },
                      { src: '/images/image/SAMSUNG.jpg', name: 'Samsung' },
                    ]).map((brand, index) => (
                      <div
                        key={index}
                        className="w-56 h-28 flex-shrink-0 flex items-center justify-center group"
                      >
                        <Image
                          src={brand.src}
                          alt={brand.name}
                          width={200}
                          height={100}
                          className="object-contain max-h-20 grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 group-hover:opacity-100"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Gradients de finition plus larges pour correspondre à la taille des logos */}
                  <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-white to-transparent z-10"></div>
                  <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-white to-transparent z-10"></div>
                </div>
              </section>
              
             

        {/* NEWSLETTER */}
        <section className="my-12 bg-gray-800 rounded-2xl p-8 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-2">Restez informé</h2>
            <p className="text-gray-300 mb-6">Recevez nos meilleures offres en avant-première</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg font-semibold transition">
                S'inscrire
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              En vous inscrivant, vous acceptez de recevoir nos newsletters. Vous pouvez vous désabonner à tout moment.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

const ServiceCard = ({ icon, title, text, color }: { icon: React.ReactNode; title: string; text: string; color: string }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer"
  >
    <div className={`bg-gradient-to-br ${color} w-14 h-14 flex justify-center items-center rounded-2xl text-white text-2xl`}>
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-gray-800">{title}</h3>
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  </motion.div>
);