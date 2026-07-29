import {
  AlertTriangle,
  CalendarClock,
  ClipboardCheck,
  DollarSign,
  Salad,
  Utensils,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { DashboardStats as DashboardStatsType } from '../../types/dashboard'
import { formatCurrency } from '../../utils/formatters'

type StatItem = {
  label: string
  value: string
  icon: typeof Utensils
  tone: string
  accent: string
  growth?: string
  to?: string
}

export function DashboardStats({
  stats,
  primeiraFichaIncompletaId,
}: {
  stats: DashboardStatsType
  primeiraFichaIncompletaId?: string
}) {
  const items: StatItem[] = [
    {
      label: 'Pratos cadastrados',
      value: String(stats.totalPratos),
      icon: Utensils,
      tone: 'bg-[#eef1e5] text-[#55613d]',
      accent: 'bg-[#C62828]',
      growth: '+8 este mês',
      to: '/pratos',
    },
    {
      label: 'Ingredientes',
      value: String(stats.totalIngredientes),
      icon: Salad,
      tone: 'bg-stone-100 text-slate-600',
      accent: 'bg-[#C62828]',
      growth: '+5 este mês',
      to: '/ingredientes',
    },
    {
      label: 'Fichas completas',
      value: String(stats.fichasCompletas),
      icon: ClipboardCheck,
      tone: 'bg-emerald-50 text-emerald-700',
      accent: 'bg-[#2E7D32]',
      growth: '+7 este mês',
    },
    ...(stats.fichasIncompletas > 0
      ? [
          {
            label: 'Fichas incompletas',
            value: String(stats.fichasIncompletas),
            icon: AlertTriangle,
            tone: 'bg-orange-50 text-orange-700',
            accent: 'bg-orange-500',
            growth: 'Atenção necessária',
            to: primeiraFichaIncompletaId ? '/fichas-tecnicas' : undefined,
          },
        ]
      : []),
    {
      label: 'Custo medio dos pratos',
      value: formatCurrency(stats.custoMedioPratos),
      icon: DollarSign,
      tone: 'bg-[#eef1e5] text-[#55613d]',
      accent: 'bg-[#2E7D32]',
      growth: 'Média atual',
    },
    {
      label: 'Ultima atualizacao',
      value: stats.ultimaAtualizacao
        ? new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(stats.ultimaAtualizacao))
        : '-',
      icon: CalendarClock,
      tone: 'bg-stone-100 text-slate-600',
      accent: 'bg-blue-600',
      growth: 'Hoje',
    },
  ]

  const visibleItems = items.filter(
    (item) =>
      item.label !== 'Fichas incompletas' &&
      item.label !== 'Ultima atualizacao',
  )

  return (
    <div className="relative z-10 -mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {visibleItems.map((item) => {
        const Icon = item.icon
        const content = (
          <>
            <span className={`absolute left-0 top-1/2 h-9 w-1 -translate-y-1/2 rounded-r-full ${item.accent}`} />
            <div className="flex items-start gap-4">
              <span className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${item.tone}`}>
                <Icon size={28} strokeWidth={1.9} aria-hidden="true" />
              </span>
              <div className="min-w-0 pt-1">
                <p className="text-[10px] font-bold uppercase leading-4 tracking-[0.02em] text-slate-700">
                {item.label}
                </p>
                <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
                  {item.value}
                </p>
                {item.growth && (
                  <p
                    className={`mt-4 text-xs font-semibold ${
                      item.growth.includes('Atenção')
                        ? 'text-red-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    {item.growth}
                    {!item.growth.includes('Atenção') &&
                      !item.growth.includes('Hoje') &&
                      !item.growth.includes('Média') &&
                      ' ↗'}
                  </p>
                )}
              </div>
            </div>
          </>
        )

        if (item.to) {
          return (
            <Link
              key={item.label}
              to={item.to}
              className="group relative min-h-40 overflow-hidden rounded-2xl border border-white/80 bg-white/92 p-5 shadow-[0_22px_50px_rgba(58,35,20,0.14)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(58,35,20,0.18)]"
            >
              {content}
            </Link>
          )
        }

        return (
          <div
            key={item.label}
            className="relative min-h-40 overflow-hidden rounded-2xl border border-white/80 bg-white/92 p-5 shadow-[0_22px_50px_rgba(58,35,20,0.14)] backdrop-blur"
          >
            {content}
          </div>
        )
      })}
    </div>
  )
}

export function DashboardStatsSkeleton() {
  return (
    <div className="relative z-10 -mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
        >
          <div className="h-3 w-28 rounded bg-stone-200" />
          <div className="mt-6 h-8 w-20 rounded bg-stone-200" />
        </div>
      ))}
    </div>
  )
}
