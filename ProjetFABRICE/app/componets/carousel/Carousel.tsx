// app/components/carousel/Carousel.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Slide {
  type: 'text' | 'image';
  title: string;
  content: string;
  bgColor?: string;
  imageUrl?: string;
  
}

const Carousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<number | null>(null);

  const slides: Slide[] = [
    {
      type: 'text',
      title: 'Trouvez des millions de produits et fournisseurs',
      content: 'Achetez en gros, trouvez des fournisseurs fiables et développez votre entreprise.',
      bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      type: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      title: 'Nouveautés Technologiques',
      content: 'Découvrez les dernières innovations à prix imbattables',
    },
    {
      type: 'text',
      title: 'Livraison Rapide & Sécurisée',
      content: 'Recevez vos commandes en 48h avec notre réseau logistique optimisé',
      bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      type: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      title: 'Mode & Accessoires',
      content: 'Les tendances du moment à petits prix',
    },
    {
      type: 'text',
      title: 'Réductions Exceptionnelles',
      content: 'Jusqu\'à -70% sur une sélection de produits premium',
      bgColor: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
    },
    {
      type: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      title: 'Équipement Professionnel',
      content: 'Tout le matériel pour développer votre business',
    },
    {
      type: 'text',
      title: 'Service Client 24/7',
      content: 'Notre équipe est disponible à tout moment pour vous accompagner',
      bgColor: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)',
    },
    {
      type: 'image',
      imageUrl: "/images/carousel.jpg",
      title: 'Maison & Déco',
      content: 'Créez un intérieur qui vous ressemble',
    },
    {
      type: 'text',
      title: 'Paiement Sécurisé',
      content: 'Transaction cryptée et protection des données garanties',
      bgColor: 'linear-gradient(135deg, #c3cfe2 0%, #c3cfe2 100%)',
    },
    {
      type: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      title: 'High-Tech & Gadgets',
      content: 'Les meilleures marques au meilleur prix',
    },
  ];

  // Auto-play du carrousel
  const startAutoPlay = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (isAutoPlaying) startAutoPlay();
    return () => stopAutoPlay();
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Swipe mobile
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) goToNext();
    if (touchStart - touchEnd < -50) goToPrev();
  };

  return (
    <section
      className="hero-carousel relative w-full max-w-full h-[400px] overflow-hidden rounded-xl shadow-lg mb-8"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 flex items-center justify-center text-center ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          style={{
            background: slide.type === 'image' ? `url(${slide.imageUrl}) center/cover no-repeat` : slide.bgColor,
          }}
        >
          <div className="max-w-xl p-6 bg-transparent">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{slide.title}</h1>
            <p className="text-lg md:text-xl text-white mb-6">{slide.content}</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow-md transition">
              Découvrir maintenant
            </button>
          </div>
        </div>
      ))}

      {/* Boutons navigation */}
      <button
        onClick={goToPrev}
        className="absolute top-1/2 left-4 -translate-y-1/2 text-white bg-black bg-opacity-40 p-2 rounded-full hover:bg-opacity-60 transition z-20"
      >
        <FiChevronLeft size={28} />
      </button>
      <button
        onClick={goToNext}
        className="absolute top-1/2 right-4 -translate-y-1/2 text-white bg-black bg-opacity-40 p-2 rounded-full hover:bg-opacity-60 transition z-20"
      >
        <FiChevronRight size={28} />
      </button>

      {/* Indicateurs */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default Carousel;
