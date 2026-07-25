function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) {
    return 'Bom dia'
  }

  if (hour < 18) {
    return 'Boa tarde'
  }

  return 'Boa noite'
}

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#69704f]">
          Centro de controle
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          {getGreeting()}, Marcos
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Bem-vindo ao painel de controle das fichas técnicas.
        </p>
      </div>
      <div className="rounded border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
        {new Intl.DateTimeFormat('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }).format(new Date())}
      </div>
    </div>
  )
}
