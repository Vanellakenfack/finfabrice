'use client';

import React, { useState, useEffect } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { productService } from "../../../services/productService";
import { allProducts } from "../../Data/products"; 
import { useCart } from "../../Context/CartContext"; 
import { 
  FaShoppingCart, FaStar, FaTruck, FaCheckCircle, 
  FaWhatsapp, FaEnvelope, FaArrowLeft, FaShieldAlt, FaPlus
} from "react-icons/fa";

// Ajout d'une petite animation CSS personnalisée dans le JS
// Vous pouvez aussi mettre ça dans votre globals.css si vous préférez
const animationStyles = `
  @keyframes popIn {
    0% { opacity: 0; transform: scale(0.5) translateY(20px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  .animate-popIn {
    animation: popIn 0.4s ease-out forwards;
  }
`;

const ProductPage = () => {
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.id as string);
  
  // 1. J'ai ajouté 'cartTotalQuantity' ici pour écouter les changements
  const { addToCart, cartTotalQuantity } = useCart(); 
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'description' | 'features'>('description');

  // --- LOGIQUE D'AUTHENTIFICATION SIMULÉE ---
  const isAuthenticated = false; 

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const productsData = await productService.getAll();
        let found: any = productsData.find((p: any) => p.id === productId);

        if (!found) {
          found = allProducts.find(p => p.id === productId);
        }

        if (found) {
          setProduct(found);
          setMainImage(found.images?.[0] || "/placeholder.png");
        } else {
          setError("Produit non trouvé");
        }
      } catch (err) {
        const fallback = allProducts.find(p => p.id === productId);
        if (fallback) {
          setProduct(fallback);
          setMainImage(fallback.images?.[0] || "/placeholder.png");
        } else {
          setError("Erreur technique");
        }
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      const currentUrl = `/product/${productId}`;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
    } else {
      addToCart(product);
      router.push(`/checkout/${productId}`);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">Chargement...</div>;
  if (error || !product) return notFound();

  return (
    // J'ai ajouté une classe 'relative' ici pour s'assurer que le bouton flottant se positionne par rapport à l'écran
    <div className="max-w-7xl mx-auto px-4 py-10 relative">
      {/* Insertion des styles d'animation */}
      <style>{animationStyles}</style>

      <Link href="/products" className="flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-8 transition-colors">
        <FaArrowLeft /> Retour aux produits
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* GALERIE IMAGES */}
        <div className="space-y-4">
          <div className="relative h-[500px] w-full rounded-3xl overflow-hidden bg-gray-100 shadow-inner border border-gray-100">
            <Image src={mainImage} alt={product.name} fill className="object-contain p-6" priority />
          </div>
          <div className="flex gap-4 overflow-x-auto py-2">
            {product.images?.map((img: string, idx: number) => (
              <button 
                key={idx} 
                onClick={() => setMainImage(img)}
                className={`relative w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-orange-500 scale-105 shadow-md' : 'border-transparent opacity-70'}`}
              >
                <Image src={img} alt={`view-${idx}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* INFOS PRODUIT */}
        <div className="flex flex-col">
          <span className="text-orange-500 font-bold tracking-widest uppercase text-sm mb-2">Elite Shop Premium</span>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex text-yellow-400"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
            <span className="text-gray-500 text-sm">(128 avis vérifiés)</span>
          </div>

          <div className="bg-orange-50 p-6 rounded-2xl mb-8 border border-orange-100">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-orange-600">{product.price.toFixed(2)} €</span>
              <span className="text-gray-400 line-through text-lg">{(product.price * 1.3).toFixed(2)} €</span>
            </div>
            <p className="text-green-600 text-sm font-bold mt-2 flex items-center gap-2">
              <FaCheckCircle /> En stock - Livraison offerte
            </p>
          </div>

          {/* SECTION DES BOUTONS D'ACTION */}
          <div className="flex flex-col gap-4">
            
            {/* LIGNE 1 : ACTIONS PANIER ET ACHAT IMMEDIAT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => addToCart(product)}
                className="w-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <FaPlus /> AJOUTER AU PANIER
              </button>

              <button 
                onClick={handleBuyNow}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95"
              >
                <FaShoppingCart /> ACHETER MAINTENANT
              </button>
            </div>

            {/* LIGNE 2 : COMMUNICATION */}
            <div className="grid grid-cols-2 gap-4">
              {/* <button 
                className="w-full h-14 border border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 rounded-2xl flex items-center justify-center gap-3 transition-all font-semibold active:scale-95"
                title="Contacter le vendeur en interne"
              >
                <FaEnvelope className="text-xl" />
                <span>Messagerie</span>
              </button> */}

                 <button 
                    onClick={() => router.push(`/messages?vendor=${product.vendorId || product.id}`)}
                    className="group w-full h-14 border border-gray-200 text-gray-700 
                    hover:border-orange-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 
                    hover:text-orange-600 rounded-2xl flex items-center justify-center gap-3 
                    transition-all duration-300 font-semibold active:scale-95 shadow-sm hover:shadow-md"
                    title="Contacter le vendeur"
                  >
                    <FaEnvelope className="text-xl transition-transform group-hover:scale-110" />
                    <span>Messagerie</span>
                  </button>     


              <a 
                href={`https://wa.me/0000000000?text=Bonjour, je souhaite commander : ${product.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-14 border border-green-200 text-green-700 hover:border-green-300 hover:bg-green-50 hover:text-green-700 rounded-2xl flex items-center justify-center gap-3 transition-all font-semibold active:scale-95"
              >
                <FaWhatsapp className="text-2xl" />
                <span>WhatsApp</span>
              </a>
            </div>

          </div>

          {/* RÉASSURANCE */}
          <div className="grid grid-cols-2 gap-4 border-t mt-8 pt-8 border-gray-100">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <FaShieldAlt className="text-orange-500 text-xl" />
              <span>Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <FaTruck className="text-orange-500 text-xl" />
              <span>Livraison 48h</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABS DESCRIPTION/FEATURES */}
      <div className="mt-20">
        <div className="flex border-b mb-8 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('description')} 
            className={`px-10 py-4 font-bold text-lg whitespace-nowrap transition-all ${activeTab === 'description' ? 'border-b-4 border-orange-500 text-orange-600' : 'text-gray-400'}`}
          >
            Description
          </button>
          <button 
            onClick={() => setActiveTab('features')} 
            className={`px-10 py-4 font-bold text-lg whitespace-nowrap transition-all ${activeTab === 'features' ? 'border-b-4 border-orange-500 text-orange-600' : 'text-gray-400'}`}
          >
            Caractéristiques
          </button>
        </div>
        
        <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 leading-relaxed shadow-inner">
          {activeTab === 'description' ? (
            <p className="text-gray-700 text-lg">{product.description || "Aucune description détaillée disponible."}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(product.features || ["Produit certifié Premium", "Garantie incluse", "Qualité contrôlée"]).map((f: string, i: number) => (
                <div key={i} className="flex items-center gap-4 bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500">
                  <FaCheckCircle className="text-green-500 text-lg" />
                  <span className="font-medium text-gray-800">{f}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================================== */}
      {/* BOUTON FLOTTANT DU PANIER (FAB) - AJOUTÉ POUR L'ERGONOMIE */}
      {/* Apparaît uniquement si cartTotalQuantity > 0 avec une animation popIn */}
      {/* ============================================================================== */}
      {cartTotalQuantity > 0 && (
        <Link 
          href="/cart" 
          className="fixed bottom-8 right-8 z-50 animate-popIn group"
          title="Voir mon panier"
        >
          {/* Corps du bouton : Effet verre flottant */}
          <div className="relative bg-white/80 backdrop-blur-md border border-gray-100 p-5 rounded-full shadow-2xl transition-all duration-300 group-hover:shadow-orange-200 group-hover:scale-110 group-hover:bg-white active:scale-95">
            
            {/* Icône Panier aux couleurs EliteShop */}
            <FaShoppingCart className="text-3xl text-orange-500 transition-colors group-hover:text-orange-600" />
            
            {/* Badge de quantité : Rouge vif, bien visible */}
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-lg transform transition-transform group-hover:scale-110">
              {cartTotalQuantity}
            </span>
          </div>
          
          {/* Petite lueur d'arrière-plan au survol */}
          <div className="absolute inset-0 rounded-full bg-orange-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
        </Link>
      )}
      {/* ============================================================================== */}

    </div>
  );
};

export default ProductPage;