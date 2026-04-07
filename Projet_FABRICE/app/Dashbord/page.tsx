import AdminDashboard from './Dashbord'
import { RouteGuard } from '../componets/auth/RouteGuard'

export default function AdminDashboardPage() {
  return (
    <RouteGuard requiredRole="admin">
      <AdminDashboard />
    </RouteGuard>
  )
}