'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import AdminProductsManager from '@/componets/admin/AdminProductsManager'
import AdminUsersManager from '@/componets/admin/AdminUsersManager'
import AdminCategoriesManager from '@/componets/admin/AdminCategoriesManager'
import AdminAnalytics from '@/componets/admin/AdminAnalytics'
import AdminChatInbox from '@/componets/admin/AdminChatInbox'
import { adminService, AdminStats } from '../../services/adminService'
import { authService } from '../../services/auth.service'
import { logout } from '../Data/slices/authSlice'
import { RootState } from '../Data'

/* -------- ICONS -------- */
const Icon = ({ d }: { d: string }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
)
const UsersIcon    = () => <Icon d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z" />
const ChartIcon    = () => <Icon d="M9 17v-6m4 6V7m4 10V4" />
const CogIcon      = () => <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
const CartIcon     = () => <Icon d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
const TagIcon      = () => <Icon d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
const BoxIcon      = () => <Icon d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
const AlertIcon    = () => <Icon d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
const HomeIcon     = () => <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
const LogoutIcon   = () => <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
}
const STATUS_FR: Record<string, string> = {
  pending: 'En attente', processing: 'En cours',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
}

/* -------- KPI CARD -------- */
function KpiCard({ label, value, sub, color, icon, alert }: {
  label: string; value: string | number; sub?: string;
  color: string; icon: React.ReactNode; alert?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${color} hover:shadow-md transition-shadow relative overflow-hidden`}>
      {alert && (
        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
      )}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-[10px] font-bold mt-1 uppercase tracking-widest opacity-70">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg opacity-80 ${color.replace('border-', 'bg-').replace('-600', '-50').replace('-500', '-50')}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

/* -------- DASHBOARD HOME -------- */
function DashboardHome({ stats, loading }: { stats: AdminStats | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
        <p className="mt-4 text-gray-400 text-sm">Chargement des statistiques...</p>
      </div>
    )
  }

  const kpis = stats?.kpis
  const lowStock = stats?.low_stock_products ?? []
  const activity = stats?.recent_activity ?? []

  return (
    <div className="space-y-8">
      {/* KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Utilisateurs"    value={kpis?.users ?? 0}     sub="Comptes actifs"    color="border-blue-600"   icon={<UsersIcon />} />
        <KpiCard label="Revenus"         value={`${(kpis?.revenue ?? 0).toFixed(0)} €`} sub="Commandes validées" color="border-green-600"  icon={<ChartIcon />} />
        <KpiCard label="Commandes"       value={kpis?.orders ?? 0}    sub={`${kpis?.pending_orders ?? 0} en attente`} color="border-indigo-600" icon={<CartIcon />} alert={(kpis?.pending_orders ?? 0) > 0} />
        <KpiCard label="Produits"        value={kpis?.products ?? 0}  sub="En catalogue"      color="border-orange-500" icon={<BoxIcon />} />
        <KpiCard label="Catégories"      value={kpis?.categories ?? 0} sub="Rayons actifs"    color="border-purple-500" icon={<TagIcon />} />
        <KpiCard label="Stock critique"  value={kpis?.low_stock ?? 0}  sub="Réapprovisionnement" color="border-red-500" icon={<AlertIcon />} alert={(kpis?.low_stock ?? 0) > 0} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ALERTES STOCK FAIBLE */}
        {lowStock.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-red-50">
              <AlertIcon />
              <h3 className="font-bold text-red-700 text-sm uppercase tracking-wide">Stock critique</h3>
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{lowStock.length}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{p.name}</p>
                    <p className="text-[11px] text-gray-400">{p.category ?? '—'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black ${p.quantity === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                      {p.quantity === 0 ? 'Épuisé' : `${p.quantity} restant${p.quantity > 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FIL D'ACTIVITÉ RÉCENTE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Activité récente</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {activity.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm">Aucune activité</p>
            ) : activity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                {item.type === 'order' ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
                      <CartIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.reference}</p>
                      <p className="text-[11px] text-gray-400">par {item.user} · {item.amount?.toFixed(2)} €</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_FR[item.status ?? ''] ?? item.status}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 text-green-600 font-bold text-sm">
                      {item.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-[11px] text-gray-400">{item.email}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      Nouveau compte
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------- MAIN DASHBOARD -------- */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const router = useRouter()
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch { /* ignore */ }
    dispatch(logout())
    router.push('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'

  useEffect(() => {
    if (activeTab !== 'Dashboard' && activeTab !== 'Analytics') return
    setStatsLoading(true)
    adminService.getStats()
      .then(setStats)
      .catch(() => {/* silently fail */})
      .finally(() => setStatsLoading(false))
  }, [activeTab])

  const menu = [
    { id: 'Dashboard',    name: 'Dashboard',    icon: <HomeIcon /> },
    { id: 'Categories',   name: 'Catégories',   icon: <TagIcon /> },
    { id: 'Produits',     name: 'Produits',      icon: <CartIcon /> },
    { id: 'Utilisateurs', name: 'Utilisateurs',  icon: <UsersIcon /> },
    { id: 'Analytics',    name: 'Analytics',     icon: <ChartIcon /> },
    { id: 'Chat',         name: 'Support Chat',  icon: <Icon d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> },
    { id: 'Paramètres',   name: 'Paramètres',    icon: <CogIcon /> },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':    return <DashboardHome stats={stats} loading={statsLoading} />
      case 'Categories':   return <AdminCategoriesManager />
      case 'Produits':     return <AdminProductsManager />
      case 'Utilisateurs': return <AdminUsersManager />
      case 'Analytics':    return <AdminAnalytics stats={stats} loading={statsLoading} />
      case 'Chat':         return <AdminChatInbox />
      case 'Paramètres':   return (
        <div className="bg-white p-10 rounded-xl shadow text-center text-gray-400 border-2 border-dashed">
          Configuration du système — à venir
        </div>
      )
      default: return null
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white hidden md:flex flex-col border-r border-white/5">
        <div className="p-6 mb-2">
          <div className="flex items-center gap-3 px-3 py-3 bg-white/5 rounded-2xl border border-white/10 shadow-xl">
            <div className="relative flex-shrink-0 w-10 h-10 overflow-hidden rounded-xl border border-white/20 bg-gray-800">
              <Image src="/Logo.png" fill style={{ objectFit: 'cover' }} alt="logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-white leading-none">
                ELITE<span className="text-orange-500">SHOP</span>
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
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group
                  ${active
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20'
                    : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
              >
                <span className={`${active ? 'scale-110' : 'group-hover:translate-x-1'} transition-transform duration-200`}>
                  {item.icon}
                </span>
                <span className="font-semibold text-sm">{item.name}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:text-red-400 transition-colors text-sm font-bold uppercase tracking-tighter"
          >
            <LogoutIcon />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{activeTab}</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">EliteShop Management</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-gray-900">{user?.name ?? 'Administrateur'}</span>
                <span className="text-[10px] text-green-500 font-medium">{user?.email ?? 'En ligne'}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-white shadow-sm flex items-center justify-center text-orange-600 font-bold text-sm">
                {initials}
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
