import { AlertTriangle, ArrowRight, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'
import type {
  DashboardCategory,
  DashboardRecipe,
  DashboardUpdate,
} from '../../types/dashboard'
import { formatCurrency, formatDate } from '../../utils/formatters'

export function PendingRecipesCard({ recipes }: { recipes: DashboardRecipe[] }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle size={18} className="text-orange-600" aria-hidden="true" />
        <h2 className="font-semibold text-slate-950">
          Fichas que precisam de atenção
        </h2>
      </div>

      {recipes.length === 0 ? (
        <p className="rounded bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Todas as fichas estão completas.
        </p>
      ) : (
        <div className="space-y-2">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              to={`/pratos/${recipe.id}/ficha-tecnica`}
              className="flex items-center justify-between gap-3 rounded border border-stone-100 px-3 py-3 hover:bg-stone-50"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-950">{recipe.nome}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {recipe.pendencias} pendência{recipe.pendencias === 1 ? '' : 's'}
                </p>
              </div>
              <span className="rounded bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                Incompleta
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export function ExpensiveRecipesCard({ recipes }: { recipes: DashboardRecipe[] }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <DollarSign size={18} className="text-[#69704f]" aria-hidden="true" />
        <h2 className="font-semibold text-slate-950">Pratos com maior custo</h2>
      </div>

      {recipes.length === 0 ? (
        <p className="rounded bg-stone-50 p-4 text-sm text-slate-600">
          Nenhum prato cadastrado.
        </p>
      ) : (
        <div className="space-y-2">
          {recipes.map((recipe, index) => (
            <Link
              key={recipe.id}
              to={`/pratos/${recipe.id}/ficha-tecnica`}
              className="grid grid-cols-[32px_1fr_auto] items-center gap-3 rounded px-2 py-2 hover:bg-stone-50"
            >
              <span className="text-sm font-semibold text-slate-400">
                {index + 1}
              </span>
              <span className="truncate font-semibold text-slate-950">
                {recipe.nome}
              </span>
              <span className="font-semibold text-slate-950">
                {formatCurrency(recipe.custoTotal)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export function CategoriesCard({ categories }: { categories: DashboardCategory[] }) {
  const max = Math.max(1, ...categories.map((category) => category.pratos))

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-semibold text-slate-950">Categorias</h2>
      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.id}>
            <div className="mb-1 flex justify-between gap-3 text-sm">
              <span className="font-semibold text-slate-800">{category.nome}</span>
              <span className="text-slate-500">
                {category.pratos} prato{category.pratos === 1 ? '' : 's'}
              </span>
            </div>
            <div className="h-2 rounded bg-stone-100">
              <div
                className="h-2 rounded bg-[#69704f]"
                style={{ width: `${(category.pratos / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function RecentUpdatesCard({ updates }: { updates: DashboardUpdate[] }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-semibold text-slate-950">Últimas alterações</h2>
      {updates.length === 0 ? (
        <p className="rounded bg-stone-50 p-4 text-sm text-slate-600">
          Nenhuma alteração encontrada.
        </p>
      ) : (
        <div className="space-y-3">
          {updates.map((update) => (
            <div
              key={update.id}
              className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3 last:border-b-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-950">{update.nome}</p>
                <p className="mt-1 text-xs text-slate-500">{update.tipo}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                {formatDate(update.data)}
                <ArrowRight size={14} aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
