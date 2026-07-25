import { PageHeader } from '../components/PageHeader'

export function FichasTecnicasPage() {
  return (
    <section>
      <PageHeader
        title="Fichas Tecnicas"
        description="Area reservada para as fichas e custos dos pratos, sem importar dados ou criar tabelas definitivas nesta etapa."
      />
      <div className="rounded border border-stone-200 bg-white p-5 text-sm text-slate-600">
        Modulo de fichas tecnicas preparado para a proxima etapa.
      </div>
    </section>
  )
}
