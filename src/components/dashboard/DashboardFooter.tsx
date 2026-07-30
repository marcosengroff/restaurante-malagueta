import type { DashboardData } from '../../types/dashboard'

const itemTones = [
  'bg-amber-50 text-amber-700',
  'bg-emerald-50 text-emerald-700',
  'bg-red-50 text-red-700',
  'bg-violet-50 text-violet-700',
]

export function DashboardFooter({ data }: { data: DashboardData['footer'] }) {
  const items = [
    ['Categorias', data.categorias],
    ['Ingredientes', data.ingredientes],
    ['Pratos', data.pratos],
    ['Itens de ficha', data.itensFicha],
  ] as const

  return (
    <section className="rounded-2xl border border-white/80 bg-white/92 p-4 shadow-[0_18px_45px_rgba(58,35,20,0.10)] backdrop-blur sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Resumo do sistema</h2>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {data.atualizadoHoje ? 'Atualizado hoje.' : 'Sem atualização hoje.'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map(([label, value], index) => (
            <div
              key={label}
              className="rounded-xl border border-stone-200/80 bg-stone-50/70 px-4 py-3 sm:min-w-32 sm:px-5 sm:py-4"
            >
              <span
                className={`mb-2 inline-flex h-7 w-7 rounded-lg sm:mb-3 sm:h-8 sm:w-8 ${itemTones[index]}`}
              />
              <p className="text-[11px] font-bold uppercase tracking-[0.02em] text-slate-500">
                {label}
              </p>
              <p className="mt-1 text-xl font-bold text-slate-950 sm:mt-2 sm:text-2xl">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
