// products.ts
export interface Product {
  id: number;
  name: string;
  brand: string;
  description: string;
  features: string[];
  price: number;
  originalPrice?: number | null;
  images: string[];
  reviews: number;
  rating: number;
  stock: number;
  shipping: string;
  delivery: string;
  category: string;
}

export const allProducts: Product[] = [
  // 🟧 Technologie
  {
    id: 1,
    name: "Smartphone Android 128GB Double SIM",
    brand: "Android",
    description:
      "Smartphone Android performant, double SIM, 128GB de stockage, écran HD, batterie longue durée.",
    features: ["Double SIM", "128GB", "Écran HD", "Batterie longue durée"],
    price: 189.99,
    originalPrice: 229.99,
    images: ["/images/art3.jpg"],
    reviews: 128,
    rating: 4.5,
    stock: 20,
    shipping: "Livraison gratuite",
    delivery: "2-4 jours",
    category: "Technologie",
  },
  {
    id: 2,
    name: "Montre connectée étanche",
    brand: "SmartWatch",
    description:
      "Montre connectée étanche, suivi santé, notifications, autonomie 7 jours.",
    features: ["Étanche", "Suivi santé", "Notifications", "Autonomie 7j"],
    price: 45.5,
    originalPrice: 59.99,
    images: ["/images/art4.jpg"],
    reviews: 342,
    rating: 4.8,
    stock: 35,
    shipping: "Livraison gratuite",
    delivery: "2-4 jours",
    category: "Technologie",
  },

  // 🟩 Santé
  {
    id: 3,
    name: "Tensiomètre électronique",
    brand: "HealthPro",
    description: "Appareil pour mesurer la tension artérielle avec précision.",
    features: ["Écran LCD", "Mémoire intégrée", "Facile à utiliser"],
    price: 35.99,
    originalPrice: 49.99,
    images: ["/images/sante1.jpg"],
    reviews: 210,
    rating: 4.6,
    stock: 25,
    shipping: "Livraison gratuite",
    delivery: "3-5 jours",
    category: "Santé",
  },
  {
    id: 4,
    name: "Balance connectée Bluetooth",
    brand: "FitSmart",
    description:
      "Balance intelligente avec suivi de poids, IMC et masse musculaire.",
    features: ["Bluetooth", "Suivi via app", "Capteurs haute précision"],
    price: 39.99,
    images: ["/images/sante2.jpg"],
    reviews: 98,
    rating: 4.4,
    stock: 12,
    shipping: "Livraison gratuite",
    delivery: "2-4 jours",
    category: "Santé",
  },

  // 🟦 BTP
  {
    id: 5,
    name: "Casque de sécurité avec visière",
    brand: "ProBTP",
    description: "Casque de protection pour les chantiers de construction.",
    features: ["Léger", "Antichoc", "Réglable"],
    price: 25.0,
    images: ["/images/btp1.jpg"],
    reviews: 56,
    rating: 4.3,
    stock: 40,
    shipping: "Livraison gratuite",
    delivery: "3-6 jours",
    category: "BTP",
  },
  {
    id: 6,
    name: "Gilet de sécurité fluorescent",
    brand: "BuildSafe",
    description: "Gilet fluorescent haute visibilité pour chantiers.",
    features: ["Fluorescent", "Taille réglable", "Tissu respirant"],
    price: 14.5,
    images: ["/images/btp2.jpg"],
    reviews: 73,
    rating: 4.7,
    stock: 60,
    shipping: "Livraison gratuite",
    delivery: "2-5 jours",
    category: "BTP",
  },

  // 🟫 Médical
  {
    id: 7,
    name: "Stéthoscope professionnel",
    brand: "MedLine",
    description: "Stéthoscope en acier inoxydable pour diagnostics médicaux.",
    features: ["Acier", "Double pavillon", "Confort acoustique"],
    price: 65.99,
    images: ["/images/medical1.jpg"],
    reviews: 134,
    rating: 4.9,
    stock: 18,
    shipping: "Livraison gratuite",
    delivery: "3-5 jours",
    category: "Médical",
  },

  // 🟨 Agricole
  {
    id: 8,
    name: "Pulvérisateur manuel 5L",
    brand: "AgroPlus",
    description: "Pulvérisateur robuste pour jardin et cultures agricoles.",
    features: ["Capacité 5L", "Poignée ergonomique", "Buse réglable"],
    price: 22.99,
    images: ["/images/agri1.jpg"],
    reviews: 87,
    rating: 4.5,
    stock: 30,
    shipping: "Livraison gratuite",
    delivery: "3-5 jours",
    category: "Agricole",
  },

  // ⚙️ Industriel
  {
    id: 9,
    name: "Perceuse à percussion 800W",
    brand: "IndusPro",
    description: "Perceuse puissante pour les travaux industriels et BTP.",
    features: ["800W", "Vitesse réglable", "Mandrin automatique"],
    price: 89.99,
    originalPrice: 109.99,
    images: ["/images/indus1.jpg"],
    reviews: 220,
    rating: 4.8,
    stock: 15,
    shipping: "Livraison gratuite",
    delivery: "2-4 jours",
    category: "Industriel",
  },
];
