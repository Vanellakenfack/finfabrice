'use client'

import { useState, useEffect } from 'react'
import { productService } from '../../../services/productService'
import { categoryService } from '../../../services/categoryService'
import { Notification, LoadingSpinner, ErrorMessage } from '../ui/Feedback'

export default function AdminProductsManager() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([]) // Catégories depuis l'API
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    nom: '', vendeur: '', categorie: '', price: '', ancien_price: '', 
    note: '5', label: 'Aucun', livraison: 'Gratuite', stock: '', date_ajout: today,
    description: ''
  })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Charger les produits et les catégories
  useEffect(() => {
    async function loadData() {
      try {
        setInitialLoading(true)
        setError(null)
        
        // Charger les produits
        const productsData = await productService.getAll()
        console.log('Produits reçus:', productsData);
        setProducts(Array.isArray(productsData) ? productsData : [])
        
        // Charger les catégories
        const categoriesData = await categoryService.getAll()
        console.log('Catégories reçues:', categoriesData);
        setCategories(Array.isArray(categoriesData) ? categoriesData : [])
        
        // Définir la première catégorie par défaut
        if (categoriesData && categoriesData.length > 0) {
          setFormData(prev => ({...prev, categorie: String(categoriesData[0].id) }))
        }
      } catch (e: any) {
        console.error('Erreur chargement données:', e)
        setError(e.response?.data?.message || 'Impossible de charger les données. Veuillez réessayer.')
      } finally {
        setInitialLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      const productData = {
        name: formData.nom,
        category_id: parseInt(formData.categorie),
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.stock) || 0,
        images: selectedImage
      }

      const newProduct = await productService.create(productData)
      setProducts(prev => [...prev, newProduct])
      setIsModalOpen(false)
      // Reset de l'image
      setSelectedImage(null)
      setImagePreview('')
      setFormData({ 
        nom: '', 
        vendeur: '', 
        categorie: categories.length > 0 ? categories[0].id : '', 
        price: '', 
        ancien_price: '', 
        note: '5', 
        label: 'Aucun', 
        livraison: 'Gratuite', 
        stock: '', 
        date_ajout: today,
        description: ''
      })
    } catch (error) {
      console.error("Erreur lors de la création:", error)
      alert("Impossible de créer le produit")
    } finally {
      setLoading(false)
    }
  }

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          const maxWidth = 1200
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, { type: 'image/jpeg' })
              resolve(compressedFile)
            } else reject(new Error('Compression failed'))
          }, 'image/jpeg', 0.7)
        }
      }
      reader.onerror = reject
    })
  }

  // Gestion d'une seule image
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const compressed = await compressImage(file)
        setSelectedImage(compressed)
        setImagePreview(URL.createObjectURL(compressed))
      } catch (error) {
        console.error('Erreur compression:', error)
      }
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview('')
  }

  const deleteProduct = async (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      try {
        await productService.delete(id)
        setProducts(prev => prev.filter(p => p.id !== id))
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
        alert("Impossible de supprimer le produit")
      }
    }
  }

  // 4. Modification d'un produit
  const openEditModal = (product: any) => {
    setEditingProduct(product)
    setFormData({
      nom: product.name,
      vendeur: product.seller?.name || '',
      categorie: product.category?.id || (categories.length > 0 ? categories[0].id : ''),
      price: product.price.toString(),
      ancien_price: '',
      note: '5',
      label: 'Aucun',
      livraison: 'Gratuite',
      stock: product.quantity?.toString() || '',
      date_ajout: today,
      description: product.description || ''
    })
    setIsEditModalOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      const productData = {
        name: formData.nom,
        category_id: parseInt(formData.categorie),
        description: "Produit modifié via le dashboard",
        price: parseFloat(formData.price),
        quantity: parseInt(formData.stock) || 0,
        is_active: true,
        images: selectedImage // AJOUT DE L'IMAGE
      }

      const updatedProduct = await productService.update(editingProduct.id, productData)
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p))
      setIsEditModalOpen(false)
      setEditingProduct(null)
      setSelectedImage(null)
      setImagePreview('')
      setFormData({ 
        nom: '', 
        vendeur: '', 
        categorie: categories.length > 0 ? categories[0].id : '', 
        price: '', 
        ancien_price: '', 
        note: '5', 
        label: 'Aucun', 
        livraison: 'Gratuite', 
        stock: '', 
        date_ajout: today,
        description: ''
      })
    } catch (error) {
      console.error("Erreur lors de la modification:", error)
      alert("Impossible de modifier le produit")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-2 relative">
      {/* Notification */}
      {notification && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(null)} 
        />
      )}

      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Catalogue Produits</h2>
        <button 
          onClick={() => setIsModalOpen(true)} 
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
        >
          + Ajouter un produit
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-[11px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4 text-center">description </th>
                <th className="px-6 py-4 text-center">Badge</th>
                <th className="px-6 py-4">price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {(() => {
                const startIndex = (currentPage - 1) * itemsPerPage
                const endIndex = startIndex + itemsPerPage
                const paginatedProducts = products.slice(startIndex, endIndex)
                
                return paginatedProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Debug des images */}
                      
                      {/* Afficher la première image si disponible */}
                      {p.images && p.images.length > 0 ? (
                        <img 
                          src={p.images[0]} 
                          alt={p.name}
                          className="w-10 h-10 rounded object-cover bg-gray-50 border border-gray-100"
                          onError={(e) => {
                            console.error('Erreur de chargement image:', p.images[0]);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 border border-gray-100 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No img</span>
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900">{p.name}</div>
                        <div className="text-[11px] text-gray-500">Par: {p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase"><span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">
                {typeof p.category === 'object' ? p.category.name : p.category}
              </span></span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500 text-xs">{p.description}</td>
                  <td className="px-6 py-4 text-center">
                    {p.label !== "Aucun" && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase ${
                        p.label === 'Nouveau' ? 'bg-green-500' : p.label === 'Promo' ? 'bg-red-500' : 'bg-orange-500'
                      }`}>{p.label}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-orange-600">{p.price.toFixed(2)}€</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button 
                      onClick={() => openEditModal(p)}
                      className="text-blue-600 hover:underline text-xs font-bold"
                    >
                      Éditer
                    </button>
                    <button 
                      onClick={() => deleteProduct(p.id)} 
                      className="text-red-600 hover:underline text-xs font-bold"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
              })()}
            </tbody>
          </table>
          
          {/* Pagination */}
          {products.length > itemsPerPage && (
            <div className="flex justify-center items-center gap-2 p-4 border-t">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
              >
                ← Précédent
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} / {Math.ceil(products.length / itemsPerPage)}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(products.length / itemsPerPage), prev + 1))}
                disabled={currentPage >= Math.ceil(products.length / itemsPerPage)}
                className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
              >
                Suivant →
              </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-800">Nouveau Produit</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Upload d'une seule image */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Image du produit</label>
                <div className="space-y-4">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                  
                  {/* Preview de l'image */}
                  {imagePreview && (
                    <div className="relative group w-32">
                      <img 
                        src={imagePreview} 
                        alt="Preview"
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nom du produit</label>
                <input required type="text" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" placeholder="Décrivez le produit..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Catégorie</label>
                <select value={formData.categorie} onChange={(e) => setFormData({...formData, categorie: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Date d'ajout</label>
                <input required type="date" value={formData.date_ajout} onChange={(e) => setFormData({...formData, date_ajout: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Vendeur</label>
                <input required type="text" value={formData.vendeur} onChange={(e) => setFormData({...formData, vendeur: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Note (1 à 5)</label>
                <select value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                  <option value="5">5 Étoiles</option>
                  <option value="4">4 Étoiles</option>
                  <option value="3">3 Étoiles</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">price (€)</label>
                <input required type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Stock (quantité)</label>
                <input required type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Badge</label>
                <select value={formData.label} onChange={(e) => setFormData({...formData, label: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                  <option>Aucun</option>
                  <option>Nouveau</option>
                  <option>Promo</option>
                  <option>Meilleure vente</option>
                </select>
              </div>
              <div className="md:col-span-2 pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-bold shadow-lg hover:bg-orange-600 transition-all">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DE MODIFICATION */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-800">Modifier un Produit</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Image du produit</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border border-gray-200 rounded-lg p-2 text-sm" />
                {imagePreview && (
                  <div className="mt-2 relative w-32">
                    <img src={imagePreview} alt="Preview" className="w-full h-24 object-cover rounded-lg" />
                    <button type="button" onClick={removeImage} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6">×</button>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nom du produit</label>
                <input required type="text" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Catégorie</label>
                <select value={formData.categorie} onChange={(e) => setFormData({...formData, categorie: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Prix</label>
                <input  type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Stock</label>
                <input  type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="md:col-span-2 pt-4 flex gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg hover:bg-blue-600 transition-all">Modifier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}