// app/product/[id]/page.tsx
"use client";

import React, { useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
// Chemins d'importation basés sur votre arborescence (app/product/[id] -> ../../../)
import { allProducts, Product } from "../../Data/products"; 
import { useCart } from "../../Context/CartContext"; 
import { 
  FaShoppingCart, 
  FaEnvelope, 
  FaStar, 
  FaTruck, 
  FaWarehouse,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

// Interface pour les props de la page dynamique
interface ProductPageProps {
  params: {
    id: string; // L'ID vient de l'URL
  };
}

const ProductPage: React.FC<ProductPageProps> = ({ params }) => {
  const productId = parseInt(params.id);
  const { addToCart } = useCart();
  
  // Trouver le produit actuel
  const product = allProducts.find((p) => p.id === productId);

  if (!product) {
    notFound();
  }

  // État local pour la galerie d'images
  const [mainImage, setMainImage] = useState<string>(product.images[0]);
  // État local pour les onglets (Description, Caractéristiques...)
  const [activeTab, setActiveTab] = useState<'description' | 'features' | 'reviews'>('description');
  
  // Trouver les produits similaires (de la même catégorie, max 4)
  const similarProducts = allProducts
    .filter(
      (p) => p.category === product.category && p.id !== product.id
    )
    .slice(0, 4); 

  // Gestion de l'ajout au panier
  const handleAddToCart = () => {
    if (product.stock > 0) {
      addToCart(product);
      alert(`${product.name} a été ajouté à votre panier !`);
    } else {
      alert("Ce produit est en rupture de stock.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-white">
      
      {/* ---------------------------------------------------- */}
      {/* SECTION PRINCIPALE (DÉTAILS ET ACHAT) */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* COLONNE 1 & 2: Images & Nom/Prix */}
        <div className="lg:col-span-2 flex flex-col md:flex-row gap-6">
          
          {/* VIGNETTES (Gallery) */}
          <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-3 overflow-x-auto md:overflow-hidden pr-2 md:pr-0">
            {product.images.map((img, index) => (
              <div 
                key={index}
                onClick={() => setMainImage(img)}
                className={`w-16 h-16 md:w-20 md:h-20 relative cursor-pointer border-2 rounded-lg transition-all 
                           ${mainImage === img ? 'border-orange-500 shadow-lg' : 'border-gray-200 hover:border-orange-300'}`}
              >
                <Image
                  src={img}
                  alt={`${product.name} - ${index + 1}`}
                  layout="fill"
                  objectFit="contain"
                  className="p-1"
                />
              </div>
            ))}
          </div>
          
          {/* IMAGE PRINCIPALE */}
          <div className="flex-1 relative min-h-96 bg-gray-50 rounded-xl shadow-lg p-6">
            <Image
              src={mainImage}
              alt={product.name}
              layout="fill"
              objectFit="contain"
              priority // Charger l'image principale rapidement
            />
          </div>
        </div>

        {/* COLONNE 3: Informations, Prix et Actions */}
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-3">
            {product.name}
          </h1>

          {/* Marque et Catégorie */}
          <div className="text-sm space-y-1">
            <p className="text-gray-500">
              Marque: <span className="font-semibold text-gray-800">{product.brand}</span>
            </p>
            <p className="text-gray-500">
              Catégorie: <span className="font-semibold text-gray-800">{product.category}</span>
            </p>
          </div>
          
          {/* Notation */}
          <div className="flex items-center text-yellow-500 border-b pb-4">
            <FaStar className="mr-1" />
            <span className="text-lg font-bold">{product.rating.toFixed(1)}</span>
            <span className="ml-2 text-gray-500">
              ({product.reviews.toLocaleString()} avis clients)
            </span>
          </div>
          
          {/* Prix et Réduction */}
          <div className="space-y-1">
            {product.originalPrice && (
                <p className="text-gray-500 text-xl line-through">
                    Prix de base: {product.originalPrice.toFixed(2)} €
                </p>
            )}
            <p className="text-5xl font-bold text-orange-600">
              {product.price.toFixed(2)} €
            </p>
            {product.originalPrice && (
                <p className="text-green-600 font-semibold">
                    Vous économisez: {(product.originalPrice - product.price).toFixed(2)} €
                </p>
            )}
          </div>
          
          {/* Info Livraison / Stock */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-3">
              <FaTruck className="text-orange-500 text-xl" />
              <p className="text-gray-700">
                Livraison: <span className="font-semibold">{product.shipping}</span> ({product.delivery})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <FaWarehouse 
                className={product.stock > 0 ? "text-green-500 text-xl" : "text-red-500 text-xl"} 
              />
              <p className={`font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                {product.stock > 0 ? "En Stock" : "Rupture de stock"} ({product.stock} unités)
              </p>
            </div>
          </div>

          {/* --- Boutons d'Action --- */}
          <div className="flex flex-col space-y-3 pt-6">
            
            {/* 1. Ajouter au panier (Action Principale) */}
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold py-3 px-6 rounded-lg transition shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={product.stock <= 0}
            >
              <FaShoppingCart /> Ajouter au panier
            </button>
            
            {/* 2. Passer la commande (Achat immédiat) */}
            <button
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition shadow-md disabled:bg-gray-400"
              disabled={product.stock <= 0}
            >
              <FaCheckCircle /> Acheter maintenant
            </button>
            
            {/* 3. Contacter le vendeur (Action Secondaire) */}
            <Link
              href="/contact-seller" 
              className="w-full flex items-center justify-center gap-2 border border-blue-500 text-blue-500 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition"
            >
              <FaEnvelope /> Contacter le vendeur
            </Link>
          </div>
        </div>
      </div>
      
      {/* ---------------------------------------------------- */}
      {/* DESCRIPTION ET CARACTÉRISTIQUES (ONGLETS) */}
      {/* ---------------------------------------------------- */}
      <div className="mt-16 bg-white p-6 rounded-xl shadow-lg">
        {/* Barre d'onglets */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'description'
                ? 'border-b-4 border-orange-500 text-orange-600'
                : 'text-gray-600 hover:text-orange-500'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'features'
                ? 'border-b-4 border-orange-500 text-orange-600'
                : 'text-gray-600 hover:text-orange-500'
            }`}
          >
            Caractéristiques
          </button>
        </div>
        
        {/* Contenu de l'onglet */}
        <div className="p-4 bg-gray-50 rounded-lg">
          {activeTab === 'description' && (
            <p className="text-gray-700 leading-loose">{product.description}</p>
          )}
          
          {activeTab === 'features' && (
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                    <FaCheckCircle className="mt-1 mr-2 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}
          
          {/* L'onglet 'reviews' pourrait être implémenté ici en utilisant les données existantes */}
        </div>
      </div>
      
      
      {/* ---------------------------------------------------- */}
      {/* SECTION DES PRODUITS SIMILAIRES */}
      {/* ---------------------------------------------------- */}
      {similarProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-3">
            Vous aimerez aussi
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarProducts.map((similarProduct) => (
              // Utiliser Link pour la navigation
              <Link
                href={`/product/${similarProduct.id}`}
                key={similarProduct.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 block overflow-hidden group"
              >
                <div className="relative h-40 w-full bg-gray-100 p-3">
                    <Image
                      src={similarProduct.images[0]}
                      alt={similarProduct.name}
                      layout="fill"
                      objectFit="contain"
                    />
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-gray-800 truncate group-hover:text-orange-600 transition">
                      {similarProduct.name}
                    </h3>
                    <p className="font-bold text-orange-600 text-xl mt-2">
                      {similarProduct.price.toFixed(2)} €
                    </p>
                    <span className="text-sm text-gray-500 block">{similarProduct.category}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
};

export default ProductPage;