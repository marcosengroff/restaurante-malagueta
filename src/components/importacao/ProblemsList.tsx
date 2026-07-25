import type { ImportacaoProblema } from '../../types/importacao'

type ProblemsListProps = {
  problemas: ImportacaoProblema[]
}

export function ProblemsList({ problemas }: ProblemsListProps) {
  const groups = [
    ['erro', 'Erros impeditivos'],
    ['aviso', 'Avisos'],
    ['duplicidade', 'Possiveis duplicidades'],
    ['incompleto', 'Dados incompletos'],
    ['referencia', 'Referencias nao encontradas'],
  ] as const

  return (
    <div className="space-y-4">
      {groups.map(([type, title]) => {
        const items = problemas.filter((problem) => problem.tipo === type)

        return (
          <section key={type} className="rounded border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-slate-950">{title}</h3>
              <span className="rounded bg-stone-100 px-2 py-1 text-xs font-semibold text-slate-600">
                {items.length}
              </span>
            </div>
            {items.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">Nenhum item encontrado.</p>
            ) : (
              <div className="mt-3 max-h-64 overflow-auto">
                <ul className="space-y-2 text-sm text-slate-700">
                  {items.map((problem) => (
                    <li
                      key={problem.id}
                      className="rounded border border-stone-200 bg-stone-50 p-3"
                    >
                      <p className="font-medium text-slate-950">
                        {problem.mensagem}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {problem.aba ?? 'Arquivo'} · linha {problem.linha ?? '-'} ·{' '}
                        {problem.detalhe ?? problem.entidade}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
