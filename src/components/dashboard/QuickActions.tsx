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
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon

        return (
          <Link
            key={action.label}
            to={action.to}
            className="malaguetta-card relative flex min-h-18 items-center gap-3 overflow-hidden rounded-lg border border-stone-100 bg-white px-4 py-3 text-base font-semibold text-slate-800 shadow-[0_12px_34px_rgba(15,23,42,0.08)] transition hover:border-red-200 hover:bg-red-50/35 sm:min-h-24 sm:gap-4 sm:px-5 sm:py-4"
          >
            <span className="absolute left-0 top-4 h-6 w-1 rounded-r-full bg-[#C62828]" />
            <span className="absolute inset-x-0 bottom-0 h-1 bg-[#C62828]" />
            <span className="rounded-full bg-red-50 p-3 text-[#C62828] sm:p-4">
              <Icon size={20} aria-hidden="true" />
            </span>
            <span>{action.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
