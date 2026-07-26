import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Edit,
  Plus,
  RotateCcw,
  Search,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { IngredienteForm } from '../components/IngredienteForm'
import { PageHeader } from '../components/PageHeader'
import {
  countItensFichaTecnicaByIngrediente,
  listAllIngredientes,
  listCategoriasIngredientes,
  saveIngrediente,
  setIngredienteAtivo,
} from '../services/ingredientesService'
import type {
  CategoriaIngrediente,
  Ingrediente,
  IngredienteFormValues,
  StatusFiltro,
} from '../types/ingrediente'
import { formatCurrency } from '../utils/formatters'

export function IngredientesPage() {
  const [categorias, setCategorias] = useState<CategoriaIngrediente[]>([])
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFiltro>('ativos')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingIngrediente, setEditingIngrediente] =
    useState<Ingrediente | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const categoriasFormulario = useMemo(() => {
    if (!editingIngrediente?.categoria) {
      return categorias
    }

    const categoriaJaListada = categorias.some(
      (categoria) => categoria.id === editingIngrediente.categoria?.id,
    )

    if (categoriaJaListada) {
      return categorias
    }

    return [
      ...categorias,
      {
        id: editingIngrediente.categoria.id,
        nome: `${editingIngrediente.categoria.nome} (inativa)`,
        ativo: false,
        codigo: '',
        ordem_exibicao: 999,
        created_at: '',
        updated_at: '',
      },
    ]
  }, [categorias, editingIngrediente])

  const ingredientesPorCategoria = useMemo(() => {
    const map = new Map<string, Ingrediente[]>()

    for (const ing of ingredientes) {
      const catId = ing.categoria_id ?? 'sem-categoria'

      if (!map.has(catId)) {
        map.set(catId, [])
      }

      map.get(catId)!.push(ing)
    }

    return map
  }, [ingredientes])

  const categoriasVisiveis = useMemo(() => {
    if (!search.trim()) {
      return categorias
    }

    return categorias.filter((cat) => {
      const ings = ingredientesPorCategoria.get(cat.id)
      return ings !== undefined && ings.length > 0
    })
  }, [categorias, ingredientesPorCategoria, search])

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null
    return categorias.find((cat) => cat.id === selectedCategoryId) ?? null
  }, [categorias, selectedCategoryId])

  const ingredientesDaCategoriaSelecionada = useMemo(() => {
    if (!selectedCategoryId) return []
    return ingredientesPorCategoria.get(selectedCategoryId) ?? []
  }, [ingredientesPorCategoria, selectedCategoryId])

  const temIngredientesSemCategoria = useMemo(() => {
    const ings = ingredientesPorCategoria.get('sem-categoria')
    return ings !== undefined && ings.length > 0
  }, [ingredientesPorCategoria])

  async function loadCategorias() {
    const data = await listCategoriasIngredientes()
    setCategorias(data)

  }

  const loadIngredientes = useCallback(async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const data = await listAllIngredientes(search, status)
      setIngredientes(data)
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Nao foi possivel carregar os ingredientes.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    loadCategorias().catch((error: unknown) => {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Nao foi possivel carregar as categorias.',
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadIngredientes()
  }, [loadIngredientes])

  function openCreateForm() {
    setEditingIngrediente(null)
    setIsFormOpen(true)
  }

  function openEditForm(ingrediente: Ingrediente) {
    setEditingIngrediente(ingrediente)
    setIsFormOpen(true)
  }

  async function handleSubmit(values: IngredienteFormValues) {
    setIsSubmitting(true)
    setMessage(null)

    try {
      await saveIngrediente(values, editingIngrediente?.id)
      setMessage({
        type: 'success',
        text: editingIngrediente
          ? 'Ingrediente atualizado com sucesso.'
          : 'Ingrediente cadastrado com sucesso.',
      })
      setIsFormOpen(false)
      setEditingIngrediente(null)
      await loadIngredientes()
      await loadCategorias()
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Nao foi possivel salvar o ingrediente.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleToggleAtivo(ingrediente: Ingrediente) {
    const nextAtivo = !ingrediente.ativo
    const actionLabel = nextAtivo ? 'reativar' : 'desativar'
    let fichasText = ''

    if (!nextAtivo) {
      try {
        const fichasCount =
          await countItensFichaTecnicaByIngrediente(ingrediente.id)

        if (fichasCount > 0) {
          fichasText = `\n\nEste ingrediente esta vinculado a ${fichasCount} ficha${
            fichasCount === 1 ? '' : 's'
          } tecnica${fichasCount === 1 ? '' : 's'}. Ele sera desativado, mas nao apagado.`
        }
      } catch {
        fichasText =
          '\n\nNao foi possivel verificar os vinculos com fichas tecnicas agora. O ingrediente sera apenas desativado, sem exclusao fisica.'
      }
    }

    const confirmed = window.confirm(
      `Deseja ${actionLabel} o ingrediente "${ingrediente.nome}"?${fichasText}`,
    )

    if (!confirmed) {
      return
    }

    setMessage(null)

    try {
      await setIngredienteAtivo(ingrediente.id, nextAtivo)
      setMessage({
        type: 'success',
        text: nextAtivo
          ? 'Ingrediente reativado com sucesso.'
          : 'Ingrediente desativado com sucesso.',
      })
      await loadIngredientes()
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Nao foi possivel alterar o status do ingrediente.',
      })
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          title="Ingredientes"
          description="Cadastre e acompanhe os insumos usados nas fichas tecnicas, mantendo unidades e custos alinhados ao calculo da planilha."
        />
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded bg-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-800"
          onClick={() => openCreateForm()}
        >
          <Plus size={18} aria-hidden="true" />
          Novo ingrediente
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

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <label className="block flex-1">
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
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded border border-stone-300 py-2 pl-10 pr-3 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
              placeholder="Buscar ingrediente pelo nome..."
            />
          </div>
        </label>

        <label className="block w-full sm:w-44">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as StatusFiltro)
            }
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
          >
            <option value="todos">Todos</option>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
          </select>
        </label>
      </div>

      {!categorias.length && isLoading ? (
        <div className="malaguetta-card rounded border border-stone-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
          Carregando ingredientes...
        </div>
      ) : !categorias.length && ingredientes.length === 0 && !isLoading ? (
        <div className="malaguetta-card rounded border border-stone-200 bg-white p-8 text-center shadow-sm">
          <h3 className="text-base font-semibold text-slate-950">
            Nenhum ingrediente encontrado
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {search.trim()
              ? `Nenhum ingrediente corresponde a "${search}".`
              : 'Cadastre o primeiro ingrediente usando o botao acima.'}
          </p>
        </div>
      ) : !selectedCategoryId ? (
        <div className="malaguetta-card rounded-lg border border-stone-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <span className="text-sm text-slate-400">Carregando...</span>
            </div>
          ) : (
            <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
              {categoriasVisiveis.map((categoria) => {
                const ings = ingredientesPorCategoria.get(categoria.id) ?? []

                return (
                  <button
                    key={categoria.id}
                    type="button"
                    className="malaguetta-card group flex min-h-20 items-center justify-between gap-3 rounded border border-stone-200 bg-stone-50 px-4 py-3 text-left transition hover:border-red-200 hover:bg-red-50"
                    onClick={() => setSelectedCategoryId(categoria.id)}
                  >
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold uppercase tracking-wide text-slate-950">
                        {categoria.nome}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {ings.length} ingrediente{ings.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-slate-400 transition group-hover:text-red-700"
                      aria-hidden="true"
                    />
                  </button>
                )
              })}

              {temIngredientesSemCategoria && (
                <button
                  type="button"
                  className="malaguetta-card group flex min-h-20 items-center justify-between gap-3 rounded border border-stone-200 bg-stone-50 px-4 py-3 text-left transition hover:border-red-200 hover:bg-red-50"
                  onClick={() => setSelectedCategoryId('sem-categoria')}
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold uppercase tracking-wide text-slate-500">
                      Sem categoria
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {ingredientesPorCategoria.get('sem-categoria')?.length ?? 0}{' '}
                      ingrediente
                      {(ingredientesPorCategoria.get('sem-categoria')?.length ?? 0) ===
                      1
                        ? ''
                        : 's'}
                    </p>
                  </div>
                  <ChevronRight
                    size={18}
                    className="shrink-0 text-slate-400 transition group-hover:text-red-700"
                    aria-hidden="true"
                  />
                </button>
              )}

              {categoriasVisiveis.length === 0 && !temIngredientesSemCategoria && (
                <div className="p-8 text-center text-sm text-slate-400 sm:col-span-2 xl:col-span-3">
                  {search.trim()
                    ? 'Nenhuma secao encontrada para esta busca.'
                    : 'Nenhuma secao de ingredientes cadastrada.'}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="min-w-0 flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <span className="text-sm text-slate-400">Carregando...</span>
              </div>
            ) : selectedCategory ? (
              <>
                <div className="flex flex-col gap-3 border-b border-stone-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      className="shrink-0 rounded border border-stone-300 p-1.5 text-slate-500 hover:bg-stone-100"
                      aria-label="Voltar para secoes"
                      title="Voltar"
                      onClick={() => setSelectedCategoryId(null)}
                    >
                      <ArrowLeft size={16} aria-hidden="true" />
                    </button>
                    <h3 className="truncate text-base font-bold uppercase tracking-wide text-slate-950">
                      {selectedCategory.nome}
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800"
                    onClick={() => openCreateForm()}
                  >
                    <Plus size={16} aria-hidden="true" />
                    Novo ingrediente
                  </button>
                </div>

                {ingredientesDaCategoriaSelecionada.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 p-8 text-center">
                    <p className="text-sm text-slate-500">
                      Nenhum ingrediente nesta categoria.
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800"
                      onClick={() => openCreateForm()}
                    >
                      <Plus size={16} aria-hidden="true" />
                      Adicionar ingrediente
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] border-collapse text-left text-sm">
                      <thead className="bg-stone-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="w-1/2 px-4 py-3 font-semibold">
                            Ingrediente
                          </th>
                          <th className="w-1/4 px-4 py-3 font-semibold">
                            Un.
                          </th>
                          <th className="w-1/4 px-4 py-3 font-semibold">
                            Preço
                          </th>
                          <th className="px-4 py-3 text-right font-semibold">
                            Acoes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {ingredientesDaCategoriaSelecionada.map((ing) => (
                          <tr
                            key={ing.id}
                            className={`hover:bg-stone-50/50 transition ${
                              !ing.ativo ? 'opacity-60' : ''
                            }`}
                          >
                            <td className="px-4 py-3 font-medium text-slate-950">
                              <div className="flex items-center gap-2">
                                <span className="truncate">{ing.nome}</span>
                                {!ing.ativo && (
                                  <span className="shrink-0 rounded bg-stone-100 px-1.5 py-0.5 text-xs font-medium text-slate-500">
                                    Inativo
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {ing.unidade_compra}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-950">
                              {formatCurrency(ing.preco_embalagem)}
                              <span className="ml-1 text-xs text-slate-400">
                                /{ing.quantidade_embalagem}
                                {ing.unidade_compra}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-1">
                                <button
                                  type="button"
                                  className="rounded p-1.5 text-slate-500 hover:bg-stone-100 hover:text-slate-700"
                                  aria-label={`Editar ${ing.nome}`}
                                  title="Editar"
                                  onClick={() => openEditForm(ing)}
                                >
                                  <Edit size={16} aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  className="rounded p-1.5 text-slate-500 hover:bg-stone-100 hover:text-slate-700"
                                  aria-label={
                                    ing.ativo
                                      ? `Desativar ${ing.nome}`
                                      : `Reativar ${ing.nome}`
                                  }
                                  title={ing.ativo ? 'Desativar' : 'Reativar'}
                                  onClick={() => handleToggleAtivo(ing)}
                                >
                                  {ing.ativo ? (
                                    <XCircle
                                      size={16}
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <RotateCcw
                                      size={16}
                                      aria-hidden="true"
                                    />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : selectedCategoryId === 'sem-categoria' ? (
              <>
                <div className="flex items-center justify-between gap-4 border-b border-stone-200 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      className="shrink-0 rounded border border-stone-300 p-1.5 text-slate-500 hover:bg-stone-100"
                      aria-label="Voltar para secoes"
                      title="Voltar"
                      onClick={() => setSelectedCategoryId(null)}
                    >
                      <ArrowLeft size={16} aria-hidden="true" />
                    </button>
                    <h3 className="text-base font-bold uppercase tracking-wide text-slate-500">
                      Sem categoria
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800"
                    aria-label="Adicionar ingrediente"
                    onClick={() => openCreateForm()}
                  >
                    <Plus size={16} aria-hidden="true" />
                    Novo ingrediente
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] border-collapse text-left text-sm">
                    <thead className="bg-stone-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="w-1/2 px-4 py-3 font-semibold">
                          Ingrediente
                        </th>
                        <th className="w-1/4 px-4 py-3 font-semibold">Un.</th>
                        <th className="w-1/4 px-4 py-3 font-semibold">Preço</th>
                        <th className="px-4 py-3 text-right font-semibold">Acoes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {(ingredientesPorCategoria.get('sem-categoria') ?? []).map(
                        (ing) => (
                          <tr
                            key={ing.id}
                            className={`hover:bg-stone-50/50 transition ${
                              !ing.ativo ? 'opacity-60' : ''
                            }`}
                          >
                            <td className="px-4 py-3 font-medium text-slate-950">
                              <div className="flex items-center gap-2">
                                <span>{ing.nome}</span>
                                {!ing.ativo && (
                                  <span className="shrink-0 rounded bg-stone-100 px-1.5 py-0.5 text-xs font-medium text-slate-500">
                                    Inativo
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {ing.unidade_compra}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-950">
                              {formatCurrency(ing.preco_embalagem)}
                              <span className="ml-1 text-xs text-slate-400">
                                /{ing.quantidade_embalagem}
                                {ing.unidade_compra}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-1">
                                <button
                                  type="button"
                                  className="rounded p-1.5 text-slate-500 hover:bg-stone-100 hover:text-slate-700"
                                  aria-label={`Editar ${ing.nome}`}
                                  title="Editar"
                                  onClick={() => openEditForm(ing)}
                                >
                                  <Edit size={16} aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  className="rounded p-1.5 text-slate-500 hover:bg-stone-100 hover:text-slate-700"
                                  aria-label={
                                    ing.ativo
                                      ? `Desativar ${ing.nome}`
                                      : `Reativar ${ing.nome}`
                                  }
                                  title={ing.ativo ? 'Desativar' : 'Reativar'}
                                  onClick={() => handleToggleAtivo(ing)}
                                >
                                  {ing.ativo ? (
                                    <XCircle size={16} aria-hidden="true" />
                                  ) : (
                                    <RotateCcw size={16} aria-hidden="true" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center p-12">
                <p className="text-sm text-slate-400">
                  Selecione uma categoria ao lado para ver seus ingredientes.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {isFormOpen && (
        <IngredienteForm
          categorias={categoriasFormulario}
          ingrediente={editingIngrediente}
          initialCategoriaId={
            selectedCategoryId && selectedCategoryId !== 'sem-categoria'
              ? selectedCategoryId
              : ''
          }
          isSubmitting={isSubmitting}
          onCancel={() => {
            setIsFormOpen(false)
            setEditingIngrediente(null)
          }}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  )
}
