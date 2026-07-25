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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon

        return (
          <Link
            key={action.label}
            to={action.to}
            className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-[#69704f]/40 hover:bg-[#f7f8f2]"
          >
            <span className="rounded bg-[#eef1e5] p-2 text-[#55613d]">
              <Icon size={17} aria-hidden="true" />
            </span>
            {action.label}
          </Link>
        )
      })}
    </div>
  )
}
