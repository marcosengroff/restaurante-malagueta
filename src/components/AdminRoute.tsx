import { Navigate, Outlet } from 'react-router-dom'
import { useAdminStatus } from '../hooks/useAdminStatus'

export function AdminRoute() {
  const { isAdmin, isLoadingAdmin } = useAdminStatus()

  if (isLoadingAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-base text-slate-600">
        Verificando permissao administrativa...
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/painel" replace />
  }

  return <Outlet />
}
