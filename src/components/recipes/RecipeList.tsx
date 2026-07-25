import type { PratoAbaPlanilha } from '../../types/prato'
import { RecipeListItem, type RecipeMetrics } from './RecipeListItem'

type RecipeListProps = {
  pratos: Array<{
    prato: PratoAbaPlanilha
    metrics: RecipeMetrics
  }>
  hasSearch: boolean
  onOpen: (prato: PratoAbaPlanilha) => void
  onEdit: (prato: PratoAbaPlanilha) => void
  onToggleActive: (prato: PratoAbaPlanilha) => void
  onNewPrato: () => void
}

export function RecipeList({
  pratos,
  hasSearch,
  onOpen,
  onEdit,
  onToggleActive,
  onNewPrato,
}: RecipeListProps) {
  if (pratos.length === 0) {
    return (
      <div className="rounded border border-stone-200 bg-white p-8 text-center">
        <h3 className="text-base font-semibold text-slate-950">
          {hasSearch
            ? 'Nenhum prato encontrado para esta pesquisa.'
            : 'Nenhum prato cadastrado nesta categoria.'}
        </h3>
        {!hasSearch && (
          <button
            type="button"
            className="mt-4 rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
            onClick={onNewPrato}
          >
            Novo prato
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded border border-stone-200 bg-white shadow-sm">
      {pratos.map(({ prato, metrics }) => (
        <RecipeListItem
          key={prato.id}
          prato={prato}
          metrics={metrics}
          onOpen={() => onOpen(prato)}
          onEdit={() => onEdit(prato)}
          onToggleActive={() => onToggleActive(prato)}
        />
      ))}
    </div>
  )
}
