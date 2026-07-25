import { ChevronRight } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import type { PratoAbaPlanilha } from '../../types/prato'
import { formatCurrency } from '../../utils/formatters'
import { RecipeActionsMenu } from './RecipeActionsMenu'
import { RecipeStatusBadge, type RecipeStatus } from './RecipeStatusBadge'

export type RecipeMetrics = {
  ingredientsCount: number
  pendingCount: number
  totalCost: number
  status: RecipeStatus
}

type RecipeListItemProps = {
  prato: PratoAbaPlanilha
  metrics: RecipeMetrics
  onOpen: () => void
  onEdit: () => void
  onToggleActive: () => void
}

export function RecipeListItem({
  prato,
  metrics,
  onOpen,
  onEdit,
  onToggleActive,
}: RecipeListItemProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen()
    }
  }

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`Abrir ficha tecnica de ${prato.nome}`}
      className="group grid cursor-pointer gap-3 border-b border-stone-200 bg-white px-4 py-3 outline-none transition last:border-b-0 hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-red-700/25 md:grid-cols-[1fr_auto_auto_auto]"
      onClick={onOpen}
      onKeyDown={handleKeyDown}
    >
      <div className="min-w-0">
        <h3 className="truncate text-base font-semibold text-slate-950 group-hover:text-red-800">
          {prato.nome}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {formatIngredients(metrics.ingredientsCount)} ·{' '}
          {formatPending(metrics.pendingCount)}
        </p>
      </div>

      <div className="flex items-center md:justify-end">
        <RecipeStatusBadge status={metrics.status} />
      </div>

      <div className="flex items-center text-base font-semibold text-slate-950 md:min-w-28 md:justify-end">
        {formatCurrency(metrics.totalCost)}
      </div>

      <div className="flex items-center justify-between gap-1 md:justify-end">
        <ChevronRight
          className="text-slate-400 transition group-hover:text-red-700"
          size={20}
          aria-hidden="true"
        />
        <RecipeActionsMenu
          ativo={prato.ativo}
          onOpen={onOpen}
          onEdit={onEdit}
          onToggleActive={onToggleActive}
        />
      </div>
    </div>
  )
}

function formatIngredients(count: number) {
  return `${count} ingrediente${count === 1 ? '' : 's'}`
}

function formatPending(count: number) {
  if (count === 0) {
    return 'Nenhum item pendente'
  }

  return `${count} item${count === 1 ? '' : 's'} pendente${count === 1 ? '' : 's'}`
}
