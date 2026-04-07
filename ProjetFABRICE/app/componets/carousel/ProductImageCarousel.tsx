'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight, FiZoomIn, FiExternalLink } from 'react-icons/fi';

type ProductImageCarouselProps = {
  images?: string[];           // si non fourni, on utilisera defaultImages
  autoSlide?: boolean;
  slideInterval?: number;      // ms
};

const defaultImages = [
  '/images/art1.jpg',
  '/images/art2.jpg',
  '/images/art3.jpg',
  '/images/art4.jpg',
  '/images/art5.png',
  '/images/art6.jpg',
  '/images/art7.jpg',
    '/images/art8.jpg',
];

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({
  images = defaultImages,
  autoSlide = true,
  slideInterval = 5000,
}) => {
  const [current, setCurrent] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const prevSlide = () => setCurrent((p) => (p === 0 ? images.length - 1 : p - 1));
  const nextSlide = () => setCurrent((p) => (p === images.length - 1 ? 0 : p + 1));

  // calculer la position du zoom en % (clientX utilisé pour meilleure compatibilité)
  const handleZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.nativeEvent as MouseEvent).clientX - rect.left) / rect.width * 100;
    const y = ((e.nativeEvent as MouseEvent).clientY - rect.top) / rect.height * 100;
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  // auto rotation
  useEffect(() => {
    if (!autoSlide || images.length <= 1) return;
    const t = setInterval(nextSlide, slideInterval);
    return () => clearInterval(t);
  }, [current, autoSlide, slideInterval, images.length]);

  return (
    <div className="flex flex-col items-center max-w-5xl w-full mx-auto bg-white rounded-2xl shadow-lg p-4">
      {/* Carrousel principal */}
      <div className="relative w-full h-[420px] overflow-hidden rounded-xl bg-gray-100">
        {/* Prev */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md z-10 transition hidden sm:flex"
          aria-label="Précédent"
        >
          <FiChevronLeft className="text-gray-800" size={22} />
        </button>

        {/* Wrapper image (position relative requis pour next/image fill) */}
        <div
          className={`relative w-full h-full ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
          onMouseMove={handleZoom}
          onMouseLeave={() => setIsZoomed(false)}
        >
          {/* Image (next/image avec fill) */}
          <div className="absolute inset-0">
            <Image
              src={images[current]}
              alt={`Image produit ${current + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, 800px"
              className={`object-contain transition-transform duration-300 ${isZoomed ? 'scale-[1.5]' : 'scale-100'}`}
              style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : undefined}
            />
          </div>

          {/* Actions (zoom / ouvrir) */}
          <div className="absolute bottom-4 right-4 flex gap-2 z-20">
            <button
              onClick={() => setIsZoomed((s) => !s)}
              className="bg-white/90 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md transition"
              aria-label="Zoom"
            >
              <FiZoomIn size={18} className="text-gray-700" />
            </button>
            <button
              onClick={() => {
                /* ici tu peux ouvrir un modal plein écran si tu veux */
              }}
              className="bg-white/90 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md transition"
              aria-label="Ouvrir en plein écran"
            >
              <FiExternalLink size={18} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Next */}
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md z-10 transition hidden sm:flex"
          aria-label="Suivant"
        >
          <FiChevronRight className="text-gray-800" size={22} />
        </button>

        {/* Indicateurs */}
        <div className="absolute bottom-3 w-full flex justify-center gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition ${i === current ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'}`}
              aria-label={`Aller à l'image ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Miniatures */}
      <div className="flex gap-3 mt-4 overflow-x-auto max-w-full px-2">
        {images.slice(0, 6).map((img, i) => (
          <button
            key={i}
            className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 cursor-pointer transition ${i === current ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent hover:scale-105'}`}
            onClick={() => setCurrent(i)}
            aria-label={`Miniature ${i + 1}`}
          >
            <Image src={img} alt={`Miniature ${i + 1}`} width={80} height={80} className="object-cover w-full h-full" />
          </button>
        ))}

        {images.length > 6 && (
          <div className="w-20 h-20 rounded-lg bg-gray-100 text-gray-500 font-semibold flex items-center justify-center">
            +{images.length - 6}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageCarousel;
