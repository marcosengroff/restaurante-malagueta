import type { DashboardData } from '../../types/dashboard'

export function DashboardFooter({ data }: { data: DashboardData['footer'] }) {
  const items = [
    ['Categorias', data.categorias],
    ['Ingredientes', data.ingredientes],
    ['Pratos', data.pratos],
    ['Itens de ficha', data.itensFicha],
  ] as const

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-semibold text-slate-950">Resumo do sistema</h2>
          <p className="mt-1 text-sm text-slate-500">
            {data.atualizadoHoje ? 'Atualizado hoje.' : 'Sem atualização hoje.'}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {items.map(([label, value]) => (
            <div key={label} className="min-w-28 rounded bg-stone-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase text-slate-500">
                {label}
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
