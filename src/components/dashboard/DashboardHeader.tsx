import { useEffect, useState } from 'react'
import { getCurrentUser } from '../../services/authService'

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) {
    return 'Bom dia'
  }

  if (hour < 18) {
    return 'Boa tarde'
  }

  return 'Boa noite'
}

function getDisplayName(user: Awaited<ReturnType<typeof getCurrentUser>> | null) {
  if (!user) {
    return 'usuario'
  }

  const metadataName =
    typeof user.user_metadata?.name === 'string'
      ? user.user_metadata.name
      : typeof user.user_metadata?.full_name === 'string'
        ? user.user_metadata.full_name
        : ''
  const emailName = user.email?.split('@')[0] ?? ''
  const name = (metadataName || emailName || 'usuario').trim().split(/\s+/)[0]

  return name.charAt(0).toLocaleUpperCase('pt-BR') + name.slice(1)
}

export function DashboardHeader() {
  const [displayName, setDisplayName] = useState('usuario')

  useEffect(() => {
    getCurrentUser()
      .then((user) => setDisplayName(getDisplayName(user)))
      .catch(() => setDisplayName('usuario'))
  }, [])

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
          {getGreeting()}, {displayName}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Bem-vindo ao painel de controle das fichas tecnicas.
        </p>
      </div>
      <div className="w-full rounded border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm sm:w-auto">
        {new Intl.DateTimeFormat('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }).format(new Date())}
      </div>
    </div>
  )
}
