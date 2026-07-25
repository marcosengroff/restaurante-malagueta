import { supabase } from './supabaseClient'
import type {
  CategoriaPratoFilters,
  CategoriaPratoFormValues,
  CategoriaPratoListResult,
} from '../types/categoriaPrato'
import { normalizeNome } from '../utils/ingredientes'

function getFriendlyError(message: string) {
  if (message.includes('categorias_pratos_nome_unique')) {
    return 'Ja existe uma categoria de prato cadastrada com esse nome.'
  }

  if (message.includes('permission denied') || message.includes('row-level security')) {
    return 'Usuario sem permissao para realizar esta operacao.'
  }

  if (message.includes('Failed to fetch')) {
    return 'Falha de conexao com o Supabase.'
  }

  return message
}

async function countPratosAtivosByCategoria(categoriaIds: string[]) {
  const counts = new Map<string, number>()

  await Promise.all(
    categoriaIds.map(async (categoriaId) => {
      const { count, error } = await supabase
        .from('pratos')
        .select('id', { count: 'exact', head: true })
        .eq('categoria_id', categoriaId)
        .eq('ativo', true)

      if (error) {
        throw new Error(getFriendlyError(error.message))
      }

      counts.set(categoriaId, count ?? 0)
    }),
  )

  return counts
}

export async function listCategoriasPratos(
  filters: CategoriaPratoFilters,
): Promise<CategoriaPratoListResult> {
  const from = (filters.page - 1) * filters.pageSize
  const to = from + filters.pageSize - 1
  const search = filters.search.trim()

  let query = supabase.from('categorias_pratos').select('*', { count: 'exact' })

  if (search) {
    query = query.or(`nome.ilike.%${search}%,codigo.ilike.%${search}%`)
  }

  if (filters.status === 'ativos') {
    query = query.eq('ativo', true)
  }

  if (filters.status === 'inativos') {
    query = query.eq('ativo', false)
  }

  if (filters.sortBy === 'ordem_exibicao') {
    query = query.order('ordem_exibicao', { ascending: true }).order('nome', {
      ascending: true,
    })
  } else {
    query = query.order(filters.sortBy, { ascending: true })
  }

  const { data, error, count } = await query.range(from, to)

  if (error) {
    throw new Error(getFriendlyError(error.message))
  }

  const categorias = data ?? []
  const pratosCount = await countPratosAtivosByCategoria(
    categorias.map((categoria) => categoria.id),
  )

  return {
    data: categorias.map((categoria) => ({
      ...categoria,
      pratos_vinculados: pratosCount.get(categoria.id) ?? 0,
    })),
    count: count ?? 0,
  }
}

export async function saveCategoriaPrato(
  values: CategoriaPratoFormValues,
  categoriaId?: string,
) {
  const nome = normalizeNome(values.nome)
  let duplicateQuery = supabase.from('categorias_pratos').select('id, nome')

  if (categoriaId) {
    duplicateQuery = duplicateQuery.neq('id', categoriaId)
  }

  const { data: duplicated, error: duplicateError } = await duplicateQuery

  if (duplicateError) {
    throw new Error(getFriendlyError(duplicateError.message))
  }

  const normalizedNome = nome.toLocaleLowerCase('pt-BR')
  const hasDuplicate = (duplicated ?? []).some(
    (categoria) =>
      normalizeNome(categoria.nome).toLocaleLowerCase('pt-BR') === normalizedNome,
  )

  if (hasDuplicate) {
    throw new Error('Ja existe uma categoria de prato cadastrada com esse nome.')
  }

  const payload = {
    nome,
    ordem_exibicao: values.ordem_exibicao,
    ativo: values.ativo,
  }

  const response = categoriaId
    ? await supabase.from('categorias_pratos').update(payload).eq('id', categoriaId)
    : await supabase.from('categorias_pratos').insert(payload)

  if (response.error) {
    throw new Error(getFriendlyError(response.error.message))
  }
}

export async function setCategoriaPratoAtivo(id: string, ativo: boolean) {
  const { error } = await supabase
    .from('categorias_pratos')
    .update({ ativo })
    .eq('id', id)

  if (error) {
    throw new Error(getFriendlyError(error.message))
  }
}

export async function listCategoriasPratosMenu() {
  const { data, error } = await supabase
    .from('categorias_pratos')
    .select('id, nome, ordem_exibicao, ativo')
    .eq('ativo', true)
    .order('ordem_exibicao', { ascending: true })
    .order('nome', { ascending: true })

  if (error) {
    throw new Error(getFriendlyError(error.message))
  }

  return data ?? []
}
