import { CalendarDays } from 'lucide-react'
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
    <section className="relative -mx-3 -mt-5 overflow-hidden rounded-b-[28px] border-b border-red-950/10 bg-[#f7ebdf] px-6 pb-28 pt-14 shadow-[0_22px_55px_rgba(60,28,13,0.14)] sm:-mx-4 sm:px-9 lg:-mx-8 lg:-mt-6 lg:rounded-b-[34px] lg:px-14 lg:pb-32 lg:pt-20">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(253,246,238,0.97)_0%,rgba(253,246,238,0.86)_36%,rgba(253,246,238,0.28)_58%,rgba(253,246,238,0)_100%)]" />
      <img
        src="/login-pizza-panel.png"
        alt=""
        className="absolute inset-y-0 right-0 h-full w-[72%] object-cover object-center"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(255,255,255,0.10),transparent_34%),linear-gradient(180deg,rgba(28,12,8,0.08),rgba(28,12,8,0.0)_44%,rgba(28,12,8,0.10))]" />

      <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold leading-tight text-[#5e0f0f] sm:text-5xl lg:text-6xl">
            {getGreeting()}, {displayName}! <span className="text-4xl sm:text-5xl">👋</span>
          </h1>
          <p className="mt-4 text-lg font-medium text-slate-800 sm:text-xl">
            Controle completo das fichas técnicas e custos.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-5 py-4 text-sm font-semibold text-slate-900 shadow-[0_18px_45px_rgba(60,28,13,0.16)] backdrop-blur">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#C62828]">
            <CalendarDays size={21} aria-hidden="true" />
          </span>
          <span>
            {new Intl.DateTimeFormat('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            }).format(new Date())}
          </span>
        </div>
      </div>
    </section>
  )
}
