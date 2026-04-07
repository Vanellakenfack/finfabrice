'use client'

import { useState, useEffect } from 'react'
import Image from "next/image"

// Import de tes composants de gestion
import AdminProductsManager from "@/componets/admin/AdminProductsManager"
import AdminUsersManager from "@/componets/admin/AdminUsersManager"
import AdminCategoriesManager from "@/componets/admin/AdminCategoriesManager"

/* ---------------- ICONS ---------------- */
const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z"/></svg>
const ChartBarIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6m4 6V7m4 10V4"/></svg>
const CogIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0"/></svg>
const ShoppingCartIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4"/></svg>
const TagIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
const BoxIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [stats, setStats] = useState({ 
    users: 0, 
    orders: 0, 
    revenue: 0, 
    reports: 0,
    categories: 0,
    products: 0 
  })

  useEffect(() => {
    // Récupération des données réelles pour les produits et catégories
    const savedProducts = JSON.parse(localStorage.getItem('customProducts') || '[]');
    const savedCategories = JSON.parse(localStorage.getItem('shopCategories') || '[]');

    // Mise à jour des stats (Données simulées + Données réelles du localStorage)
    setStats({ 
      users: 2456, 
      orders: 342, 
      revenue: 124567, 
      reports: 23,
      products: savedProducts.length,
      categories: savedCategories.length
    })
  }, [activeTab]) // Se rafraîchit quand on change d'onglet (ex: après avoir ajouté un produit)

  const menu = [
    { id: "Dashboard", name: "Dashboard", icon: <ChartBarIcon /> },
    { id: "Categories", name: "Catégories", icon: <TagIcon /> },
    { id: "Produits", name: "Produits", icon: <ShoppingCartIcon /> },
    { id: "Utilisateurs", name: "Utilisateurs", icon: <UsersIcon /> },
    { id: "Analytics", name: "Analytics", icon: <ChartBarIcon /> },
    { id: "Paramètres", name: "Paramètres", icon: <CogIcon /> },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {/* Utilisateurs */}
            <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-600 transition-transform hover:scale-[1.02]">
              <p className="text-gray-500 text-sm font-medium">Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-800">{stats.users.toLocaleString()}</p>
            </div>

            {/* Revenus */}
            <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-600 transition-transform hover:scale-[1.02]">
              <p className="text-gray-500 text-sm font-medium">Revenus globaux</p>
              <p className="text-2xl font-bold text-gray-800">{stats.revenue.toLocaleString()}€</p>
            </div>

            {/* PRODUITS (DYNAMIQUE) */}
            <div className="bg-white rounded-xl shadow p-6 border-l-4 border-orange-500 transition-transform hover:scale-[1.02]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Produits</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.products}</p>
                </div>
                <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                  <BoxIcon />
                </div>
              </div>
              <p className="text-[10px] text-orange-600 font-bold mt-2 uppercase">En inventaire</p>
            </div>

            {/* CATÉGORIES (DYNAMIQUE) */}
            <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500 transition-transform hover:scale-[1.02]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Catégories Produit</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.categories}</p>
                </div>
                <div className="p-2 bg-purple-50 text-purple-500 rounded-lg">
                  <TagIcon />
                </div>
              </div>
              <p className="text-[10px] text-purple-600 font-bold mt-2 uppercase">Rayons actifs</p>
            </div>

            {/* Commandes */}
            <div className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-600 transition-transform hover:scale-[1.02]">
              <p className="text-gray-500 text-sm font-medium">Commandes</p>
              <p className="text-2xl font-bold text-gray-800">{stats.orders}</p>
            </div>

            {/* Signalements */}
            <div className="bg-white rounded-xl shadow p-6 border-l-4 border-red-600 transition-transform hover:scale-[1.02]">
              <p className="text-gray-500 text-sm font-medium">Signalements</p>
              <p className="text-2xl font-bold text-gray-800">{stats.reports}</p>
            </div>
          </div>
        )
      case 'Categories':
        return <AdminCategoriesManager />
      case 'Produits':
        return <AdminProductsManager />
      case 'Utilisateurs':
        return <AdminUsersManager />
      case 'Paramètres':
        return <div className="bg-white p-10 rounded-xl shadow text-center text-gray-400 border-2 border-dashed">Configuration du système en cours...</div>
      default:
        return <div className="text-gray-500">Sélectionnez une option</div>
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white hidden md:flex flex-col border-r border-white/5">
        
        <div className="p-6 mb-2">
          <div className="flex items-center gap-3 px-3 py-3 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-700"></div>
              <div className="relative flex-shrink-0 w-10 h-10 overflow-hidden rounded-xl border border-white/20 bg-gray-800">
                <Image 
                  src="/Logo.jpeg" 
                  fill
                  style={{ objectFit: 'cover' }} 
                  alt="logo" 
                  className="transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-white leading-none">
                PRIME<span className="text-orange-500">WORLD</span>
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Admin Panel</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          {menu.map((item) => {
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 group
                ${active 
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20" 
                  : "hover:bg-white/5 text-gray-400 hover:text-white"}`}
              >
                <span className={`${active ? "scale-110" : "group-hover:translate-x-1"} transition-transform duration-300`}>
                  {item.icon}
                </span>
                <span className="font-semibold text-sm">{item.name}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
           <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:text-red-400 transition-colors text-sm font-bold uppercase tracking-tighter">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
             Déconnexion
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{activeTab}</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">EliteShop Management System</p>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex flex-col text-right">
                 <span className="text-xs font-bold text-gray-900">Administrateur</span>
                 <span className="text-[10px] text-green-500 font-medium">En ligne</span>
               </div>
               <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-white shadow-sm flex items-center justify-center text-orange-600 font-bold">
                 AD
               </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}