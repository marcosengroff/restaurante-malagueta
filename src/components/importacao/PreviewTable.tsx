import { useMemo, useState } from 'react'
import type { ImportacaoAcao, ImportacaoRegistroBase } from '../../types/importacao'

type PreviewTableProps = {
  title: string
  rows: ImportacaoRegistroBase[]
}

const actions: Array<ImportacaoAcao | 'todos'> = [
  'todos',
  'criar',
  'reutilizar',
  'atualizar',
  'ignorar',
  'revisar',
  'erro',
]

export function PreviewTable({ title, rows }: PreviewTableProps) {
  const [search, setSearch] = useState('')
  const [action, setAction] = useState<ImportacaoAcao | 'todos'>('todos')

  const filteredRows = useMemo(
    () =>
      rows
        .filter((row) =>
          row.nome.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')),
        )
        .filter((row) => action === 'todos' || row.acao === action)
        .slice(0, 100),
    [action, rows, search],
  )

  return (
    <section className="malaguetta-card rounded border border-stone-200 bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="font-semibold text-slate-950">{title}</h3>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
            placeholder="Pesquisar"
          />
          <select
            value={action}
            onChange={(event) => setAction(event.target.value as ImportacaoAcao | 'todos')}
            className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
          >
            {actions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Original</th>
              <th className="px-3 py-2">Normalizado</th>
              <th className="px-3 py-2">Acao</th>
              <th className="px-3 py-2">Vinculo</th>
              <th className="px-3 py-2">Origem</th>
              <th className="px-3 py-2">Mensagens</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td className="px-3 py-2 font-medium text-slate-950">{row.original}</td>
                <td className="px-3 py-2 text-slate-600">{row.nome}</td>
                <td className="px-3 py-2">
                  <span className="rounded bg-stone-100 px-2 py-1 text-xs font-semibold text-slate-700">
                    {row.acao}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {row.vinculoEncontrado ?? '-'}
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {row.aba} · {row.linha}
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {row.mensagens.join(', ') || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 100 && (
        <p className="mt-3 text-xs text-slate-500">
          Exibindo ate 100 linhas por secao para manter a interface fluida.
        </p>
      )}
    </section>
  )
}
