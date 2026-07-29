import {
  CheckCircle2,
  ClipboardList,
  Edit,
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { getDashboardData } from '../services/dashboardService'
import { deleteFichaTecnicaByPrato } from '../services/fichaTecnicaService'
import type { DashboardRecipe } from '../types/dashboard'
import { formatCurrency, formatDate } from '../utils/formatters'

export function FichasTecnicasPage() {
  const [fichas, setFichas] = useState<DashboardRecipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const totalPendencias = useMemo(
    () => fichas.reduce((total, ficha) => total + ficha.pendencias, 0),
    [fichas],
  )

  async function loadFichas() {
    setIsLoading(true)
    setMessage(null)

    try {
      const data = await getDashboardData()
      setFichas(data.pendingRecipes)
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Nao foi possivel carregar as fichas tecnicas.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFichas()
  }, [])

  async function handleDelete(ficha: DashboardRecipe) {
    const detail =
      ficha.ingredientes > 0
        ? `\n\nEsta acao remove ${ficha.ingredientes} insumo${
            ficha.ingredientes === 1 ? '' : 's'
          } da ficha, mas mantem o prato cadastrado.`
        : '\n\nO prato sera mantido cadastrado.'

    if (!window.confirm(`Deseja excluir a ficha tecnica de "${ficha.nome}"?${detail}`)) {
      return
    }

    setIsDeleting(ficha.id)
    setMessage(null)

    try {
      await deleteFichaTecnicaByPrato(ficha.id)
      setMessage({
        type: 'success',
        text: 'Ficha tecnica excluida com sucesso.',
      })
      await loadFichas()
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Nao foi possivel excluir a ficha tecnica.',
      })
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          title="Fichas Tecnicas"
          description="Acompanhe as fichas incompletas, edite quantidades pendentes ou exclua a composicao vinculada ao prato."
        />
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          disabled={isLoading}
          onClick={loadFichas}
        >
          <RefreshCw size={18} aria-hidden="true" />
          Atualizar
        </button>
      </div>

      {message && (
        <div
          className={`mb-5 flex items-start gap-2 rounded border p-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={18} aria-hidden="true" />
          ) : (
            <XCircle size={18} aria-hidden="true" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Fichas incompletas" value={String(fichas.length)} />
        <SummaryCard label="Itens pendentes" value={String(totalPendencias)} />
        <SummaryCard
          label="Custo em aberto"
          value={formatCurrency(
            fichas.reduce((total, ficha) => total + ficha.custoTotal, 0),
          )}
        />
      </div>

      <div className="malaguetta-card overflow-hidden rounded border border-stone-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-600">
            Carregando fichas tecnicas...
          </div>
        ) : fichas.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-base font-semibold text-slate-950">
              Nenhuma ficha incompleta
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Todas as fichas com pratos ativos possuem ingredientes e quantidades preenchidas.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-200">
            {fichas.map((ficha) => (
              <article
                key={ficha.id}
                className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                      {ficha.ingredientes === 0 ? 'Sem ingredientes' : 'Incompleta'}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {ficha.categoria}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">
                    {ficha.nome}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {ficha.ingredientes} insumo
                    {ficha.ingredientes === 1 ? '' : 's'} na ficha,{' '}
                    {ficha.pendencias} pendencia
                    {ficha.pendencias === 1 ? '' : 's'} de quantidade.
                  </p>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <InfoItem label="Custo atual" value={formatCurrency(ficha.custoTotal)} />
                    <InfoItem label="Atualizada" value={formatDate(ficha.updatedAt)} />
                  </dl>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:min-w-64">
                  <Link
                    to={`/pratos/${ficha.id}/ficha-tecnica`}
                    className="inline-flex items-center justify-center gap-2 rounded bg-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-800"
                  >
                    <Edit size={17} aria-hidden="true" />
                    Editar ficha
                  </Link>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isDeleting === ficha.id}
                    onClick={() => handleDelete(ficha)}
                  >
                    {isDeleting === ficha.id ? (
                      <ClipboardList size={17} aria-hidden="true" />
                    ) : (
                      <Trash2 size={17} aria-hidden="true" />
                    )}
                    {isDeleting === ficha.id ? 'Excluindo...' : 'Excluir ficha'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="malaguetta-card rounded border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-950">{value}</dd>
    </div>
  )
}
