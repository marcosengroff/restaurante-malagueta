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
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon

        return (
          <Link
            key={action.label}
            to={action.to}
            className="relative flex min-h-24 items-center gap-4 overflow-hidden rounded-xl border border-stone-100 bg-white px-5 py-4 text-sm font-semibold text-slate-800 shadow-[0_12px_34px_rgba(15,23,42,0.08)] transition hover:border-red-200 hover:bg-red-50/35"
          >
            <span className="absolute inset-x-0 bottom-0 h-1 bg-[#C62828]" />
            <span className="rounded-full bg-red-50 p-4 text-[#C62828]">
              <Icon size={22} aria-hidden="true" />
            </span>
            <span>{action.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
