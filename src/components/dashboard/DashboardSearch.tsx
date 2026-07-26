import { SlidersHorizontal, Search } from 'lucide-react'
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
    <div className="relative overflow-hidden rounded-xl border border-stone-100 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.08)]">
      <span className="absolute left-0 top-4 h-6 w-1 rounded-r-full bg-[#C62828]" />
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-14 w-full rounded-lg border border-stone-200 bg-white pl-12 pr-4 text-slate-950 outline-none focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/15"
            placeholder="Pesquisar prato, ingrediente ou categoria..."
          />
        </div>
        <button
          type="button"
          className="flex h-14 w-14 items-center justify-center rounded-lg border border-stone-200 bg-white text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-[#C62828]"
          aria-label="Filtros"
        >
          <SlidersHorizontal size={20} aria-hidden="true" />
        </button>
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
