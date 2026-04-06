'use client'

import { useState, useEffect } from 'react'
import { userService } from '../../../services/userService'

export default function AdminUsersManager() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'acheteur',
    statut: 'Actif',
    password: ''
  })

  // Charger les utilisateurs depuis l'API
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setInitialLoading(true)
      setError(null)
      const data = await userService.getAll()
      setUsers(data)
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
      setError(error.response?.data?.message || 'Impossible de charger les utilisateurs')
    } finally {
      setInitialLoading(false)
    }
  }

  // Créer un utilisateur
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role.toLowerCase() === 'client' ? 'acheteur' : formData.role.toLowerCase()
      }
      
      await userService.create(userData)
      await loadUsers() // Recharger la liste
      
      setIsModalOpen(false)
      setFormData({ name: '', email: '', phone: '', role: 'acheteur', statut: 'Actif', password: '' })
      setNotification({ type: 'success', message: 'Utilisateur créé avec succès !' })
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error('Erreur création utilisateur:', error)
      setNotification({ type: 'error', message: error.response?.data?.message || 'Impossible de créer l\'utilisateur' })
      setTimeout(() => setNotification(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  // Ouvrir la modale d'édition
  const openEditModal = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      statut: user.statut,
      password: ''
    })
    setIsEditModalOpen(true)
  }

  // Modifier un utilisateur
  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role.toLowerCase() === 'client' ? 'acheteur' : formData.role.toLowerCase(),
        statut: formData.statut
      }
      
      await userService.update(editingUser.id, userData)
      await loadUsers() // Recharger la liste
      
      setIsEditModalOpen(false)
      setEditingUser(null)
      setFormData({ name: '', email: '', phone: '', role: 'acheteur', statut: 'Actif', password: '' })
      setNotification({ type: 'success', message: 'Utilisateur modifié avec succès !' })
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error('Erreur modification utilisateur:', error)
      setNotification({ type: 'error', message: error.response?.data?.message || 'Impossible de modifier l\'utilisateur' })
      setTimeout(() => setNotification(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  // Supprimer un utilisateur
  const handleDelete = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return
    
    try {
      setLoading(true)
      await userService.delete(userId)
      await loadUsers() // Recharger la liste
      setNotification({ type: 'success', message: 'Utilisateur supprimé avec succès !' })
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error)
      setNotification({ type: 'error', message: error.response?.data?.message || 'Impossible de supprimer l\'utilisateur' })
      setTimeout(() => setNotification(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  // Traduire le rôle pour l'affichage
  const translateRole = (role) => {
    const roles = {
      'acheteur': 'Client',
      'vendeur': 'Vendeur',
      'admin': 'Admin'
    }
    return roles[role] || role
  }

  return (
    <div className="space-y-6 relative">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
          <button onClick={() => setNotification(null)} className="ml-3 hover:opacity-75">&times;</button>
        </div>
      )}

      {/* Loading initial */}
      {initialLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Chargement des utilisateurs...</p>
        </div>
      )}

      {/* Error */}
      {!initialLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 mb-3">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Content */}
      {!initialLoading && !error && (
        <>
          {/* HEADER ACTIONS */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Gestion des Utilisateurs</h2>
              <p className="text-sm text-gray-500">Administrez les comptes clients et vendeurs</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md disabled:opacity-50"
            >
              + Créer un utilisateur
            </button>
          </div>

          {/* TABLEAU DES UTILISATEURS */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-[11px] uppercase tracking-widest">
              <th className="px-6 py-4 font-bold">Utilisateur</th>
              <th className="px-6 py-4 font-bold">Rôle</th>
              <th className="px-6 py-4 font-bold text-center">Statut</th>
              <th className="px-6 py-4 font-bold">Inscription</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  {loading ? 'Chargement...' : 'Aucun utilisateur trouvé'}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'vendeur' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {translateRole(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`w-2 h-2 rounded-full inline-block mr-2 ${user.statut === 'Actif' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="font-medium">{user.statut}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(user.date_inscription).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button 
                      onClick={() => openEditModal(user)}
                      className="text-blue-600 hover:underline"
                    >
                      Éditer
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:underline"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODALE DE CRÉATION --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Nouvel Utilisateur</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nom Complet</label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="ex: Marc Kouassi" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Adresse Email</label>
                <input 
                  required 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="email@exemple.com" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Téléphone</label>
                <input 
                  type="tel" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="+225 01 23 45 67 89" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Rôle</label>
                  <select 
                    value={formData.role} 
                    onChange={(e) => setFormData({...formData, role: e.target.value})} 
                    className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  >
                    <option value="acheteur">Client</option>
                    <option value="vendeur">Vendeur</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Statut Initial</label>
                  <select 
                    value={formData.statut} 
                    onChange={(e) => setFormData({...formData, statut: e.target.value})} 
                    className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  >
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mot de passe provisoire</label>
                <input 
                  required 
                  type="password" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-bold shadow-lg hover:bg-orange-600 transition-all disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer le compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODALE D'ÉDITION --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Modifier l'Utilisateur</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nom Complet</label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Adresse Email</label>
                <input 
                  required 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Téléphone</label>
                <input 
                  type="tel" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Rôle</label>
                  <select 
                    value={formData.role} 
                    onChange={(e) => setFormData({...formData, role: e.target.value})} 
                    className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  >
                    <option value="acheteur">Client</option>
                    <option value="vendeur">Vendeur</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Statut</label>
                  <select 
                    value={formData.statut} 
                    onChange={(e) => setFormData({...formData, statut: e.target.value})} 
                    className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  >
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-bold shadow-lg hover:bg-orange-600 transition-all disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )}
    </div>
  );
}