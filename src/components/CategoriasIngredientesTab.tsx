import {
  CheckCircle2,
  Edit,
  FolderPlus,
  RotateCcw,
  Search,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CategoriaIngredienteForm } from '../components/CategoriaIngredienteForm'
import { PageHeader } from '../components/PageHeader'
import {
  listCategoriasIngredientesCrud,
  saveCategoriaIngrediente,
  setCategoriaIngredienteAtivo,
} from '../services/categoriasIngredientesService'
import type {
  CategoriaIngredienteComContagem,
  CategoriaIngredienteFormValues,
} from '../types/categoriaIngrediente'
import type { StatusFiltro } from '../types/ingrediente'
import { formatDate } from '../utils/formatters'

const pageSize = 10

export function CategoriasIngredientesTab() {
  const [categorias, setCategorias] = useState<CategoriaIngredienteComContagem[]>(
    [],
  )
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFiltro>('ativos')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCategoria, setEditingCategoria] =
    useState<CategoriaIngredienteComContagem | null>(null)
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
      page,
      pageSize,
    }),
    [page, search, status],
  )

  const loadCategorias = useCallback(async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await listCategoriasIngredientesCrud(filters)
      setCategorias(result.data)
      setTotal(result.count)
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Nao foi possivel carregar as categorias.',
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

  function openCreateForm() {
    setEditingCategoria(null)
    setIsFormOpen(true)
  }

  function openEditForm(categoria: CategoriaIngredienteComContagem) {
    setEditingCategoria(categoria)
    setIsFormOpen(true)
  }

  async function handleSubmit(values: CategoriaIngredienteFormValues) {
    setIsSubmitting(true)
    setMessage(null)

    try {
      await saveCategoriaIngrediente(values, editingCategoria?.id)
      setMessage({
        type: 'success',
        text: editingCategoria
          ? 'Categoria atualizada com sucesso.'
          : 'Categoria cadastrada com sucesso.',
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
            : 'Nao foi possivel salvar a categoria.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleToggleAtivo(categoria: CategoriaIngredienteComContagem) {
    const nextAtivo = !categoria.ativo
    const actionLabel = nextAtivo ? 'reativar' : 'desativar'
    const ingredientesText =
      !nextAtivo && categoria.ingredientes_vinculados > 0
        ? `\n\nEsta categoria possui ${categoria.ingredientes_vinculados} ingrediente${
            categoria.ingredientes_vinculados === 1 ? '' : 's'
          } vinculado${
            categoria.ingredientes_vinculados === 1 ? '' : 's'
          }. Ela sera desativada, mas os ingredientes nao serao apagados.`
        : ''
    const confirmed = window.confirm(
      `Deseja ${actionLabel} a categoria "${categoria.nome}"?${ingredientesText}`,
    )

    if (!confirmed) {
      return
    }

    setMessage(null)

    try {
      await setCategoriaIngredienteAtivo(categoria.id, nextAtivo)
      setMessage({
        type: 'success',
        text: nextAtivo
          ? 'Categoria reativada com sucesso.'
          : 'Categoria desativada com sucesso.',
      })
      await loadCategorias()
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Nao foi possivel alterar o status da categoria.',
      })
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          title="Categorias de Ingredientes"
          description="Organize os ingredientes em grupos usados pelas fichas tecnicas, sem misturar categorias de pratos nesta etapa."
        />
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded bg-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-800"
          onClick={openCreateForm}
        >
          <FolderPlus size={18} aria-hidden="true" />
          Nova categoria
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

      <div className="malaguetta-card mb-5 grid gap-3 rounded border border-stone-200 bg-white p-4 lg:grid-cols-[1fr_180px]">
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
      </div>

      <div className="malaguetta-card rounded border border-stone-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-600">
            Carregando categorias...
          </div>
        ) : categorias.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-base font-semibold text-slate-950">
              Nenhuma categoria encontrada
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Cadastre a primeira categoria de ingredientes ou ajuste os filtros.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Codigo</th>
                    <th className="px-4 py-3 font-semibold">Nome</th>
                    <th className="px-4 py-3 font-semibold">
                      Ingredientes vinculados
                    </th>
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
                        {categoria.ingredientes_vinculados}
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
                            onClick={() => openEditForm(categoria)}
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
                      <dt className="text-xs text-slate-500">
                        Ingredientes vinculados
                      </dt>
                      <dd className="font-medium text-slate-800">
                        {categoria.ingredientes_vinculados}
                      </dd>
                    </div>
                    <div>
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
                      onClick={() => openEditForm(categoria)}
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
            {total} categoria{total === 1 ? '' : 's'} encontrada
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
        <CategoriaIngredienteForm
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
