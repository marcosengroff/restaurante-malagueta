import { ClipboardList, FileSpreadsheet, Plus, Soup } from 'lucide-react'
import { Link } from 'react-router-dom'

const actions = [
  {
    label: 'Novo ingrediente',
    to: '/ingredientes',
    icon: Soup,
  },
  {
    label: 'Novo prato',
    to: '/pratos',
    icon: Plus,
  },
  {
    label: 'Nova ficha técnica',
    to: '/fichas-tecnicas',
    icon: ClipboardList,
  },
  {
    label: 'Importar planilha',
    to: '/importacao',
    icon: FileSpreadsheet,
  },
]

export function QuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon

        return (
          <Link
            key={action.label}
            to={action.to}
            className="group relative flex min-h-20 items-center gap-4 overflow-hidden rounded-2xl border border-white/80 bg-white/92 px-4 py-4 text-sm font-semibold text-slate-900 shadow-[0_14px_34px_rgba(58,35,20,0.09)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(58,35,20,0.14)] sm:min-h-28 sm:gap-5 sm:px-6 sm:py-5 sm:text-base"
          >
            <span className="absolute inset-x-3 bottom-0 h-1 rounded-t-full bg-[#C62828] shadow-[0_-4px_14px_rgba(198,40,40,0.28)]" />
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#C62828] transition group-hover:scale-105 group-hover:bg-red-100 sm:h-16 sm:w-16">
              <Icon size={24} strokeWidth={1.9} aria-hidden="true" />
            </span>
            <span className="leading-tight">{action.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
