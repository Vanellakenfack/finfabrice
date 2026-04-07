'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/Data/index'



// Icônes pour le dashboard fournisseur
const PackageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
)

const TrendingUpIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const CurrencyEuroIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.172-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const ChartBarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const ShoppingCartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m0 0L17 21m-7.5-2.5h9" />
  </svg>
)

export default function FournisseurDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    produitsActifs: 0,
    ventesMois: 0,
    revenuMois: 0,
    commandesAttente: 0
  })

  const produitsPopulaires = [
    { id: '1', nom: 'Smartphone Android', ventes: 45, stock: 12, revenu: 13499.55 },
    { id: '2', nom: 'Casque Audio', ventes: 23, stock: 8, revenu: 4599.77 },
    { id: '3', nom: 'Chargeur USB-C', ventes: 67, stock: 25, revenu: 1674.75 }
  ]

  const commandesRecentes = [
    { id: 'ORD-001', client: 'Entreprise ABC', montant: 299.99, statut: 'En attente' },
    { id: 'ORD-002', client: 'Société XYZ', montant: 599.98, statut: 'Confirmée' },
    { id: 'ORD-003', client: 'Compagnie 123', montant: 149.99, statut: 'Expédiée' }
  ]

  useEffect(() => {
    setStats({
      produitsActifs: 24,
      ventesMois: 156,
      revenuMois: 12450.75,
      commandesAttente: 8
    })
  }, [])


const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (!user) {
      router.push('/login/Login')
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Chargement...</h1>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Vendeur</h1>
              <p className="text-gray-600 text-sm">Gérez votre boutique et vos ventes</p>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Bienvenue, {user.email}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.userType === 'vendor' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user.userType === 'vendor' ? 'Vendeur' : 'Acheteur'}
              </span>
              <button
                onClick={() => router.push('/auth/login')}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Déconnexion
              </button>
            </div>



            <button 
              onClick={() => router.push('/vendor/products/new')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon />
              <span>Nouveau produit</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques Vendeur */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produits actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats.produitsActifs}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                <PackageIcon />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ventes ce mois</p>
                <p className="text-2xl font-bold text-blue-600">{stats.ventesMois}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <TrendingUpIcon />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenu mensuel</p>
                <p className="text-2xl font-bold text-purple-600">{stats.revenuMois} €</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                <CurrencyEuroIcon />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-orange-600">{stats.commandesAttente}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                <ClockIcon />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Produits populaires */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Produits populaires</h2>
              <TrendingUpIcon />
            </div>
            <div className="space-y-4">
              {produitsPopulaires.map((produit) => (
                <div key={produit.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{produit.nom}</h3>
                    <p className="text-sm text-gray-600">{produit.ventes} ventes</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{produit.revenu} €</p>
                    <p className="text-xs text-gray-600">Stock: {produit.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commandes récentes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Commandes récentes</h2>
              <ShoppingCartIcon />
            </div>
            <div className="space-y-4">
              {commandesRecentes.map((commande) => (
                <div key={commande.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{commande.id}</h3>
                    <p className="text-sm text-gray-600">{commande.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{commande.montant} €</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      commande.statut === 'Confirmée' ? 'bg-green-100 text-green-800' :
                      commande.statut === 'Expédiée' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {commande.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions rapides vendeur */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => router.push('/vendor/products/new')}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-center group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 transition-colors text-blue-600">
              <PlusIcon />
            </div>
            <p className="font-medium text-gray-900">Nouveau produit</p>
          </button>
          
          <button 
            onClick={() => router.push('/vendor/products')}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-center group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-green-200 transition-colors text-green-600">
              <PackageIcon />
            </div>
            <p className="font-medium text-gray-900">Mes produits</p>
          </button>
          
          <button 
            onClick={() => router.push('/vendor/orders')}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-center group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-200 transition-colors text-purple-600">
              <ShoppingCartIcon />
            </div>
            <p className="font-medium text-gray-900">Commandes</p>
          </button>
          
          <button 
            onClick={() => router.push('/vendor/analytics')}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-center group"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-orange-200 transition-colors text-orange-600">
              <ChartBarIcon />
            </div>
            <p className="font-medium text-gray-900">Analytics</p>
          </button>
        </div>
      </div>
    </div>
  )
}