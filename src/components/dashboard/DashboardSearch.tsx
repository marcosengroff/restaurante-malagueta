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
    <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white/88 p-3 shadow-[0_18px_45px_rgba(58,35,20,0.10)] backdrop-blur">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
            size={24}
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-16 w-full rounded-xl border border-stone-200/90 bg-white pl-14 pr-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#C62828] focus:ring-4 focus:ring-[#C62828]/10"
            placeholder="Pesquisar prato, ingrediente ou categoria..."
          />
        </div>
        <button
          type="button"
          className="flex h-16 w-16 items-center justify-center rounded-xl border border-stone-200/90 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-[#C62828]"
          aria-label="Filtros"
        >
          <SlidersHorizontal size={24} aria-hidden="true" />
        </button>
      </div>

      {results.length > 0 && (
        <div className="absolute left-3 right-3 top-[82px] z-20 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl">
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
