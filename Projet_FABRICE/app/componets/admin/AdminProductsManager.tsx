'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { productService } from '../../../services/productService'
import { categoryService } from '../../../services/categoryService'
import { adminService } from '../../../services/adminService'
import { buildImageUrl } from '../../../lib/imageUrl'
import ConfirmDialog from '../ui/ConfirmDialog'

function exportCsv(products: any[]) {
  const headers = ['ID', 'Nom', 'Catégorie', 'Prix', 'Stock', 'Actif', 'Slug']
  const rows = products.map(p => [
    p.id,
    p.name,
    typeof p.category === 'object' ? p.category?.name : p.category,
    p.price,
    p.quantity ?? p.stock ?? 0,
    p.is_active ? 'Oui' : 'Non',
    p.slug,
  ])
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'produits.csv'; a.click()
  URL.revokeObjectURL(url)
}

const inputCls = 'w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white'

export default function AdminProductsManager() {
  const [products, setProducts] = useState<any[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [selected, setSelected] = useState<number[]>([])
  const [confirmState, setConfirmState] = useState<{ open: boolean; productId: number | null; productName: string }>({ open: false, productId: null, productName: '' })
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)

  // Filtres
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [page, setPage] = useState(1)

  const [formData, setFormData] = useState({
    nom: '', categorie: '', price: '', stock: '', description: '',
  })

  // Charger catégories une seule fois
  useEffect(() => {
    categoryService.getAll().then((data: any[]) => {
      setCategories(Array.isArray(data) ? data : [])
      if (data.length > 0) setFormData(prev => ({ ...prev, categorie: String(data[0].id) }))
    }).catch(() => {})
  }, [])

  // Charger produits avec filtres (endpoint admin)
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params: any = { page }
      if (search) params.search = search
      if (categoryFilter) params.category_id = categoryFilter
      if (lowStockOnly) params.low_stock = true

      const res = await adminService.getAdminProducts(params)
      setProducts(res.data ?? [])
      if (res.meta) setMeta(res.meta)
      setSelected([])
    } catch {
      // Fallback sur l'endpoint public si admin non dispo
      try {
        const data = await productService.getAll()
        setProducts(Array.isArray(data) ? data : [])
      } catch {
        setError('Impossible de charger les produits')
      }
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [search, categoryFilter, lowStockOnly, page])

  useEffect(() => {
    const t = setTimeout(loadProducts, search ? 400 : 0)
    return () => clearTimeout(t)
  }, [loadProducts])

  /* ---- TOGGLE is_active ---- */
  const handleToggle = async (product: any) => {
    try {
      const res = await adminService.toggleProduct(product.id)
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: res.is_active } : p))
      toast.success(`"${product.name}" → ${res.is_active ? 'Actif' : 'Inactif'}`)
    } catch {
      toast.error('Impossible de changer le statut')
    }
  }

  /* ---- BULK ---- */
  const toggleSelect = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () =>
    setSelected(selected.length === products.length ? [] : products.map(p => p.id))

  const handleBulkDelete = async () => {
    setBulkConfirmOpen(false)
    await toast.promise(
      (async () => {
        setLoading(true)
        await Promise.all(selected.map(id => productService.delete(id)))
        loadProducts()
      })().finally(() => setLoading(false)),
      {
        loading: 'Suppression en cours...',
        success: `${selected.length} produit(s) supprimé(s)`,
        error: 'Erreur lors de la suppression',
      }
    )
  }

  const handleBulkToggle = async () => {
    await toast.promise(
      (async () => {
        setLoading(true)
        await Promise.all(selected.map(id => adminService.toggleProduct(id)))
        loadProducts()
      })().finally(() => setLoading(false)),
      {
        loading: 'Mise à jour...',
        success: `${selected.length} produit(s) mis à jour`,
        error: 'Erreur lors de la mise à jour',
      }
    )
  }

  /* ---- IMAGE ---- */
  const compressImage = async (file: File): Promise<File> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (ev) => {
        const img = new Image()
        img.src = ev.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let w = img.width; let h = img.height
          if (w > 1200) { h = (h * 1200) / w; w = 1200 }
          canvas.width = w; canvas.height = h
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h)
          canvas.toBlob(blob => {
            if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }))
            else reject(new Error('Compression failed'))
          }, 'image/jpeg', 0.75)
        }
      }
      reader.onerror = reject
    })

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const compressed = await compressImage(file)
      setSelectedImage(compressed)
      setImagePreview(URL.createObjectURL(compressed))
    }
  }

  /* ---- CRUD ---- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await toast.promise(
      productService.create({
        name: formData.nom,
        category_id: parseInt(formData.categorie),
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.stock) || 0,
        images: selectedImage ?? undefined,
      }).then(() => {
        setIsModalOpen(false)
        resetForm()
        loadProducts()
      }),
      {
        loading: 'Création...',
        success: 'Produit créé avec succès !',
        error: (err: any) => err?.response?.data?.message || 'Impossible de créer le produit',
      }
    )
  }

  const openEditModal = (product: any) => {
    setEditingProduct(product)
    setFormData({
      nom: product.name,
      categorie: product.category?.id ?? (categories[0]?.id ?? ''),
      price: product.price.toString(),
      stock: (product.quantity ?? 0).toString(),
      description: product.description ?? '',
    })
    setSelectedImage(null)
    setImagePreview('')
    setIsEditModalOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    await toast.promise(
      productService.update(editingProduct.id, {
        name: formData.nom,
        category_id: parseInt(formData.categorie),
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.stock) || 0,
        images: selectedImage ?? undefined,
      }).then(() => {
        setIsEditModalOpen(false)
        setEditingProduct(null)
        resetForm()
        loadProducts()
      }),
      {
        loading: 'Modification...',
        success: 'Produit modifié avec succès !',
        error: (err: any) => err?.response?.data?.message || 'Impossible de modifier le produit',
      }
    )
  }

  const askDelete = (product: any) => {
    setConfirmState({ open: true, productId: product.id, productName: product.name })
  }

  const confirmDelete = async () => {
    const id = confirmState.productId!
    setConfirmState({ open: false, productId: null, productName: '' })
    await toast.promise(
      productService.delete(id).then(() => loadProducts()),
      {
        loading: 'Suppression...',
        success: 'Produit supprimé',
        error: 'Impossible de supprimer le produit',
      }
    )
  }

  const resetForm = () => {
    setFormData({ nom: '', categorie: categories[0]?.id ?? '', price: '', stock: '', description: '' })
    setSelectedImage(null)
    setImagePreview('')
  }

  const getStockBadge = (qty: number) => {
    if (qty === 0) return <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Épuisé</span>
    if (qty < 5) return <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{qty} restant{qty > 1 ? 's' : ''}</span>
    return <span className="text-[11px] text-gray-600">{qty}</span>
  }

  return (
    <div className="space-y-5 relative">
      {/* Confirmation suppression unitaire */}
      <ConfirmDialog
        open={confirmState.open}
        title="Supprimer ce produit ?"
        message={`"${confirmState.productName}" sera définitivement supprimé.`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmState({ open: false, productId: null, productName: '' })}
      />

      {/* Confirmation suppression en masse */}
      <ConfirmDialog
        open={bulkConfirmOpen}
        title={`Supprimer ${selected.length} produit(s) ?`}
        message="Cette action est irréversible. Tous les produits sélectionnés seront supprimés."
        confirmLabel="Tout supprimer"
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkConfirmOpen(false)}
      />

      {/* HEADER */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Catalogue Produits</h2>
          <p className="text-xs text-gray-500">{meta.total || products.length} produits au total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => exportCsv(products)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            ↓ Exporter CSV
          </button>
          <button onClick={() => setIsModalOpen(true)} disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-medium transition shadow-md text-sm disabled:opacity-50">
            + Ajouter un produit
          </button>
        </div>
      </div>

      {/* FILTRES */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        <input type="text" placeholder="Rechercher un produit..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-orange-400">
          <option value="">Toutes les catégories</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input type="checkbox" checked={lowStockOnly} onChange={e => { setLowStockOnly(e.target.checked); setPage(1) }}
            className="rounded accent-orange-500" />
          Stock critique seulement
        </label>
        {(search || categoryFilter || lowStockOnly) && (
          <button onClick={() => { setSearch(''); setCategoryFilter(''); setLowStockOnly(false); setPage(1) }}
            className="text-sm text-gray-400 hover:text-red-500">✕ Réinitialiser</button>
        )}
      </div>

      {/* BULK ACTIONS */}
      {selected.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center gap-4">
          <span className="text-sm font-bold text-indigo-700">{selected.length} sélectionné(s)</span>
          <button onClick={() => setBulkConfirmOpen(true)} className="text-sm text-red-600 hover:text-red-800 font-medium">Supprimer</button>
          <button onClick={handleBulkToggle} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Basculer actif/inactif</button>
          <button onClick={() => setSelected([])} className="ml-auto text-xs text-gray-400 hover:text-gray-600">Annuler</button>
        </div>
      )}

      {/* LOADING */}
      {initialLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
          <p className="mt-4 text-gray-400 text-sm">Chargement...</p>
        </div>
      )}

      {/* ERROR */}
      {!initialLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
          <p className="text-red-600 mb-3">{error}</p>
          <button onClick={loadProducts} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Réessayer</button>
        </div>
      )}

      {/* TABLE */}
      {!initialLoading && !error && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-widest">
                  <th className="px-4 py-3">
                    <input type="checkbox" checked={selected.length === products.length && products.length > 0}
                      onChange={toggleAll} className="rounded" />
                  </th>
                  <th className="px-4 py-3 font-bold">Produit</th>
                  <th className="px-4 py-3 font-bold">Catégorie</th>
                  <th className="px-4 py-3 font-bold text-center">Stock</th>
                  <th className="px-4 py-3 font-bold">Prix</th>
                  <th className="px-4 py-3 font-bold text-center">Statut</th>
                  <th className="px-4 py-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {products.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    {loading ? 'Chargement...' : 'Aucun produit trouvé'}
                  </td></tr>
                ) : products.map(p => {
                  const qty = p.quantity ?? p.stock ?? 0
                  const isLowStock = qty < 5
                  return (
                    <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${selected.includes(p.id) ? 'bg-indigo-50/50' : ''} ${isLowStock ? 'border-l-2 border-l-orange-400' : ''}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.includes(p.id)}
                          onChange={() => toggleSelect(p.id)} className="rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={buildImageUrl(p.images)}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-100 flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; (e.target as HTMLImageElement).onerror = null }}
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 truncate max-w-[180px]">{p.name}</div>
                            <div className="text-[10px] text-gray-400 truncate max-w-[180px]">{p.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">
                          {typeof p.category === 'object' ? p.category?.name : p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{getStockBadge(qty)}</td>
                      <td className="px-4 py-3 font-bold text-orange-600">{Number(p.price).toFixed(2)} €</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleToggle(p)} title="Cliquer pour basculer"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors
                            ${p.is_active !== false ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.is_active !== false ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {p.is_active !== false ? 'Actif' : 'Inactif'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                        <button onClick={() => openEditModal(p)} className="text-blue-600 hover:underline text-xs font-medium">Éditer</button>
                        <button onClick={() => askDelete(p)} className="text-red-500 hover:underline text-xs font-medium">Supprimer</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {meta.last_page > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">Page {meta.current_page} / {meta.last_page} · {meta.total} produits</p>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">← Préc.</button>
                {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                  .filter(p => Math.abs(p - page) <= 2)
                  .map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`px-3 py-1.5 text-xs border rounded-lg ${p === page ? 'bg-orange-500 text-white border-orange-500' : 'hover:bg-gray-50'}`}>
                      {p}
                    </button>
                  ))}
                <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">Suiv. →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODALE CRÉATION */}
      {isModalOpen && (
        <ProductModal
          title="Nouveau Produit"
          onClose={() => { setIsModalOpen(false); resetForm() }}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
          onImageRemove={() => { setSelectedImage(null); setImagePreview('') }}
          loading={loading}
          submitLabel="Créer le produit"
        />
      )}

      {/* MODALE ÉDITION */}
      {isEditModalOpen && (
        <ProductModal
          title="Modifier le produit"
          onClose={() => { setIsEditModalOpen(false); setEditingProduct(null); resetForm() }}
          onSubmit={handleUpdate}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
          onImageRemove={() => { setSelectedImage(null); setImagePreview('') }}
          loading={loading}
          submitLabel="Enregistrer les modifications"
        />
      )}
    </div>
  )
}

/* ---- MODALE PRODUIT ---- */
function ProductModal({ title, onClose, onSubmit, formData, setFormData, categories, imagePreview, onImageChange, onImageRemove, loading, submitLabel }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={onSubmit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Image */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Image du produit</label>
            <input type="file" accept="image/*" onChange={onImageChange}
              className="w-full border border-gray-200 rounded-lg p-2 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
            {imagePreview && (
              <div className="relative mt-2 w-28">
                <img src={imagePreview} alt="Preview" className="w-28 h-20 object-cover rounded-lg border border-gray-200" />
                <button type="button" onClick={onImageRemove}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
              </div>
            )}
          </div>

          {/* Nom */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Nom du produit</label>
            <input required type="text" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })}
              className={inputCls} placeholder="ex: Smartphone 128GB" />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Description</label>
            <textarea required rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
              className={inputCls} placeholder="Décrivez le produit..." />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Catégorie</label>
            <select value={formData.categorie} onChange={e => setFormData({ ...formData, categorie: e.target.value })} className={inputCls}>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Stock</label>
            <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })}
              className={inputCls} placeholder="0" />
          </div>

          {/* Prix */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">Prix (€)</label>
            <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })}
              className={inputCls} placeholder="0.00" />
          </div>

          {/* Actions */}
          <div className="md:col-span-2 flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 text-sm">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-50 text-sm">
              {loading ? 'Chargement...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
