'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Icônes SVG professionnelles
const ShoppingCartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m0 0L17 21m-7.5-2.5h9" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const HeartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

const CurrencyEuroIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.172-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const PackageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
)

const ChatIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const StarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

export default function AcheteurDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    commandesEnCours: 0,
    commandesTerminees: 0,
    produitsFavoris: 0,
    budgetDepense: 0
  })

  const commandesRecentes = [
    { id: '1', produit: 'Smartphone Android', statut: 'Livré', prix: 299.99, date: '2024-01-15' },
    { id: '2', produit: 'Casque Audio', statut: 'En cours', prix: 199.99, date: '2024-01-14' },
    { id: '3', produit: 'T-shirt Cotton', statut: 'Expédié', prix: 24.99, date: '2024-01-13' }
  ]

  const produitsRecommandes = [
    { id: '1', nom: 'Montre Connectée', prix: 149.99, vendeur: 'TechCorp', note: 4.5 },
    { id: '2', nom: 'Sac à Dos', prix: 49.99, vendeur: 'TravelGear', note: 4.3 },
    { id: '3', nom: 'Power Bank', prix: 29.99, vendeur: 'PowerTech', note: 4.7 }
  ]

  useEffect(() => {
    setStats({
      commandesEnCours: 3,
      commandesTerminees: 12,
      produitsFavoris: 8,
      budgetDepense: 1567.50
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Acheteur</h1>
              <p className="text-gray-600 text-sm">Gérez vos achats et commandes</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques Acheteur */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commandes en cours</p>
                <p className="text-2xl font-bold text-blue-600">{stats.commandesEnCours}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <ShoppingCartIcon />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commandes terminées</p>
                <p className="text-2xl font-bold text-green-600">{stats.commandesTerminees}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                <CheckIcon />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produits favoris</p>
                <p className="text-2xl font-bold text-red-600">{stats.produitsFavoris}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                <HeartIcon />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget dépensé</p>
                <p className="text-2xl font-bold text-purple-600">{stats.budgetDepense} €</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                <CurrencyEuroIcon />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Commandes récentes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Commandes récentes</h2>
              <PackageIcon />
            </div>
            <div className="space-y-4">
              {commandesRecentes.map((commande) => (
                <div key={commande.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{commande.produit}</h3>
                    <p className="text-sm text-gray-600">{commande.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{commande.prix} €</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      commande.statut === 'Livré' ? 'bg-green-100 text-green-800' :
                      commande.statut === 'En cours' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {commande.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => router.push('/acheteur/commandes')}
              className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Voir toutes les commandes
            </button>
          </div>

          {/* Produits recommandés */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recommandations</h2>
              <StarIcon />
            </div>
            <div className="space-y-4">
              {produitsRecommandes.map((produit) => (
                <div 
                  key={produit.id}
                  onClick={() => router.push(`/products/${produit.id}`)}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <PackageIcon />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{produit.nom}</h3>
                    <p className="text-sm text-gray-600">{produit.vendeur}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{produit.prix} €</p>
                    <div className="flex items-center space-x-1">
                      <StarIcon />
                      <span className="text-xs text-gray-600">{produit.note}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => router.push('/products')}
              className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Découvrir plus de produits
            </button>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => router.push('/products')}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-center group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 transition-colors">
              <ShoppingCartIcon />
            </div>
            <p className="font-medium text-gray-900">Boutique</p>
          </button>
          
          <button 
            onClick={() => router.push('/acheteur/favoris')}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-center group"
          >
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-red-200 transition-colors">
              <HeartIcon />
            </div>
            <p className="font-medium text-gray-900">Favoris</p>
          </button>
          
          <button 
            onClick={() => router.push('/acheteur/commandes')}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-center group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-green-200 transition-colors">
              <PackageIcon />
            </div>
            <p className="font-medium text-gray-900">Commandes</p>
          </button>
          
          <button 
            onClick={() => router.push('/acheteur/messages')}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-center group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-200 transition-colors">
              <ChatIcon />
            </div>
            <p className="font-medium text-gray-900">Messages</p>
          </button>
        </div>
      </div>
    </div>
  )
}