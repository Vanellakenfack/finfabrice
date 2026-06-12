'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { RootState } from '@/Data/index'
import { logout } from '@/Data/slices/authSlice'
import { authService } from '../../services/auth.service'
import { vendorService, VendorStats } from '../../services/vendorService'
import { productService } from '../../services/productService'
import { categoryService } from '../../services/categoryService'
import { buildImageUrl } from '../../lib/imageUrl'
import ConfirmDialog from '@/componets/ui/ConfirmDialog'

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'En attente',  cls: 'bg-yellow-100 text-yellow-700' },
  paid:      { label: 'Payée',       cls: 'bg-blue-100 text-blue-700' },
  shipped:   { label: 'Expédiée',    cls: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'Livrée',      cls: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Annulée',     cls: 'bg-red-100 text-red-700' },
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white'

// ---- Mini bar chart SVG ----
function MiniBarChart({ data }: { data: { month: string; revenue: number }[] }) {
  if (!data.length) return <p className="text-gray-400 text-xs text-center py-8">Aucune donnée</p>
  const max = Math.max(...data.map(d => d.revenue), 1)
  const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((d, i) => {
        const h = Math.max((d.revenue / max) * 100, 2)
        const label = d.month.split('-')[1]
        const monthName = months[parseInt(label, 10) - 1] ?? label
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <span className="text-[9px] text-orange-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {d.revenue.toFixed(0)} €
            </span>
            <div className="w-full bg-orange-500 rounded-t-md transition-all hover:bg-orange-600" style={{ height: `${h}%` }} />
            <span className="text-[9px] text-gray-400 font-medium">{monthName}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function FournisseurDashboard() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth)

  const [activeTab, setActiveTab] = useState<'overview' | 'products'>('overview')
  const [stats, setStats] = useState<VendorStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Produits
  const [products, setProducts] = useState<any[]>([])
  const [productsMeta, setProductsMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [productsLoading, setProductsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Modale produit
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({ nom: '', categorie: '', price: '', stock: '', description: '' })
  const [confirmState, setConfirmState] = useState<{ open: boolean; productId: number | null; productName: string }>({ open: false, productId: null, productName: '' })

  // Redirect si non connecté
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login')
  }, [isLoading, isAuthenticated, router])

  // Charger les stats
  useEffect(() => {
    if (!isAuthenticated) return
    setStatsLoading(true)
    vendorService.getStats()
      .then(setStats)
      .catch(() => toast.error('Impossible de charger les statistiques'))
      .finally(() => setStatsLoading(false))
  }, [isAuthenticated])

  // Charger catégories
  useEffect(() => {
    categoryService.getAll().then((data: any[]) => {
      setCategories(Array.isArray(data) ? data : [])
    }).catch(() => {})
  }, [])

  // Charger mes produits
  const loadProducts = useCallback(async () => {
    if (!isAuthenticated) return
    setProductsLoading(true)
    try {
      const res = await vendorService.getMyProducts({ search, page })
      setProducts(res.data ?? [])
      if (res.meta) setProductsMeta(res.meta)
    } catch {
      toast.error('Impossible de charger vos produits')
    } finally {
      setProductsLoading(false)
    }
  }, [search, page, isAuthenticated])

  useEffect(() => {
    if (activeTab !== 'products') return
    const t = setTimeout(loadProducts, search ? 400 : 0)
    return () => clearTimeout(t)
  }, [loadProducts, activeTab])

  const handleLogout = async () => {
    try { await authService.logout() } catch {}
    dispatch(logout())
    router.push('/login')
  }

  // ---- Image ----
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

  const resetForm = () => {
    setFormData({ nom: '', categorie: categories[0]?.id ?? '', price: '', stock: '', description: '' })
    setSelectedImage(null)
    setImagePreview('')
  }

  // ---- CRUD ----
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
      }).then(() => { setIsModalOpen(false); resetForm(); loadProducts() }),
      {
        loading: 'Création...',
        success: 'Produit créé !',
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
      }).then(() => { setIsEditModalOpen(false); setEditingProduct(null); resetForm(); loadProducts() }),
      {
        loading: 'Modification...',
        success: 'Produit modifié !',
        error: (err: any) => err?.response?.data?.message || 'Impossible de modifier',
      }
    )
  }

  const askDelete = (product: any) =>
    setConfirmState({ open: true, productId: product.id, productName: product.name })

  const confirmDelete = async () => {
    const id = confirmState.productId!
    setConfirmState({ open: false, productId: null, productName: '' })
    await toast.promise(
      productService.delete(id).then(() => loadProducts()),
      { loading: 'Suppression...', success: 'Produit supprimé', error: 'Impossible de supprimer' }
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    )
  }

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? 'V'
  const kpis = stats?.kpis

  return (
    <div className="min-h-screen bg-gray-50">
      <ConfirmDialog
        open={confirmState.open}
        title="Supprimer ce produit ?"
        message={`"${confirmState.productName}" sera définitivement supprimé.`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmState({ open: false, productId: null, productName: '' })}
      />

      {/* SIDEBAR + LAYOUT */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white border-r border-gray-100 shadow-sm flex flex-col fixed left-0 top-0 bottom-0 z-20">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-sm">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{user?.name ?? 'Vendeur'}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'overview' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'products' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Mes Produits
              {kpis?.low_stock ? (
                <span className="ml-auto bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {kpis.low_stock}
                </span>
              ) : null}
            </button>
          </nav>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="ml-64 flex-1 p-8 min-h-screen">
          {/* ======================== OVERVIEW ======================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-black text-gray-900">Tableau de bord</h1>
                <p className="text-gray-500 text-sm mt-1">Bienvenue, {user?.name} — voici vos performances</p>
              </div>

              {/* KPI Cards */}
              {statsLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-24" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <KpiCard label="Produits actifs" value={kpis?.active_products ?? 0}
                    sub={`${kpis?.total_products ?? 0} au total`} color="green" icon="📦" />
                  <KpiCard label="Ventes ce mois" value={kpis?.monthly_sales ?? 0}
                    sub="articles vendus" color="blue" icon="📈" />
                  <KpiCard label="Revenu mensuel" value={`${(kpis?.monthly_revenue ?? 0).toFixed(2)} €`}
                    sub="mois en cours" color="orange" icon="💰" />
                  <KpiCard label="Commandes en attente" value={kpis?.pending_orders ?? 0}
                    sub="à traiter" color="yellow" icon="⏳" />
                  <KpiCard label="Stock critique" value={kpis?.low_stock ?? 0}
                    sub="produits < 5 unités" color="red" icon="⚠️" />
                  <KpiCard label="Produits totaux" value={kpis?.total_products ?? 0}
                    sub="dans votre catalogue" color="purple" icon="🗂️" />
                </div>
              )}

              <div className="grid lg:grid-cols-5 gap-6">
                {/* Graphique revenus */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-black text-gray-800 mb-4">Revenus mensuels</h2>
                  {statsLoading
                    ? <div className="h-28 bg-gray-100 rounded-xl animate-pulse" />
                    : <MiniBarChart data={stats?.monthly_revenue ?? []} />
                  }
                </div>

                {/* Top produits */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-black text-gray-800 mb-4">Top Produits</h2>
                  {statsLoading ? (
                    <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}</div>
                  ) : !stats?.top_products?.length ? (
                    <p className="text-gray-400 text-sm text-center py-6">Aucune vente pour l'instant</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.top_products.map((p, i) => (
                        <div key={p.id} className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                            i === 0 ? 'bg-yellow-100 text-yellow-700' :
                            i === 1 ? 'bg-gray-100 text-gray-600' :
                            i === 2 ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-400'
                          }`}>{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                            <p className="text-[11px] text-gray-400">{p.total_sold} vendus · Stock: {p.stock}</p>
                          </div>
                          <span className="text-sm font-black text-orange-600 whitespace-nowrap">
                            {Number(p.total_revenue).toFixed(0)} €
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Commandes récentes */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-black text-gray-800">Commandes récentes</h2>
                  <span className="text-xs text-gray-400">Commandes contenant vos produits</span>
                </div>
                {statsLoading ? (
                  <div className="p-5 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
                ) : !stats?.recent_orders?.length ? (
                  <p className="text-gray-400 text-sm text-center py-10">Aucune commande récente</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-[11px] text-gray-500 uppercase tracking-widest">
                        <th className="px-5 py-3 font-bold text-left">Référence</th>
                        <th className="px-5 py-3 font-bold text-left">Client</th>
                        <th className="px-5 py-3 font-bold text-left">Date</th>
                        <th className="px-5 py-3 font-bold text-right">Montant</th>
                        <th className="px-5 py-3 font-bold text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {stats.recent_orders.map(order => {
                        const s = STATUS_LABELS[order.statut] ?? { label: order.statut, cls: 'bg-gray-100 text-gray-600' }
                        return (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3 font-bold text-gray-700">{order.reference || `#${order.id}`}</td>
                            <td className="px-5 py-3 text-gray-600">{order.client}</td>
                            <td className="px-5 py-3 text-gray-400">{order.date}</td>
                            <td className="px-5 py-3 font-black text-orange-600 text-right">{Number(order.montant).toFixed(2)} €</td>
                            <td className="px-5 py-3 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${s.cls}`}>{s.label}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ======================== MES PRODUITS ======================== */}
          {activeTab === 'products' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-black text-gray-900">Mes Produits</h1>
                  <p className="text-gray-500 text-sm mt-1">{productsMeta.total} produits dans votre catalogue</p>
                </div>
                <button onClick={() => setIsModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md text-sm">
                  + Ajouter un produit
                </button>
              </div>

              {/* Recherche */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-3 items-center">
                <input type="text" placeholder="Rechercher dans mes produits..." value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400" />
                {search && (
                  <button onClick={() => { setSearch(''); setPage(1) }}
                    className="text-sm text-gray-400 hover:text-red-500">✕</button>
                )}
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-[11px] text-gray-500 uppercase tracking-widest">
                        <th className="px-5 py-3 font-bold text-left">Produit</th>
                        <th className="px-5 py-3 font-bold text-left">Catégorie</th>
                        <th className="px-5 py-3 font-bold text-center">Stock</th>
                        <th className="px-5 py-3 font-bold text-left">Prix</th>
                        <th className="px-5 py-3 font-bold text-center">Statut</th>
                        <th className="px-5 py-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {productsLoading ? (
                        <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">Chargement...</td></tr>
                      ) : products.length === 0 ? (
                        <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                          {search ? 'Aucun résultat' : 'Vous n\'avez pas encore de produits.'}
                        </td></tr>
                      ) : products.map(p => {
                        const qty = p.quantity ?? 0
                        return (
                          <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${qty < 5 ? 'border-l-2 border-l-orange-400' : ''}`}>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <img src={buildImageUrl(p.images)} alt={p.name}
                                  className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-100 flex-shrink-0"
                                  onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png'; (e.target as HTMLImageElement).onerror = null }} />
                                <div className="min-w-0">
                                  <p className="font-bold text-gray-900 truncate max-w-[160px]">{p.name}</p>
                                  <p className="text-[10px] text-gray-400 truncate max-w-[160px]">{p.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">
                                {typeof p.category === 'object' ? p.category?.name : p.category ?? '—'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-center">
                              {qty === 0
                                ? <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Épuisé</span>
                                : qty < 5
                                  ? <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{qty} restant{qty > 1 ? 's' : ''}</span>
                                  : <span className="text-gray-600 text-sm">{qty}</span>
                              }
                            </td>
                            <td className="px-5 py-3 font-black text-orange-600">{Number(p.price).toFixed(2)} €</td>
                            <td className="px-5 py-3 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                p.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${p.is_active !== false ? 'bg-green-500' : 'bg-gray-400'}`} />
                                {p.is_active !== false ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right space-x-3 whitespace-nowrap">
                              <button onClick={() => openEditModal(p)} className="text-blue-600 hover:underline text-xs font-medium">Modifier</button>
                              <button onClick={() => askDelete(p)} className="text-red-500 hover:underline text-xs font-medium">Supprimer</button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {productsMeta.last_page > 1 && (
                  <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400">Page {productsMeta.current_page} / {productsMeta.last_page} · {productsMeta.total} produits</p>
                    <div className="flex gap-1">
                      <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                        className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">← Préc.</button>
                      <button disabled={page >= productsMeta.last_page} onClick={() => setPage(p => p + 1)}
                        className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">Suiv. →</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modales */}
              {isModalOpen && (
                <ProductModal title="Nouveau produit" onClose={() => { setIsModalOpen(false); resetForm() }}
                  onSubmit={handleSubmit} formData={formData} setFormData={setFormData}
                  categories={categories} imagePreview={imagePreview} onImageChange={handleImageChange}
                  onImageRemove={() => { setSelectedImage(null); setImagePreview('') }}
                  loading={formLoading} submitLabel="Créer le produit" />
              )}
              {isEditModalOpen && (
                <ProductModal title="Modifier le produit" onClose={() => { setIsEditModalOpen(false); setEditingProduct(null); resetForm() }}
                  onSubmit={handleUpdate} formData={formData} setFormData={setFormData}
                  categories={categories} imagePreview={imagePreview} onImageChange={handleImageChange}
                  onImageRemove={() => { setSelectedImage(null); setImagePreview('') }}
                  loading={formLoading} submitLabel="Enregistrer" />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

/* ---- KPI Card ---- */
function KpiCard({ label, value, sub, color, icon }: {
  label: string; value: string | number; sub: string; color: string; icon: string
}) {
  const colors: Record<string, string> = {
    green:  'bg-green-50 text-green-700',
    blue:   'bg-blue-50 text-blue-700',
    orange: 'bg-orange-50 text-orange-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red:    'bg-red-50 text-red-700',
    purple: 'bg-purple-50 text-purple-700',
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-black text-gray-900 leading-tight">{value}</p>
        <p className="text-[11px] text-gray-400">{sub}</p>
      </div>
    </div>
  )
}

/* ---- Modale Produit ---- */
function ProductModal({ title, onClose, onSubmit, formData, setFormData, categories, imagePreview, onImageChange, onImageRemove, loading, submitLabel }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Image</label>
            <input type="file" accept="image/*" onChange={onImageChange}
              className="w-full border border-gray-200 rounded-xl p-2 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
            {imagePreview && (
              <div className="relative mt-2 w-24">
                <img src={imagePreview} alt="Preview" className="w-24 h-16 object-cover rounded-lg border border-gray-200" />
                <button type="button" onClick={onImageRemove}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Nom</label>
            <input required type="text" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })}
              className={inputCls} placeholder="ex: Smartphone 128GB" disabled={loading} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Description</label>
            <textarea required rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
              className={inputCls} placeholder="Décrivez le produit..." disabled={loading} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Catégorie</label>
              <select value={formData.categorie} onChange={e => setFormData({ ...formData, categorie: e.target.value })} className={inputCls} disabled={loading}>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Stock</label>
              <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })}
                className={inputCls} placeholder="0" disabled={loading} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Prix (€)</label>
            <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })}
              className={inputCls} placeholder="0.00" disabled={loading} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 text-sm disabled:opacity-50">
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
