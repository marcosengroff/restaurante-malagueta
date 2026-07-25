import {
  AlertTriangle,
  CalendarClock,
  ClipboardCheck,
  DollarSign,
  Salad,
  Utensils,
} from 'lucide-react'
import type { DashboardStats as DashboardStatsType } from '../../types/dashboard'
import { formatCurrency } from '../../utils/formatters'

type StatItem = {
  label: string
  value: string
  icon: typeof Utensils
  tone: string
}

export function DashboardStats({ stats }: { stats: DashboardStatsType }) {
  const items: StatItem[] = [
    {
      label: 'Pratos cadastrados',
      value: String(stats.totalPratos),
      icon: Utensils,
      tone: 'bg-[#eef1e5] text-[#55613d]',
    },
    {
      label: 'Ingredientes',
      value: String(stats.totalIngredientes),
      icon: Salad,
      tone: 'bg-stone-100 text-slate-600',
    },
    {
      label: 'Fichas completas',
      value: String(stats.fichasCompletas),
      icon: ClipboardCheck,
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Fichas incompletas',
      value: String(stats.fichasIncompletas),
      icon: AlertTriangle,
      tone: 'bg-orange-50 text-orange-700',
    },
    {
      label: 'Custo médio dos pratos',
      value: formatCurrency(stats.custoMedioPratos),
      icon: DollarSign,
      tone: 'bg-[#eef1e5] text-[#55613d]',
    },
    {
      label: 'Última atualização',
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
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <div
            key={item.label}
            className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-slate-500">
                {item.label}
              </p>
              <span className={`rounded p-2 ${item.tone}`}>
                <Icon size={17} aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {item.value}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
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
