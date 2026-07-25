import {
  CheckCircle2,
  ClipboardList,
  Edit,
  Plus,
  RotateCcw,
  Search,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PratoForm } from '../components/PratoForm'
import { PageHeader } from '../components/PageHeader'
import { RecipeList } from '../components/recipes/RecipeList'
import type { RecipeStatus } from '../components/recipes/RecipeStatusBadge'
import {
  listCategoriasPratosAtivas,
  listPratosAbaPlanilha,
  listPratos,
  savePrato,
  setPratoAtivo,
} from '../services/pratosService'
import type { CategoriaPrato } from '../types/categoriaPrato'
import type { StatusFiltro } from '../types/ingrediente'
import type { Prato, PratoAbaPlanilha, PratoFormValues, PratoSort } from '../types/prato'
import { formatDate, formatNumber } from '../utils/formatters'

const pageSize = 10
type RecipeStatusFilter = 'todos' | RecipeStatus
type RecipeSort = 'nome' | 'custo' | 'pendencias'

export function PratosPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [pratos, setPratos] = useState<Prato[]>([])
  const [pratosAba, setPratosAba] = useState<PratoAbaPlanilha[]>([])
  const [categorias, setCategorias] = useState<CategoriaPrato[]>([])
  const [search, setSearch] = useState('')
  const [recipeSearch, setRecipeSearch] = useState('')
  const [recipeStatus, setRecipeStatus] = useState<RecipeStatusFilter>('todos')
  const [recipeSort, setRecipeSort] = useState<RecipeSort>('nome')
  const [categoriaId, setCategoriaId] = useState(searchParams.get('categoria') ?? '')
  const [status, setStatus] = useState<StatusFiltro>('ativos')
  const [sortBy, setSortBy] = useState<PratoSort>('nome')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingPrato, setEditingPrato] = useState<Prato | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const categoriaSelecionada = categorias.find(
    (categoria) => categoria.id === categoriaId,
  )

  const filters = useMemo(
    () => ({
      search,
      categoriaId,
      status,
      sortBy,
      page,
      pageSize,
    }),
    [categoriaId, page, search, sortBy, status],
  )

  const categoriasFormulario = useMemo(() => {
    if (!editingPrato?.categoria) {
      return categorias
    }

    const exists = categorias.some(
      (categoria) => categoria.id === editingPrato.categoria?.id,
    )

    if (exists) {
      return categorias
    }

    return [
      ...categorias,
      {
        id: editingPrato.categoria.id,
        codigo: editingPrato.categoria.codigo,
        nome: `${editingPrato.categoria.nome} (inativa)`,
        ordem_exibicao: 0,
        ativo: false,
        created_at: '',
        updated_at: '',
      },
    ]
  }, [categorias, editingPrato])

  async function loadCategorias() {
    const data = await listCategoriasPratosAtivas()
    setCategorias(data)
  }

  const loadPratos = useCallback(async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      if (categoriaId) {
        const data = await listPratosAbaPlanilha(categoriaId)
        setPratosAba(data)
        setPratos([])
        setTotal(data.length)
        return
      }

      const result = await listPratos(filters)
      setPratos(result.data)
      setPratosAba([])
      setTotal(result.count)
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Nao foi possivel carregar os pratos.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [categoriaId, filters])

  useEffect(() => {
    loadCategorias().catch((error: unknown) => {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Nao foi possivel carregar as categorias de pratos.',
      })
    })
  }, [])

  useEffect(() => {
    setCategoriaId(searchParams.get('categoria') ?? '')
    setPage(1)
  }, [searchParams])

  useEffect(() => {
    loadPratos()
  }, [loadPratos])

  async function handleSubmit(values: PratoFormValues) {
    setIsSubmitting(true)
    setMessage(null)

    try {
      await savePrato(values, editingPrato?.id)
      setMessage({
        type: 'success',
        text: editingPrato ? 'Prato atualizado com sucesso.' : 'Prato cadastrado com sucesso.',
      })
      setIsFormOpen(false)
      setEditingPrato(null)
      await loadPratos()
      await loadCategorias()
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error ? error.message : 'Nao foi possivel salvar o prato.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleToggleAtivo(prato: Prato) {
    const nextAtivo = !prato.ativo
    const actionLabel = nextAtivo ? 'reativar' : 'desativar'
    const extra = !nextAtivo
      ? '\n\nSe este prato possuir ficha tecnica futuramente, ele ficara apenas inativo e nao sera apagado.'
      : ''

    if (!window.confirm(`Deseja ${actionLabel} o prato "${prato.nome}"?${extra}`)) {
      return
    }

    setMessage(null)

    try {
      await setPratoAtivo(prato.id, nextAtivo)
      setMessage({
        type: 'success',
        text: nextAtivo ? 'Prato reativado com sucesso.' : 'Prato desativado com sucesso.',
      })
      await loadPratos()
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Nao foi possivel alterar o status do prato.',
      })
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          title={categoriaSelecionada?.nome ?? 'Pratos'}
          description={
            categoriaSelecionada
              ? 'Conteudo importado desta aba da planilha. Abra a ficha tecnica para preencher quantidades e calcular custos.'
              : 'Cadastre os pratos utilizados pelo restaurante.'
          }
        />
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded bg-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-800"
          onClick={() => {
            setEditingPrato(null)
            setIsFormOpen(true)
          }}
        >
          <Plus size={18} aria-hidden="true" />
          Novo prato
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

      {categoriaSelecionada && (
        <div className="mb-5 rounded border border-red-100 bg-red-50 p-4 text-sm text-red-950">
          <p className="font-semibold">Aba da planilha</p>
          <p className="mt-1">
            Esta visualizacao mostra os pratos da aba {categoriaSelecionada.nome}.
            Os insumos ficam dentro da acao Ficha Tecnica de cada prato.
          </p>
        </div>
      )}

      {categoriaSelecionada ? (
        <AbaPlanilhaView
          isLoading={isLoading}
          pratos={pratosAba}
          search={recipeSearch}
          status={recipeStatus}
          sortBy={recipeSort}
          onSearchChange={setRecipeSearch}
          onStatusChange={setRecipeStatus}
          onSortChange={setRecipeSort}
          onNewPrato={() => {
            setEditingPrato(null)
            setIsFormOpen(true)
          }}
          onOpen={(prato) => {
            navigate(`/pratos/${prato.id}/ficha-tecnica`)
          }}
          onEdit={(prato) => {
            setEditingPrato(prato)
            setIsFormOpen(true)
          }}
          onToggleActive={handleToggleAtivo}
        />
      ) : (
        <>
      <div className="mb-5 grid gap-3 rounded border border-stone-200 bg-white p-4 lg:grid-cols-[1fr_220px_180px_180px]">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Pesquisar</span>
          <div className="relative mt-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              className="w-full rounded border border-stone-300 py-2 pl-10 pr-3 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
              placeholder="Buscar por nome ou codigo"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Categoria</span>
          <select
            value={categoriaId}
            onChange={(event) => {
              const nextCategoriaId = event.target.value
              setCategoriaId(nextCategoriaId)
              setPage(1)
              if (nextCategoriaId) {
                setSearchParams({ categoria: nextCategoriaId })
              } else {
                setSearchParams({})
              }
            }}
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
          >
            <option value="">Todas</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusFiltro)
              setPage(1)
            }}
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
          >
            <option value="todos">Todos</option>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Ordenar por</span>
          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value as PratoSort)
              setPage(1)
            }}
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
          >
            <option value="nome">Nome</option>
            <option value="codigo">Codigo</option>
            <option value="categoria">Categoria</option>
          </select>
        </label>
      </div>

      <div className="rounded border border-stone-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-600">
            Carregando pratos...
          </div>
        ) : pratos.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-base font-semibold text-slate-950">
              Nenhum prato encontrado
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Cadastre o primeiro prato ou ajuste os filtros aplicados.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Codigo</th>
                    <th className="px-4 py-3 font-semibold">Nome</th>
                    <th className="px-4 py-3 font-semibold">Categoria</th>
                    <th className="px-4 py-3 font-semibold">Rendimento</th>
                    <th className="px-4 py-3 font-semibold">Tempo preparo</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Atualizado</th>
                    <th className="px-4 py-3 text-right font-semibold">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {pratos.map((prato) => (
                    <tr key={prato.id}>
                      <td className="px-4 py-3">
                        <span className="rounded bg-stone-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">
                          {prato.codigo}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-950">
                        {prato.nome}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {prato.categoria?.nome ?? 'Sem categoria'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatNumber(prato.rendimento)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {prato.tempo_preparo ? `${prato.tempo_preparo} min` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge ativo={prato.ativo} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(prato.updated_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/pratos/${prato.id}/ficha-tecnica`}
                            className="rounded border border-stone-300 p-2 text-slate-700 hover:bg-stone-50"
                            aria-label={`Ficha tecnica de ${prato.nome}`}
                            title="Ficha Tecnica"
                          >
                            <ClipboardList size={17} aria-hidden="true" />
                          </Link>
                          <button
                            type="button"
                            className="rounded border border-stone-300 p-2 text-slate-700 hover:bg-stone-50"
                            aria-label={`Editar ${prato.nome}`}
                            title="Editar"
                            onClick={() => {
                              setEditingPrato(prato)
                              setIsFormOpen(true)
                            }}
                          >
                            <Edit size={17} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="rounded border border-stone-300 p-2 text-slate-700 hover:bg-stone-50"
                            aria-label={
                              prato.ativo
                                ? `Desativar ${prato.nome}`
                                : `Reativar ${prato.nome}`
                            }
                            title={prato.ativo ? 'Desativar' : 'Reativar'}
                            onClick={() => handleToggleAtivo(prato)}
                          >
                            {prato.ativo ? (
                              <XCircle size={17} aria-hidden="true" />
                            ) : (
                              <RotateCcw size={17} aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-3 lg:hidden">
              {pratos.map((prato) => (
                <article key={prato.id} className="rounded border border-stone-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded bg-stone-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">
                        {prato.codigo}
                      </span>
                      <h3 className="mt-2 font-semibold text-slate-950">
                        {prato.nome}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {prato.categoria?.nome ?? 'Sem categoria'}
                      </p>
                    </div>
                    <StatusBadge ativo={prato.ativo} />
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-slate-500">Rendimento</dt>
                      <dd className="font-medium text-slate-800">
                        {formatNumber(prato.rendimento)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Tempo preparo</dt>
                      <dd className="font-medium text-slate-800">
                        {prato.tempo_preparo ? `${prato.tempo_preparo} min` : '-'}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs text-slate-500">Atualizado</dt>
                      <dd className="font-medium text-slate-800">
                        {formatDate(prato.updated_at)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Link
                      to={`/pratos/${prato.id}/ficha-tecnica`}
                      className="inline-flex items-center justify-center gap-2 rounded border border-stone-300 px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      <ClipboardList size={16} aria-hidden="true" />
                      Ficha
                    </Link>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded border border-stone-300 px-3 py-2 text-sm font-semibold text-slate-700"
                      onClick={() => {
                        setEditingPrato(prato)
                        setIsFormOpen(true)
                      }}
                    >
                      <Edit size={16} aria-hidden="true" />
                      Editar
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded border border-stone-300 px-3 py-2 text-sm font-semibold text-slate-700"
                      onClick={() => handleToggleAtivo(prato)}
                    >
                      {prato.ativo ? (
                        <XCircle size={16} aria-hidden="true" />
                      ) : (
                        <RotateCcw size={16} aria-hidden="true" />
                      )}
                      {prato.ativo ? 'Desativar' : 'Reativar'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 border-t border-stone-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {total} prato{total === 1 ? '' : 's'} encontrado
            {total === 1 ? '' : 's'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border border-stone-300 px-3 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Anterior
            </button>
            <span>
              Pagina {page} de {totalPages}
            </span>
            <button
              type="button"
              className="rounded border border-stone-300 px-3 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Proxima
            </button>
          </div>
        </div>
      </div>
        </>
      )}

      {isFormOpen && (
        <PratoForm
          categorias={categoriasFormulario}
          prato={editingPrato}
          isSubmitting={isSubmitting}
          onCancel={() => {
            setIsFormOpen(false)
            setEditingPrato(null)
          }}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  )
}

function StatusBadge({ ativo }: { ativo: boolean }) {
  return (
    <span
      className={`rounded px-2 py-1 text-xs font-semibold ${
        ativo ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-slate-600'
      }`}
    >
      {ativo ? 'Ativo' : 'Inativo'}
    </span>
  )
}

function AbaPlanilhaView({
  isLoading,
  pratos,
  search,
  status,
  sortBy,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onNewPrato,
  onOpen,
  onEdit,
  onToggleActive,
}: {
  isLoading: boolean
  pratos: PratoAbaPlanilha[]
  search: string
  status: RecipeStatusFilter
  sortBy: RecipeSort
  onSearchChange: (value: string) => void
  onStatusChange: (value: RecipeStatusFilter) => void
  onSortChange: (value: RecipeSort) => void
  onNewPrato: () => void
  onOpen: (prato: PratoAbaPlanilha) => void
  onEdit: (prato: PratoAbaPlanilha) => void
  onToggleActive: (prato: PratoAbaPlanilha) => void
}) {
  if (isLoading) {
    return (
      <div className="rounded border border-stone-200 bg-white p-8 text-center text-sm text-slate-600">
        Carregando pratos da categoria...
      </div>
    )
  }

  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR')
  const rows = pratos
    .map((prato) => {
      const ingredientsCount = prato.itens.length
      const pendingCount = prato.itens.filter(
        (item) =>
          Number(item.quantidade ?? 0) <= 0 ||
          !item.unidade_base ||
          !item.ingredientes,
      ).length
      const totalCost = prato.itens.reduce(
        (sum, item) => sum + Number(item.custo_calculado ?? 0),
        0,
      )
      const recipeStatus: RecipeStatus =
        ingredientsCount === 0
          ? 'sem-ingredientes'
          : pendingCount > 0
            ? 'incompleta'
            : 'completa'

      return {
        prato,
        metrics: {
          ingredientsCount,
          pendingCount,
          totalCost,
          status: recipeStatus,
        },
      }
    })
    .filter(({ prato, metrics }) => {
      const matchesSearch = prato.nome
        .toLocaleLowerCase('pt-BR')
        .includes(normalizedSearch)
      const matchesStatus = status === 'todos' || metrics.status === status

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'custo') {
        return b.metrics.totalCost - a.metrics.totalCost
      }

      if (sortBy === 'pendencias') {
        return b.metrics.pendingCount - a.metrics.pendingCount
      }

      return a.prato.nome.localeCompare(b.prato.nome, 'pt-BR')
    })

  return (
    <div className="space-y-4">
      <div className="rounded border border-stone-200 bg-white p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-950">
            Pratos da categoria
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Selecione um prato para abrir e preencher sua ficha tecnica.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_190px_170px]">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Pesquisar</span>
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
              placeholder="Buscar prato"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Status da ficha
            </span>
            <select
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as RecipeStatusFilter)
              }
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
            >
              <option value="todos">Todos</option>
              <option value="completa">Completa</option>
              <option value="incompleta">Incompleta</option>
              <option value="sem-ingredientes">Sem ingredientes</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Ordenar</span>
            <select
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value as RecipeSort)}
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
            >
              <option value="nome">Nome</option>
              <option value="custo">Custo</option>
              <option value="pendencias">Pendencias</option>
            </select>
          </label>
        </div>
      </div>

      <RecipeList
        pratos={rows}
        hasSearch={Boolean(normalizedSearch)}
        onOpen={onOpen}
        onEdit={onEdit}
        onToggleActive={onToggleActive}
        onNewPrato={onNewPrato}
      />
    </div>
  )
}
