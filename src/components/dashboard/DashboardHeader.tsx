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
    return 'usuário'
  }

  const metadataName =
    typeof user.user_metadata?.name === 'string'
      ? user.user_metadata.name
      : typeof user.user_metadata?.full_name === 'string'
        ? user.user_metadata.full_name
        : ''
  const emailName = user.email?.split('@')[0] ?? ''
  const name = (metadataName || emailName || 'usuário').trim()

  return name.charAt(0).toLocaleUpperCase('pt-BR') + name.slice(1)
}

export function DashboardHeader() {
  const [displayName, setDisplayName] = useState('usuário')

  useEffect(() => {
    getCurrentUser()
      .then((user) => setDisplayName(getDisplayName(user)))
      .catch(() => setDisplayName('usuário'))
  }, [])

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">
          {getGreeting()}, {displayName}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Bem-vindo ao painel de controle das fichas técnicas.
        </p>
      </div>
      <div className="rounded border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
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
