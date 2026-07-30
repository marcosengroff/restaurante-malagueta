import { supabase } from './supabaseClient'
import type {
  CategoriaIngredienteFilters,
  CategoriaIngredienteFormValues,
  CategoriaIngredienteListResult,
} from '../types/categoriaIngrediente'
import { normalizeNome } from '../utils/ingredientes'
import { invalidateCategoriasIngredientesCache } from './ingredientesService'

function getFriendlyError(message: string) {
  if (message.includes('categorias_ingredientes_nome_unique')) {
    return 'Ja existe uma categoria cadastrada com esse nome.'
  }

  if (message.includes('permission denied') || message.includes('row-level security')) {
    return 'Usuario sem permissao para realizar esta operacao.'
  }

  if (message.includes('Failed to fetch')) {
    return 'Falha de conexao com o Supabase.'
  }

  return message
}

async function countIngredientesAtivosByCategoria(categoriaIds: string[]) {
  const counts = new Map<string, number>()

  if (categoriaIds.length === 0) {
    return counts
  }

  const { data, error } = await supabase
    .from('ingredientes')
    .select('categoria_id')
    .eq('ativo', true)
    .in('categoria_id', categoriaIds)

  if (error) {
    throw new Error(getFriendlyError(error.message))
  }

  ;(data ?? []).forEach((ingrediente) => {
    if (ingrediente.categoria_id) {
      counts.set(
        ingrediente.categoria_id,
        (counts.get(ingrediente.categoria_id) ?? 0) + 1,
      )
    }
  })

  return counts
}

export async function listCategoriasIngredientesCrud(
  filters: CategoriaIngredienteFilters,
): Promise<CategoriaIngredienteListResult> {
  const from = (filters.page - 1) * filters.pageSize
  const to = from + filters.pageSize - 1
  const search = filters.search.trim()

  let query = supabase
    .from('categorias_ingredientes')
    .select('*', { count: 'exact' })

  if (search) {
    query = query.or(`nome.ilike.%${search}%,codigo.ilike.%${search}%`)
  }

  if (filters.status === 'ativos') {
    query = query.eq('ativo', true)
  }

  if (filters.status === 'inativos') {
    query = query.eq('ativo', false)
  }

  const { data, error, count } = await query
    .order('ordem_exibicao', { ascending: true })
    .range(from, to)

  if (error) {
    throw new Error(getFriendlyError(error.message))
  }

  const categorias = data ?? []
  const ingredientesCount = await countIngredientesAtivosByCategoria(
    categorias.map((categoria) => categoria.id),
  )

  return {
    data: categorias.map((categoria) => ({
      ...categoria,
      ingredientes_vinculados: ingredientesCount.get(categoria.id) ?? 0,
    })),
    count: count ?? 0,
  }
}

export async function saveCategoriaIngrediente(
  values: CategoriaIngredienteFormValues,
  categoriaId?: string,
) {
  const nome = normalizeNome(values.nome)

  let duplicateQuery = supabase
    .from('categorias_ingredientes')
    .select('id')
    .ilike('nome', nome)
    .limit(1)

  if (categoriaId) {
    duplicateQuery = duplicateQuery.neq('id', categoriaId)
  }

  const { data: duplicated, error: duplicateError } = await duplicateQuery

  if (duplicateError) {
    throw new Error(getFriendlyError(duplicateError.message))
  }

  if (duplicated.length > 0) {
    throw new Error('Ja existe uma categoria cadastrada com esse nome.')
  }

  const payload = {
    nome,
    ativo: values.ativo,
  }

  const response = categoriaId
    ? await supabase
        .from('categorias_ingredientes')
        .update(payload)
        .eq('id', categoriaId)
    : await supabase.from('categorias_ingredientes').insert(payload)

  if (response.error) {
    throw new Error(getFriendlyError(response.error.message))
  }

  invalidateCategoriasIngredientesCache()
}

export async function setCategoriaIngredienteAtivo(id: string, ativo: boolean) {
  const { error } = await supabase
    .from('categorias_ingredientes')
    .update({ ativo })
    .eq('id', id)

  if (error) {
    throw new Error(getFriendlyError(error.message))
  }

  invalidateCategoriasIngredientesCache()
}
