'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { userService } from '../../../services/userService'
import { adminService } from '../../../services/adminService'
import ConfirmDialog from '../ui/ConfirmDialog'

function exportCsv(users) {
  const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Inscription']
  const rows = users.map(u => [
    u.id, u.name, u.email, u.phone ?? '', u.role, u.statut, u.date_inscription,
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'utilisateurs.csv'; a.click()
  URL.revokeObjectURL(url)
}

const ROLES_OPTIONS = [
  { value: '', label: 'Tous les rôles' },
  { value: 'admin', label: 'Admin' },
  { value: 'vendeur', label: 'Vendeur' },
  { value: 'acheteur', label: 'Client' },
]

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-700',
  vendeur: 'bg-orange-100 text-orange-700',
  acheteur: 'bg-blue-100 text-blue-700',
}

export default function AdminUsersManager() {
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [selected, setSelected] = useState([])
  const [confirmState, setConfirmState] = useState({ open: false, userId: null, userName: '' })

  // Filtres
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [page, setPage] = useState(1)

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', role: 'acheteur', statut: 'Actif', password: '',
  })

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      if (statutFilter) params.set('statut', statutFilter)
      params.set('page', String(page))

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/users?${params}`,
        { credentials: 'include' }
      )
      const json = await res.json()
      setUsers(json.users ?? [])
      if (json.meta) setMeta(json.meta)
      setSelected([])
    } catch (e) {
      setError('Impossible de charger les utilisateurs')
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [search, roleFilter, statutFilter, page])

  useEffect(() => {
    const t = setTimeout(loadUsers, search ? 400 : 0)
    return () => clearTimeout(t)
  }, [loadUsers])

  /* ---- TOGGLE ACTIF ---- */
  const handleToggle = async (user) => {
    try {
      const res = await adminService.toggleUser(user.id)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, statut: res.statut } : u))
      toast.success(`${user.name} → ${res.statut}`)
    } catch {
      toast.error('Impossible de changer le statut')
    }
  }

  /* ---- BULK ---- */
  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () => setSelected(selected.length === users.length ? [] : users.map(u => u.id))

  const handleBulkDelete = async () => {
    try {
      setLoading(true)
      await Promise.all(selected.map(id => userService.delete(id)))
      toast.success(`${selected.length} utilisateur(s) supprimé(s)`)
      loadUsers()
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally { setLoading(false) }
  }

  const handleBulkToggle = async () => {
    try {
      setLoading(true)
      await Promise.all(selected.map(id => adminService.toggleUser(id)))
      toast.success(`${selected.length} utilisateur(s) mis à jour`)
      loadUsers()
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally { setLoading(false) }
  }

  /* ---- CRUD ---- */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await toast.promise(
      userService.create({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password, role: formData.role }).then(() => {
        setIsModalOpen(false)
        setFormData({ name: '', email: '', phone: '', role: 'acheteur', statut: 'Actif', password: '' })
        loadUsers()
      }),
      { loading: 'Création...', success: 'Utilisateur créé !', error: (e) => e.response?.data?.message || 'Impossible de créer l\'utilisateur' }
    ).finally(() => setLoading(false))
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setFormData({ name: user.name, email: user.email, phone: user.phone || '', role: user.role, statut: user.statut, password: '' })
    setIsEditModalOpen(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    await toast.promise(
      userService.update(editingUser.id, { name: formData.name, email: formData.email, phone: formData.phone, role: formData.role, statut: formData.statut }).then(() => {
        setIsEditModalOpen(false)
        loadUsers()
      }),
      { loading: 'Enregistrement...', success: 'Utilisateur modifié !', error: (e) => e.response?.data?.message || 'Impossible de modifier l\'utilisateur' }
    ).finally(() => setLoading(false))
  }

  const askDelete = (user) => setConfirmState({ open: true, userId: user.id, userName: user.name })

  const confirmDelete = async () => {
    setConfirmState(s => ({ ...s, open: false }))
    await toast.promise(
      userService.delete(confirmState.userId).then(() => loadUsers()),
      { loading: 'Suppression...', success: 'Utilisateur supprimé', error: 'Impossible de supprimer l\'utilisateur' }
    )
  }

  return (
    <div className="space-y-5 relative">
      <ConfirmDialog
        open={confirmState.open}
        title={`Supprimer ${confirmState.userName} ?`}
        message="Cet utilisateur sera définitivement supprimé."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmState(s => ({ ...s, open: false }))}
      />

      {/* HEADER */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gestion des Utilisateurs</h2>
          <p className="text-xs text-gray-500">{meta.total} utilisateurs au total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => exportCsv(users)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            ↓ Exporter CSV
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-medium transition shadow-md text-sm">
            + Créer un utilisateur
          </button>
        </div>
      </div>

      {/* FILTRES */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
        />
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-orange-400">
          {ROLES_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={statutFilter} onChange={e => { setStatutFilter(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-orange-400">
          <option value="">Tous les statuts</option>
          <option value="Actif">Actif</option>
          <option value="Inactif">Inactif</option>
        </select>
        {(search || roleFilter || statutFilter) && (
          <button onClick={() => { setSearch(''); setRoleFilter(''); setStatutFilter(''); setPage(1) }}
            className="text-sm text-gray-400 hover:text-red-500 transition">✕ Réinitialiser</button>
        )}
      </div>

      {/* BULK ACTIONS */}
      {selected.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center gap-4">
          <span className="text-sm font-bold text-indigo-700">{selected.length} sélectionné(s)</span>
          <button onClick={handleBulkDelete} className="text-sm text-red-600 hover:text-red-800 font-medium">Supprimer</button>
          <button onClick={() => handleBulkToggle()} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Basculer statut</button>
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
          <button onClick={loadUsers} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Réessayer</button>
        </div>
      )}

      {/* TABLE */}
      {!initialLoading && !error && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-widest">
                <th className="px-4 py-3">
                  <input type="checkbox" checked={selected.length === users.length && users.length > 0}
                    onChange={toggleAll} className="rounded" />
                </th>
                <th className="px-4 py-3 font-bold">Utilisateur</th>
                <th className="px-4 py-3 font-bold">Rôle</th>
                <th className="px-4 py-3 font-bold text-center">Statut</th>
                <th className="px-4 py-3 font-bold">Inscription</th>
                <th className="px-4 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {users.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-12 text-center text-gray-400">
                  {loading ? 'Chargement...' : 'Aucun utilisateur trouvé'}
                </td></tr>
              ) : users.map(user => (
                <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${selected.includes(user.id) ? 'bg-indigo-50/50' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(user.id)}
                      onChange={() => toggleSelect(user.id)} className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${ROLE_COLORS[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {user.role === 'acheteur' ? 'Client' : user.role === 'vendeur' ? 'Vendeur' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggle(user)}
                      title="Cliquer pour basculer"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors
                        ${user.statut === 'Actif' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${user.statut === 'Actif' ? 'bg-green-500' : 'bg-red-400'}`} />
                      {user.statut}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(user.date_inscription).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => openEditModal(user)} className="text-blue-600 hover:underline text-xs font-medium">Éditer</button>
                    <button onClick={() => askDelete(user)} className="text-red-500 hover:underline text-xs font-medium">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          {meta.last_page > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">Page {meta.current_page} / {meta.last_page} · {meta.total} utilisateurs</p>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">← Préc.</button>
                {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                  .filter(p => Math.abs(p - page) <= 2)
                  .map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`px-3 py-1.5 text-xs border rounded-lg transition ${p === page ? 'bg-orange-500 text-white border-orange-500' : 'hover:bg-gray-50'}`}>
                      {p}
                    </button>
                  ))}
                <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">Suiv. →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODALE CRÉATION */}
      {isModalOpen && (
        <Modal title="Nouvel Utilisateur" onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nom complet">
              <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                className={inputCls} placeholder="Marc Kouassi" />
            </Field>
            <Field label="Email">
              <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                className={inputCls} placeholder="email@exemple.com" />
            </Field>
            <Field label="Téléphone">
              <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className={inputCls} placeholder="+225 01 23 45 67 89" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rôle">
                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className={inputCls}>
                  <option value="acheteur">Client</option>
                  <option value="vendeur">Vendeur</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
              <Field label="Statut">
                <select value={formData.statut} onChange={e => setFormData({ ...formData, statut: e.target.value })} className={inputCls}>
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </Field>
            </div>
            <Field label="Mot de passe">
              <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                className={inputCls} />
            </Field>
            <ModalActions onCancel={() => setIsModalOpen(false)} loading={loading} label="Créer le compte" />
          </form>
        </Modal>
      )}

      {/* MODALE ÉDITION */}
      {isEditModalOpen && (
        <Modal title="Modifier l'utilisateur" onClose={() => setIsEditModalOpen(false)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Field label="Nom complet">
              <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Email">
              <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Téléphone">
              <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rôle">
                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className={inputCls}>
                  <option value="acheteur">Client</option>
                  <option value="vendeur">Vendeur</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
              <Field label="Statut">
                <select value={formData.statut} onChange={e => setFormData({ ...formData, statut: e.target.value })} className={inputCls}>
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </Field>
            </div>
            <ModalActions onCancel={() => setIsEditModalOpen(false)} loading={loading} label="Enregistrer" />
          </form>
        </Modal>
      )}
    </div>
  )
}

/* ---- HELPERS ---- */
const inputCls = 'w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white'

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function ModalActions({ onCancel, loading, label }) {
  return (
    <div className="pt-3 flex gap-3">
      <button type="button" onClick={onCancel}
        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 text-sm">
        Annuler
      </button>
      <button type="submit" disabled={loading}
        className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-50 text-sm">
        {loading ? 'Chargement...' : label}
      </button>
    </div>
  )
}
