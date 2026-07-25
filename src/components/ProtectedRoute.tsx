import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getCurrentSession } from '../services/authService'

export function ProtectedRoute() {
  const location = useLocation()
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'anonymous'>(
    'loading',
  )

  useEffect(() => {
    getCurrentSession()
      .then((session) => {
        setStatus(session ? 'authenticated' : 'anonymous')
      })
      .catch(() => {
        setStatus('anonymous')
      })
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 text-sm text-slate-600">
        Verificando acesso...
      </div>
    )
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
