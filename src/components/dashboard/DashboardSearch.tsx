import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { DashboardSearchItem } from '../../types/dashboard'

export function DashboardSearch({ items }: { items: DashboardSearchItem[] }) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR')

    if (!normalized) {
      return []
    }

    return items
      .filter((item) => item.nome.toLocaleLowerCase('pt-BR').includes(normalized))
      .slice(0, 8)
  }, [items, query])

  return (
    <div className="relative rounded-lg border border-stone-200 bg-white p-3 shadow-sm">
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-12 w-full rounded border border-stone-200 bg-stone-50 pl-12 pr-4 text-slate-950 outline-none focus:border-[#69704f] focus:ring-2 focus:ring-[#69704f]/15"
          placeholder="Pesquisar prato, ingrediente ou categoria..."
        />
      </div>

      {results.length > 0 && (
        <div className="absolute left-3 right-3 top-[68px] z-20 overflow-hidden rounded border border-stone-200 bg-white shadow-lg">
          {results.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className="block border-b border-stone-100 px-4 py-3 last:border-b-0 hover:bg-stone-50"
              onClick={() => setQuery('')}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{item.nome}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.detalhe}</p>
                </div>
                <span className="rounded bg-[#eef1e5] px-2 py-1 text-xs font-semibold text-[#55613d]">
                  {item.tipo}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
