// app/product/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { productService } from "../../../services/productService";
import { useCart } from "../../Context/CartContext"; 
import { 
  FaShoppingCart, 
  FaEnvelope, 
  FaStar, 
  FaTruck, 
  FaWarehouse,
  FaCheckCircle,
} from "react-icons/fa";

const ProductPage: React.FC = () => {
  const params = useParams();
  const productId = parseInt(params.id as string);
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'description' | 'features'>('description');

  // Charger le produit depuis l'API
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);
        
        const productsData = await productService.getAll();
        const foundProduct = productsData.find((p: any) => p.id === productId);
        
        if (!foundProduct) {
          setError("Produit non trouvé");
        } else {
          setProduct(foundProduct);
          const imageUrl = foundProduct.images 
            ? (foundProduct.images.startsWith('http') 
                ? foundProduct.images 
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/images${foundProduct.images.replace('/storage', '')}`)
            : '/images/placeholder.jpg';
          setMainImage(imageUrl);
        }
      } catch (err: any) {
        console.error('Erreur chargement produit:', err);
        setError(err.response?.data?.message || 'Impossible de charger le produit');
      } finally {
        setLoading(false);
      }
    }
    
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (product && (product.quantity || product.stock) > 0) {
      addToCart(product);
      alert(`${product.name} a été ajouté à votre panier !`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md mx-auto">
          <p className="text-red-600 mb-4">{error || "Produit non trouvé"}</p>
          <Link 
            href="/products" 
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Voir tous les produits
          </Link>
        </div>
      </div>
    );
  }

  const stock = product.quantity || product.stock || 0;
  const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;
  const sellerName = product.seller?.name || product.brand || 'Inconnu';

  // Trouver les produits similaires (de la même catégorie, max 4)
  const similarProducts = product.category?.products 
    ? product.category.products.filter(
      (p) => p.id !== product.id
    ).slice(0, 4) 
    : [];

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
            {Array.isArray(product.images) ? product.images.map((img, index) => (
              <div 
                key={index}
                onClick={() => setMainImage(img)}
                className={`w-16 h-16 md:w-20 md:h-20 relative cursor-pointer border-2 rounded-lg transition-all overflow-hidden
                           ${mainImage === img ? 'border-orange-500 shadow-lg' : 'border-gray-200 hover:border-orange-300'}`}
              >
                <img
                  src={typeof img === 'string' ? (img.startsWith('http') ? img : `http://localhost:8000/api/v1/images${img.replace('/storage', '')}`) : mainImage}
                  alt={`${product.name} - ${index + 1}`}
                  className="w-full h-full object-contain p-1"
                />
              </div>
            )) : (
              <div 
                onClick={() => setMainImage(mainImage)}
                className="w-16 h-16 md:w-20 md:h-20 relative cursor-pointer border-2 rounded-lg transition-all overflow-hidden border-orange-500 shadow-lg"
              >
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-1"
                />
              </div>
            )}
          </div>
          
          {/* IMAGE PRINCIPALE */}
          <div className="flex-1 relative min-h-96 bg-gray-50 rounded-xl shadow-lg p-6 flex items-center justify-center">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
                <span className="text-gray-400">Pas d&apos;image</span>
              </div>
            )}
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
              Marque: <span className="font-semibold text-gray-800">{product.brand?.name || product.brand || 'Non spécifié'}</span>
            </p>
            <p className="text-gray-500">
              Catégorie: <span className="font-semibold text-gray-800">{categoryName || 'Non catégorisé'}</span>
            </p>
          </div>
          
          {/* Notation */}
          <div className="flex items-center text-yellow-500 border-b pb-4">
            <FaStar className="mr-1" />
            <span className="text-lg font-bold">{(product.rating || 0).toFixed(1)}</span>
            <span className="ml-2 text-gray-500">
              ({(product.reviews || 0).toLocaleString()} avis clients)
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
                    <img
                      src={similarProduct.images[0].startsWith('http') ? similarProduct.images[0] : `http://localhost:8000/api/v1/images${similarProduct.images[0].replace('/storage', '')}`}
                      alt={similarProduct.name}
                      className="w-full h-full object-contain"
                    />
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-gray-800 truncate group-hover:text-orange-600 transition">
                      {similarProduct.name}
                    </h3>
                    <p className="font-bold text-orange-600 text-xl mt-2">
                      {similarProduct.price.toFixed(2)} €
                    </p>
                    <span className="text-sm text-gray-500 block">{typeof similarProduct.category === 'object' ? similarProduct.category?.name : similarProduct.category}</span>
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