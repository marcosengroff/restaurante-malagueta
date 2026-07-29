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

  if (name.toLocaleLowerCase('pt-BR').startsWith('marcos')) {
    return 'Marcos'
  }

  return name.charAt(0).toLocaleUpperCase('pt-BR') + name.slice(1)
}

export function DashboardHeader() {
  const [displayName, setDisplayName] = useState('Marcos')

  useEffect(() => {
    getCurrentUser()
      .then((user) => setDisplayName(getDisplayName(user)))
      .catch(() => setDisplayName('usuario'))
  }, [])

  return (
    <section className="relative -mx-3 -mt-5 min-h-[270px] overflow-hidden rounded-b-[28px] border-b border-red-950/10 bg-[#f7ebdf] px-6 pb-12 pt-8 shadow-[0_22px_55px_rgba(60,28,13,0.14)] sm:-mx-4 sm:px-9 lg:-mx-8 lg:-mt-6 lg:min-h-[290px] lg:rounded-b-[34px] lg:px-14 lg:pb-14 lg:pt-10">
      <img
        src="/dashboard-pizza-hero.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(253,246,238,0.98)_0%,rgba(253,246,238,0.92)_34%,rgba(253,246,238,0.35)_60%,rgba(253,246,238,0.05)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(73,30,14,0.08))]" />

      <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold leading-tight text-[#5e0f0f] sm:text-5xl lg:text-6xl">
            {getGreeting()}, {displayName}!
          </h1>
          <p className="mt-4 text-lg font-medium text-slate-800 sm:text-xl">
            Controle completo das fichas técnicas e custos.
          </p>
        </div>
      </div>
    </section>
  )
}
