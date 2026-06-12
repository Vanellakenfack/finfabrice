'use client'

import { AdminStats, MonthlyRevenue } from '../../../services/adminService'

const STATUS_FR: Record<string, string> = {
  pending: 'En attente', processing: 'En cours',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
}
const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', processing: '#3b82f6',
  shipped: '#6366f1', delivered: '#22c55e', cancelled: '#ef4444',
}

/* ---- BAR CHART REVENUS ---- */
function RevenueBarChart({ data }: { data: MonthlyRevenue[] }) {
  if (!data || data.length === 0) {
    return <p className="text-center py-12 text-gray-400 text-sm">Aucune donnée disponible</p>
  }

  const maxRevenue = Math.max(...data.map(d => Number(d.revenue)), 1)
  const months = data.map(d => {
    const [year, month] = d.month.split('-')
    const date = new Date(Number(year), Number(month) - 1)
    return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
  })

  const H = 180
  const barW = Math.min(48, Math.floor(400 / data.length) - 8)

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-end gap-3 min-w-max px-2 pb-2" style={{ height: H + 48 }}>
        {data.map((d, i) => {
          const h = Math.max(4, (Number(d.revenue) / maxRevenue) * H)
          return (
            <div key={i} className="flex flex-col items-center gap-1 group">
              <div className="relative flex flex-col items-center">
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {Number(d.revenue).toFixed(0)} € · {d.orders_count} cmd
                </div>
                <div
                  className="rounded-t-md bg-gradient-to-t from-orange-600 to-orange-400 transition-all duration-500 group-hover:from-orange-700 group-hover:to-orange-500"
                  style={{ width: barW, height: h }}
                />
              </div>
              <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{months[i]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---- DONUT COMMANDES PAR STATUT ---- */
function OrdersDonut({ ordersByStatus }: { ordersByStatus: Record<string, number> }) {
  const entries = Object.entries(ordersByStatus).filter(([, v]) => v > 0)
  if (entries.length === 0) {
    return <p className="text-center py-12 text-gray-400 text-sm">Aucune commande</p>
  }

  const total = entries.reduce((s, [, v]) => s + v, 0)
  const R = 60; const cx = 80; const cy = 80; const stroke = 24

  let cumulAngle = -Math.PI / 2
  const arcs = entries.map(([status, count]) => {
    const angle = (count / total) * 2 * Math.PI
    const x1 = cx + R * Math.cos(cumulAngle)
    const y1 = cy + R * Math.sin(cumulAngle)
    cumulAngle += angle
    const x2 = cx + R * Math.cos(cumulAngle)
    const y2 = cy + R * Math.sin(cumulAngle)
    const large = angle > Math.PI ? 1 : 0
    const color = STATUS_COLORS[status] ?? '#9ca3af'
    return { status, count, x1, y1, x2, y2, large, color, angle }
  })

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {arcs.map((a, i) => (
          <path key={i}
            d={`M ${a.x1} ${a.y1} A ${R} ${R} 0 ${a.large} 1 ${a.x2} ${a.y2}`}
            fill="none"
            stroke={a.color}
            strokeWidth={stroke}
            strokeLinecap="butt"
          />
        ))}
        <text x="80" y="75" textAnchor="middle" fontSize="20" fontWeight="800" fill="#111">{total}</text>
        <text x="80" y="92" textAnchor="middle" fontSize="9" fill="#9ca3af" fontWeight="600">COMMANDES</text>
      </svg>
      <div className="space-y-2">
        {arcs.map((a) => (
          <div key={a.status} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: a.color }} />
            <span className="text-gray-600">{STATUS_FR[a.status] ?? a.status}</span>
            <span className="font-bold text-gray-900 ml-auto pl-4">{a.count}</span>
            <span className="text-[11px] text-gray-400">({Math.round((a.count / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- HORIZONTAL BAR ---- */
function HBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="font-bold text-gray-900">{value.toFixed(0)} €</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

/* ---- MAIN ---- */
export default function AdminAnalytics({ stats, loading }: { stats: AdminStats | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
        <p className="mt-4 text-gray-400 text-sm">Chargement des analytics...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white p-10 rounded-xl shadow text-center text-gray-400 border-2 border-dashed">
        Impossible de charger les données analytics.
      </div>
    )
  }

  const { monthly_revenue, orders_by_status, kpis, low_stock_products } = stats

  // Revenus par mois pour les barres horizontales (top 3 mois)
  const topMonths = [...(monthly_revenue ?? [])]
    .sort((a, b) => Number(b.revenue) - Number(a.revenue))
    .slice(0, 3)
  const maxMonthRevenue = topMonths[0] ? Number(topMonths[0].revenue) : 1

  const colors = ['#f97316', '#6366f1', '#22c55e']

  return (
    <div className="space-y-6">
      {/* KPIs rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenus totaux', value: `${(kpis.revenue ?? 0).toFixed(0)} €`, color: 'text-green-600' },
          { label: 'Commandes', value: kpis.orders, color: 'text-indigo-600' },
          { label: 'En attente', value: kpis.pending_orders, color: 'text-yellow-600' },
          { label: 'Produits actifs', value: kpis.products, color: 'text-orange-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
            <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Graphique barres revenus */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-700 mb-1">Revenus mensuels</h3>
          <p className="text-xs text-gray-400 mb-4">6 derniers mois (commandes non annulées)</p>
          <RevenueBarChart data={monthly_revenue ?? []} />
        </div>

        {/* Donut commandes par statut */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-700 mb-1">Répartition des commandes</h3>
          <p className="text-xs text-gray-400 mb-4">Par statut · toutes périodes</p>
          <OrdersDonut ordersByStatus={orders_by_status ?? {}} />
        </div>

        {/* Top mois */}
        {topMonths.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-700 mb-1">Meilleurs mois</h3>
            <p className="text-xs text-gray-400 mb-5">Top 3 par chiffre d'affaires</p>
            <div className="space-y-4">
              {topMonths.map((m, i) => {
                const [year, month] = m.month.split('-')
                const label = new Date(Number(year), Number(month) - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                return (
                  <HBar key={m.month} label={label} value={Number(m.revenue)} max={maxMonthRevenue} color={colors[i]} />
                )
              })}
            </div>
          </div>
        )}

        {/* Stock critique */}
        {low_stock_products && low_stock_products.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-700">Produits en stock critique</h3>
              <span className="text-[11px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{low_stock_products.length} articles</span>
            </div>
            <div className="divide-y divide-gray-50">
              {low_stock_products.map(p => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                    <p className="text-[11px] text-gray-400">{p.category ?? '—'} · {Number(p.price).toFixed(2)} €</p>
                  </div>
                  <div className={`text-sm font-black ${p.quantity === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                    {p.quantity === 0 ? 'ÉPUISÉ' : `${p.quantity} restant${p.quantity > 1 ? 's' : ''}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
