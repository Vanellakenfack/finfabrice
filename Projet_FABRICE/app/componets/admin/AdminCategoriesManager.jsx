'use client'

import { useState, useEffect } from 'react';
import { categoryService } from '../../../services/categoryService';

export default function AdminCategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // 1. Chargement initial des données depuis l'API
 useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const response = await categoryService.getAll();
        
        // Extraction du tableau si Laravel renvoie l'objet standard { data: [...] }
        const dataArray = response?.data ? response.data : response;
        
        setCategories(Array.isArray(dataArray) ? dataArray : []);
      } catch (e) {
        console.error("Erreur lors du chargement :", e);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);


  // 2. Suppression d'une catégorie via l'API
  const deleteCategory = async (id) => {
    if (confirm("Voulez-vous vraiment supprimer ce secteur ?")) {
      try {
        await categoryService.delete(id);
        // Mise à jour optimiste de l'interface
        setCategories(prev => prev.filter(c => c.id !== id));
      } catch (e) {
        alert("Erreur lors de la suppression sur le serveur");
      }
    }
  };

  // 3. Création d'une catégorie via l'API
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Appel du service de création
      const newCategory = await categoryService.create({
        name: formData.name,
        description: formData.description
      });

      // Ajout de la réponse (qui contient l'ID généré par Laravel) à la liste
      setCategories(prev => [...prev, newCategory]);
      
      // Reset et fermeture
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
    } catch (e) {
      console.error("Erreur lors de la création :", e);
      alert("Impossible de créer le secteur. Vérifiez votre connexion à l'API.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Modification d'une catégorie
  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const updatedCategory = await categoryService.update(editingCategory.id, {
        name: formData.name,
        description: formData.description
      });

      // Mise à jour de la liste
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id ? updatedCategory : cat
      ));
      
      // Reset et fermeture
      setIsEditModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    } catch (e) {
      console.error("Erreur lors de la modification :", e);
      alert("Impossible de modifier le secteur. Vérifiez votre connexion à l'API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Secteurs d'activité</h2>
          <p className="text-sm text-gray-500">Gérez les catégories principales de votre boutique</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md"
        >
          + Nouveau Secteur
        </button>
      </div>

      {/* TABLEAU DES CATÉGORIES */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-[11px] uppercase tracking-widest font-bold">
              <th className="px-6 py-4">Nom du secteur</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-center">Produits</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading && categories.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-10">Connexion au serveur...</td></tr>
            ) : categories.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-10 text-gray-400">Aucun secteur enregistré.</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded flex items-center justify-center font-bold">
                        {cat.name ? cat.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span className="font-bold text-gray-900">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{cat.description}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                      {cat.totalProduits || 0} articles
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button 
                      onClick={() => openEditModal(cat)}
                      className="text-blue-600 hover:underline font-medium text-xs"
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => deleteCategory(cat.id)}
                      className="text-red-600 hover:underline font-medium text-xs"
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

      {/* MODALE D'AJOUT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-white">
              <h3 className="text-xl font-bold text-gray-800">Ajouter un secteur</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nom du secteur</label>
                <input 
                  required 
                  type="text" 
                  disabled={loading}
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                  placeholder="Électronique, Santé..." 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description courte</label>
                <textarea 
                  rows={3}
                  disabled={loading}
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                  placeholder="Décrivez ce secteur..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  disabled={loading}
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-bold shadow-lg hover:bg-orange-600 transition-all disabled:bg-orange-300"
                >
                  {loading ? 'Création...' : 'Créer le secteur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DE MODIFICATION */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-white">
              <h3 className="text-xl font-bold text-gray-800">Modifier un secteur</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nom du secteur</label>
                <input 
                  required 
                  type="text" 
                  disabled={loading}
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                  placeholder="Électronique, Santé..." 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description courte</label>
                <textarea 
                  rows={3}
                  disabled={loading}
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                  placeholder="Décrivez ce secteur..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  disabled={loading}
                  onClick={() => setIsEditModalOpen(false)} 
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg hover:bg-blue-600 transition-all disabled:bg-blue-300"
                >
                  {loading ? 'Modification...' : 'Modifier le secteur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}