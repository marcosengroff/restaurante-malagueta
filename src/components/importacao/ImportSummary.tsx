import type { ImportacaoResumo } from '../../types/importacao'

type ImportSummaryProps = {
  resumo: ImportacaoResumo
}

const cards = [
  ['categoriasIngredientes', 'Categorias de ingredientes'],
  ['ingredientes', 'Ingredientes'],
  ['categoriasPratos', 'Categorias de pratos'],
  ['pratos', 'Pratos'],
  ['itensFichaTecnica', 'Itens de ficha tecnica'],
  ['ignorados', 'Linhas ignoradas'],
  ['avisos', 'Avisos'],
  ['erros', 'Erros'],
] as const

export function ImportSummary({ resumo }: ImportSummaryProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([key, label]) => (
        <div key={key} className="malaguetta-card rounded border border-stone-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {resumo[key]}
          </p>
        </div>
      ))}
    </div>
  )
}
