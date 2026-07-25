export type RecipeStatus = 'completa' | 'incompleta' | 'sem-ingredientes'

const statusConfig = {
  completa: {
    label: 'Completa',
    className: 'bg-emerald-50 text-emerald-700',
  },
  incompleta: {
    label: 'Incompleta',
    className: 'bg-amber-50 text-amber-700',
  },
  'sem-ingredientes': {
    label: 'Sem ingredientes',
    className: 'bg-stone-100 text-slate-600',
  },
} satisfies Record<RecipeStatus, { label: string; className: string }>

export function RecipeStatusBadge({ status }: { status: RecipeStatus }) {
  const config = statusConfig[status]

  return (
    <span className={`rounded px-2 py-1 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  )
}
