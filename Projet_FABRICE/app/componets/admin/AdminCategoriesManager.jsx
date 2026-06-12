'use client'

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { categoryService } from '../../../services/categoryService';
import ConfirmDialog from '../ui/ConfirmDialog';

export default function AdminCategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const response = await categoryService.getAll();
        const dataArray = response?.data ? response.data : response;
        setCategories(Array.isArray(dataArray) ? dataArray : []);
      } catch {
        toast.error('Impossible de charger les catégories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const askDelete = (id) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setIsConfirmOpen(false);
    await toast.promise(
      categoryService.delete(deletingId).then(() => {
        setCategories(prev => prev.filter(c => c.id !== deletingId));
        setDeletingId(null);
      }),
      {
        loading: 'Suppression...',
        success: 'Secteur supprimé',
        error: 'Erreur lors de la suppression',
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await toast.promise(
      categoryService.create({ name: formData.name, description: formData.description }).then((newCategory) => {
        setCategories(prev => [...prev, newCategory]);
        setIsModalOpen(false);
        setFormData({ name: '', description: '' });
      }),
      {
        loading: 'Création...',
        success: 'Secteur créé avec succès !',
        error: (e) => e.response?.data?.message || 'Impossible de créer le secteur',
      }
    ).finally(() => setLoading(false));
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    await toast.promise(
      categoryService.update(editingCategory.id, { name: formData.name, description: formData.description }).then((updated) => {
        setCategories(prev => prev.map(cat => cat.id === editingCategory.id ? updated : cat));
        setIsEditModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
      }),
      {
        loading: 'Modification...',
        success: 'Secteur modifié avec succès !',
        error: (e) => e.response?.data?.message || 'Impossible de modifier le secteur',
      }
    ).finally(() => setLoading(false));
  };

  const inputCls = 'w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100';

  return (
    <div className="space-y-6">
      {/* Modale de confirmation suppression */}
      <ConfirmDialog
        open={isConfirmOpen}
        title="Supprimer ce secteur ?"
        message="Cette action est irréversible. Les produits liés à ce secteur seront affectés."
        onConfirm={confirmDelete}
        onCancel={() => { setIsConfirmOpen(false); setDeletingId(null); }}
      />

      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Secteurs d'activité</h2>
          <p className="text-sm text-gray-500">Gérez les catégories principales de votre boutique</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md text-sm"
        >
          + Nouveau Secteur
        </button>
      </div>

      {/* TABLEAU */}
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
              <tr><td colSpan="4" className="text-center py-10 text-gray-400">Chargement...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-10 text-gray-400">Aucun secteur enregistré.</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded flex items-center justify-center font-bold text-sm">
                        {cat.name ? cat.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span className="font-bold text-gray-900">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{cat.description || '—'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                      {cat.totalProduits || 0} articles
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => openEditModal(cat)}
                      className="text-blue-600 hover:underline font-medium text-xs">
                      Modifier
                    </button>
                    <button onClick={() => askDelete(cat.id)}
                      className="text-red-600 hover:underline font-medium text-xs">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODALE AJOUT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Ajouter un secteur</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Nom du secteur</label>
                <input required type="text" disabled={loading} value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={inputCls} placeholder="Électronique, Santé..." />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Description courte</label>
                <textarea rows={3} disabled={loading} value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className={inputCls} placeholder="Décrivez ce secteur..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" disabled={loading} onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 text-sm disabled:opacity-50">
                  Annuler
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-50 text-sm">
                  {loading ? 'Création...' : 'Créer le secteur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE MODIFICATION */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Modifier le secteur</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Nom du secteur</label>
                <input required type="text" disabled={loading} value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={inputCls} placeholder="Électronique, Santé..." />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Description courte</label>
                <textarea rows={3} disabled={loading} value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className={inputCls} placeholder="Décrivez ce secteur..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" disabled={loading} onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 text-sm disabled:opacity-50">
                  Annuler
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition disabled:opacity-50 text-sm">
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
