import { supabase } from './supabaseClient'
import type {
  CategoriaIngrediente,
  Ingrediente,
  IngredienteFilters,
  IngredienteFormValues,
  IngredienteListResult,
  StatusFiltro,
} from '../types/ingrediente'
import { getUnidadeBase, normalizeNome } from '../utils/ingredientes'

type IngredienteRowWithCategoria = {
  id: string
  nome: string
  categoria_id: string | null
  unidade_compra: 'kg' | 'g' | 'l' | 'ml' | 'unidade'
  quantidade_embalagem: number
  preco_embalagem: number
  unidade_base: 'g' | 'ml' | 'unidade'
  custo_unidade_base: number
  observacoes: string | null
  ativo: boolean
  created_at: string
  updated_at: string
  categorias_ingredientes: Pick<CategoriaIngrediente, 'id' | 'nome'> | null
}

function mapIngrediente(row: IngredienteRowWithCategoria): Ingrediente {
  const { categorias_ingredientes: categoria, ...ingrediente } = row

  return {
    ...ingrediente,
    categoria,
  }
}

function getDuplicateMessage(message: string) {
  if (message.includes('ingredientes_nome_unique')) {
    return 'Ja existe um ingrediente cadastrado com esse nome.'
  }

  if (message.includes('permission denied') || message.includes('row-level security')) {
    return 'Usuario sem permissao para realizar esta operacao.'
  }

  if (message.includes('Failed to fetch')) {
    return 'Falha de conexao com o Supabase.'
  }

  return message
}

export async function listAllIngredientes(
  search: string,
  status: StatusFiltro,
): Promise<Ingrediente[]> {
  let query = supabase
    .from('ingredientes')
    .select(
      `
        *,
        categorias_ingredientes (
          id,
          nome
        )
      `,
    )

  if (search.trim()) {
    query = query.ilike('nome', `%${search.trim()}%`)
  }

  if (status === 'ativos') {
    query = query.eq('ativo', true)
  } else if (status === 'inativos') {
    query = query.eq('ativo', false)
  }

  const { data, error } = await query.order('nome', { ascending: true })

  if (error) {
    throw new Error(getDuplicateMessage(error.message))
  }

  return ((data ?? []) as unknown as IngredienteRowWithCategoria[]).map(
    mapIngrediente,
  )
}

export async function listCategoriasIngredientes() {
  const { data, error } = await supabase
    .from('categorias_ingredientes')
    .select('*')
    .eq('ativo', true)
    .order('ordem_exibicao', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function findCategoriaIdsBySearch(search: string) {
  const { data, error } = await supabase
    .from('categorias_ingredientes')
    .select('id')
    .ilike('nome', `%${search}%`)

  if (error) {
    throw new Error(getDuplicateMessage(error.message))
  }

  return (data ?? []).map((categoria) => categoria.id)
}

export async function listIngredientes(
  filters: IngredienteFilters,
): Promise<IngredienteListResult> {
  const from = (filters.page - 1) * filters.pageSize
  const to = from + filters.pageSize - 1

  let query = supabase
    .from('ingredientes')
    .select(
      `
        *,
        categorias_ingredientes (
          id,
          nome
        )
      `,
      { count: 'exact' },
    )

  const search = filters.search.trim()

  if (search) {
    const categoriaIds = await findCategoriaIdsBySearch(search)
    const searchClauses = [`nome.ilike.%${search}%`]

    if (categoriaIds.length > 0) {
      searchClauses.push(`categoria_id.in.(${categoriaIds.join(',')})`)
    }

    query = query.or(searchClauses.join(','))
  }

  if (filters.categoriaId) {
    query = query.eq('categoria_id', filters.categoriaId)
  }

  if (filters.status === 'ativos') {
    query = query.eq('ativo', true)
  }

  if (filters.status === 'inativos') {
    query = query.eq('ativo', false)
  }

  if (filters.unidadeCompra) {
    query = query.eq('unidade_compra', filters.unidadeCompra)
  }

  const { data, error, count } = await query
    .order('nome', { ascending: true })
    .range(from, to)

  if (error) {
    throw new Error(getDuplicateMessage(error.message))
  }

  return {
    data: ((data ?? []) as unknown as IngredienteRowWithCategoria[]).map(
      mapIngrediente,
    ),
    count: count ?? 0,
  }
}

export async function saveIngrediente(
  values: IngredienteFormValues,
  ingredienteId?: string,
) {
  const nome = normalizeNome(values.nome)
  const categoriaId = values.categoria_id || null

  let duplicateQuery = supabase
    .from('ingredientes')
    .select('id, nome')

  if (ingredienteId) {
    duplicateQuery = duplicateQuery.neq('id', ingredienteId)
  }

  const { data: duplicated, error: duplicateError } = await duplicateQuery

  if (duplicateError) {
    throw new Error(getDuplicateMessage(duplicateError.message))
  }

  const normalizedNome = nome.toLocaleLowerCase('pt-BR')
  const hasDuplicate = duplicated.some(
    (ingrediente) =>
      normalizeNome(ingrediente.nome).toLocaleLowerCase('pt-BR') ===
      normalizedNome,
  )

  if (hasDuplicate) {
    throw new Error('Ja existe um ingrediente cadastrado com esse nome.')
  }

  const payload = {
    nome,
    categoria_id: categoriaId,
    unidade_compra: values.unidade_compra,
    unidade_base: getUnidadeBase(values.unidade_compra),
    quantidade_embalagem: values.quantidade_embalagem,
    preco_embalagem: values.preco_embalagem,
    observacoes: values.observacoes.trim() || null,
    ativo: values.ativo,
  }

  const response = ingredienteId
    ? await supabase.from('ingredientes').update(payload).eq('id', ingredienteId)
    : await supabase.from('ingredientes').insert(payload)

  if (response.error) {
    throw new Error(getDuplicateMessage(response.error.message))
  }
}

export async function setIngredienteAtivo(id: string, ativo: boolean) {
  const { error } = await supabase.from('ingredientes').update({ ativo }).eq('id', id)

  if (error) {
    throw new Error(getDuplicateMessage(error.message))
  }
}

export async function countItensFichaTecnicaByIngrediente(id: string) {
  const { count, error } = await supabase
    .from('itens_ficha_tecnica')
    .select('id', { count: 'exact', head: true })
    .eq('ingrediente_id', id)

  if (error) {
    throw new Error(getDuplicateMessage(error.message))
  }

  return count ?? 0
}
