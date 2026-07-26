import {
  CheckCircle2,
  Edit,
  FolderPlus,
  RotateCcw,
  Search,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CategoriaPratoForm } from './CategoriaPratoForm'
import {
  listCategoriasPratos,
  saveCategoriaPrato,
  setCategoriaPratoAtivo,
} from '../services/categoriasPratosService'
import type {
  CategoriaPratoComContagem,
  CategoriaPratoFormValues,
  CategoriaPratoSort,
} from '../types/categoriaPrato'
import type { StatusFiltro } from '../types/ingrediente'
import { formatDate } from '../utils/formatters'

const pageSize = 10

export function CategoriasPratosTab() {
  const [categorias, setCategorias] = useState<CategoriaPratoComContagem[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFiltro>('ativos')
  const [sortBy, setSortBy] = useState<CategoriaPratoSort>('ordem_exibicao')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCategoria, setEditingCategoria] =
    useState<CategoriaPratoComContagem | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const filters = useMemo(
    () => ({
      search,
      status,
      sortBy,
      page,
      pageSize,
    }),
    [page, search, sortBy, status],
  )

  const loadCategorias = useCallback(async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await listCategoriasPratos(filters)
      setCategorias(result.data)
      setTotal(result.count)
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Nao foi possivel carregar as categorias de pratos.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadCategorias()
  }, [loadCategorias])

  function resetPageAndSetSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  function resetPageAndSetStatus(value: StatusFiltro) {
    setStatus(value)
    setPage(1)
  }

  function resetPageAndSetSort(value: CategoriaPratoSort) {
    setSortBy(value)
    setPage(1)
  }

  async function handleSubmit(values: CategoriaPratoFormValues) {
    setIsSubmitting(true)
    setMessage(null)

    try {
      await saveCategoriaPrato(values, editingCategoria?.id)
      setMessage({
        type: 'success',
        text: editingCategoria
          ? 'Categoria de prato atualizada com sucesso.'
          : 'Categoria de prato cadastrada com sucesso.',
      })
      setIsFormOpen(false)
      setEditingCategoria(null)
      await loadCategorias()
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Nao foi possivel salvar a categoria de prato.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleToggleAtivo(categoria: CategoriaPratoComContagem) {
    const nextAtivo = !categoria.ativo
    const actionLabel = nextAtivo ? 'reativar' : 'desativar'
    const pratosText =
      !nextAtivo && categoria.pratos_vinculados > 0
        ? `\n\nEsta categoria possui ${categoria.pratos_vinculados} prato${
            categoria.pratos_vinculados === 1 ? '' : 's'
          } vinculado${
            categoria.pratos_vinculados === 1 ? '' : 's'
          }. Ela sera desativada, mas os pratos nao serao apagados.`
        : ''

    if (
      !window.confirm(
        `Deseja ${actionLabel} a categoria "${categoria.nome}"?${pratosText}`,
      )
    ) {
      return
    }

    setMessage(null)

    try {
      await setCategoriaPratoAtivo(categoria.id, nextAtivo)
      setMessage({
        type: 'success',
        text: nextAtivo
          ? 'Categoria de prato reativada com sucesso.'
          : 'Categoria de prato desativada com sucesso.',
      })
      await loadCategorias()
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Nao foi possivel alterar o status da categoria de prato.',
      })
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">
            Categorias de Pratos
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Organize os grupos de pratos que serao usados depois no cadastro de
            pratos e fichas tecnicas.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded bg-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-800"
          onClick={() => {
            setEditingCategoria(null)
            setIsFormOpen(true)
          }}
        >
          <FolderPlus size={18} aria-hidden="true" />
          Nova categoria de prato
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

      <div className="malaguetta-card mb-5 grid gap-3 rounded border border-stone-200 bg-white p-4 lg:grid-cols-[1fr_180px_220px]">
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
              onChange={(event) => resetPageAndSetSearch(event.target.value)}
              className="w-full rounded border border-stone-300 py-2 pl-10 pr-3 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
              placeholder="Buscar por nome ou codigo"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select
            value={status}
            onChange={(event) =>
              resetPageAndSetStatus(event.target.value as StatusFiltro)
            }
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
            onChange={(event) =>
              resetPageAndSetSort(event.target.value as CategoriaPratoSort)
            }
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
          >
            <option value="ordem_exibicao">Ordem de exibicao</option>
            <option value="nome">Nome</option>
            <option value="codigo">Codigo</option>
          </select>
        </label>
      </div>

      <div className="malaguetta-card rounded border border-stone-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-600">
            Carregando categorias de pratos...
          </div>
        ) : categorias.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-base font-semibold text-slate-950">
              Nenhuma categoria de prato encontrada
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Cadastre a primeira categoria de prato ou ajuste os filtros.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Codigo</th>
                    <th className="px-4 py-3 font-semibold">Nome</th>
                    <th className="px-4 py-3 font-semibold">Ordem</th>
                    <th className="px-4 py-3 font-semibold">Pratos vinculados</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Ultima atualizacao</th>
                    <th className="px-4 py-3 text-right font-semibold">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {categorias.map((categoria) => (
                    <tr key={categoria.id}>
                      <td className="px-4 py-3">
                        <span className="rounded bg-stone-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">
                          {categoria.codigo}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-950">
                        {categoria.nome}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {categoria.ordem_exibicao}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {categoria.pratos_vinculados}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge ativo={categoria.ativo} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(categoria.updated_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="rounded border border-stone-300 p-2 text-slate-700 hover:bg-stone-50"
                            aria-label={`Editar ${categoria.nome}`}
                            title="Editar"
                            onClick={() => {
                              setEditingCategoria(categoria)
                              setIsFormOpen(true)
                            }}
                          >
                            <Edit size={17} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="rounded border border-stone-300 p-2 text-slate-700 hover:bg-stone-50"
                            aria-label={
                              categoria.ativo
                                ? `Desativar ${categoria.nome}`
                                : `Reativar ${categoria.nome}`
                            }
                            title={categoria.ativo ? 'Desativar' : 'Reativar'}
                            onClick={() => handleToggleAtivo(categoria)}
                          >
                            {categoria.ativo ? (
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
              {categorias.map((categoria) => (
                <article
                  key={categoria.id}
                  className="malaguetta-card rounded border border-stone-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded bg-stone-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">
                        {categoria.codigo}
                      </span>
                      <h3 className="mt-2 font-semibold text-slate-950">
                        {categoria.nome}
                      </h3>
                    </div>
                    <StatusBadge ativo={categoria.ativo} />
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-slate-500">Ordem</dt>
                      <dd className="font-medium text-slate-800">
                        {categoria.ordem_exibicao}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Pratos vinculados</dt>
                      <dd className="font-medium text-slate-800">
                        {categoria.pratos_vinculados}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs text-slate-500">Atualizada</dt>
                      <dd className="font-medium text-slate-800">
                        {formatDate(categoria.updated_at)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded border border-stone-300 px-3 py-2 text-sm font-semibold text-slate-700"
                      onClick={() => {
                        setEditingCategoria(categoria)
                        setIsFormOpen(true)
                      }}
                    >
                      <Edit size={16} aria-hidden="true" />
                      Editar
                    </button>
                    <button
                      type="button"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded border border-stone-300 px-3 py-2 text-sm font-semibold text-slate-700"
                      onClick={() => handleToggleAtivo(categoria)}
                    >
                      {categoria.ativo ? (
                        <XCircle size={16} aria-hidden="true" />
                      ) : (
                        <RotateCcw size={16} aria-hidden="true" />
                      )}
                      {categoria.ativo ? 'Desativar' : 'Reativar'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 border-t border-stone-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {total} categoria{total === 1 ? '' : 's'} de prato encontrada
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

      {isFormOpen && (
        <CategoriaPratoForm
          categoria={editingCategoria}
          isSubmitting={isSubmitting}
          onCancel={() => {
            setIsFormOpen(false)
            setEditingCategoria(null)
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
