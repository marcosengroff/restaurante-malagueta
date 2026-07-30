import { supabase } from './supabaseClient'
import type { CategoriaPrato } from '../types/categoriaPrato'
import type {
  Prato,
  PratoAbaPlanilha,
  PratoFilters,
  PratoFormValues,
  PratoListResult,
} from '../types/prato'
import { normalizeNome } from '../utils/ingredientes'
import { invalidateDashboardCache } from './dashboardService'

const categoriasCacheTtlMs = 60_000
let categoriasAtivasCache:
  | { data: CategoriaPrato[]; expiresAt: number }
  | null = null
let categoriasAtivasPromise: Promise<CategoriaPrato[]> | null = null

export function invalidateCategoriasPratosAtivasCache() {
  categoriasAtivasCache = null
  categoriasAtivasPromise = null
}

type PratoRowWithCategoria = DatabasePratoRow & {
  categorias_pratos: Pick<CategoriaPrato, 'id' | 'nome' | 'codigo' | 'ativo'> | null
}

type DatabasePratoRow = {
  id: string
  codigo: string
  nome: string
  categoria_id: string
  descricao: string | null
  rendimento: number
  peso_final: number | null
  tempo_preparo: number | null
  observacoes: string | null
  custo_total: number
  ativo: boolean
  created_at: string
  updated_at: string
}

function getFriendlyError(message: string) {
  if (message.includes('pratos_nome_unique')) {
    return 'Ja existe um prato cadastrado com esse nome.'
  }

  if (message.includes('permission denied') || message.includes('row-level security')) {
    return 'Usuario sem permissao para realizar esta operacao.'
  }

  if (message.includes('Failed to fetch')) {
    return 'Falha de conexao com o Supabase.'
  }

  return message
}

function mapPrato(row: PratoRowWithCategoria): Prato {
  const { categorias_pratos: categoria, ...prato } = row

  return {
    ...prato,
    categoria,
  }
}

export async function listCategoriasPratosAtivas() {
  if (categoriasAtivasCache && categoriasAtivasCache.expiresAt > Date.now()) {
    return categoriasAtivasCache.data
  }

  if (categoriasAtivasPromise) {
    return categoriasAtivasPromise
  }

  categoriasAtivasPromise = listCategoriasPratosAtivasFromSupabase().finally(() => {
    categoriasAtivasPromise = null
  })

  return categoriasAtivasPromise
}

async function listCategoriasPratosAtivasFromSupabase() {
  const { data, error } = await supabase
    .from('categorias_pratos')
    .select('*')
    .eq('ativo', true)
    .order('ordem_exibicao', { ascending: true })
    .order('nome', { ascending: true })

  if (error) {
    throw new Error(getFriendlyError(error.message))
  }

  const result = data ?? []
  categoriasAtivasCache = {
    data: result,
    expiresAt: Date.now() + categoriasCacheTtlMs,
  }

  return result
}

export async function listPratos(filters: PratoFilters): Promise<PratoListResult> {
  const from = (filters.page - 1) * filters.pageSize
  const to = from + filters.pageSize - 1
  const search = filters.search.trim()

  let query = supabase
    .from('pratos')
    .select(
      `
        *,
        categorias_pratos (
          id,
          codigo,
          nome,
          ativo
        )
      `,
      { count: 'exact' },
    )

  if (search) {
    query = query.or(`nome.ilike.%${search}%,codigo.ilike.%${search}%`)
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

  if (filters.sortBy === 'categoria') {
    query = query.order('categoria_id', { ascending: true }).order('nome', {
      ascending: true,
    })
  } else {
    query = query.order(filters.sortBy, { ascending: true })
  }

  const { data, error, count } = await query.range(from, to)

  if (error) {
    throw new Error(getFriendlyError(error.message))
  }

  return {
    data: ((data ?? []) as unknown as PratoRowWithCategoria[]).map(mapPrato),
    count: count ?? 0,
  }
}

export async function savePrato(values: PratoFormValues, pratoId?: string) {
  const nome = normalizeNome(values.nome)
  let duplicateQuery = supabase.from('pratos').select('id, nome')

  if (pratoId) {
    duplicateQuery = duplicateQuery.neq('id', pratoId)
  }

  const { data: duplicated, error: duplicateError } = await duplicateQuery

  if (duplicateError) {
    throw new Error(getFriendlyError(duplicateError.message))
  }

  const normalizedNome = nome.toLocaleLowerCase('pt-BR')
  const hasDuplicate = (duplicated ?? []).some(
    (prato) => normalizeNome(prato.nome).toLocaleLowerCase('pt-BR') === normalizedNome,
  )

  if (hasDuplicate) {
    throw new Error('Ja existe um prato cadastrado com esse nome.')
  }

  const payload = {
    nome,
    categoria_id: values.categoria_id,
    descricao: values.descricao.trim() || null,
    rendimento: values.rendimento,
    peso_final: values.peso_final,
    tempo_preparo: values.tempo_preparo,
    observacoes: values.observacoes.trim() || null,
    ativo: values.ativo,
  }

  const response = pratoId
    ? await supabase.from('pratos').update(payload).eq('id', pratoId)
    : await supabase.from('pratos').insert(payload)

  if (response.error) {
    throw new Error(getFriendlyError(response.error.message))
  }

  invalidateCategoriasPratosAtivasCache()
  invalidateDashboardCache()
}

export async function setPratoAtivo(id: string, ativo: boolean) {
  const { error } = await supabase.from('pratos').update({ ativo }).eq('id', id)

  if (error) {
    throw new Error(getFriendlyError(error.message))
  }

  invalidateDashboardCache()
}

export async function listPratosAbaPlanilha(categoriaId: string) {
  const { data, error } = await supabase
    .from('pratos')
    .select(
      `
        *,
        categorias_pratos (
          id,
          codigo,
          nome,
          ativo
        ),
        itens_ficha_tecnica (
          id,
          quantidade,
          unidade_base,
          custo_calculado,
          ordem,
          ingredientes (
            nome,
            custo_unidade_base
          )
        )
      `,
    )
    .eq('categoria_id', categoriaId)
    .eq('ativo', true)
    .order('codigo', { ascending: true })
    .order('ordem', {
      ascending: true,
      referencedTable: 'itens_ficha_tecnica',
    })

  if (error) {
    throw new Error(getFriendlyError(error.message))
  }

  return ((data ?? []) as unknown as Array<
    DatabasePratoRow & {
      categorias_pratos: Pick<CategoriaPrato, 'id' | 'nome' | 'codigo' | 'ativo'> | null
      itens_ficha_tecnica: PratoAbaPlanilha['itens']
    }
  >).map((row) => {
    const { categorias_pratos: categoria, itens_ficha_tecnica: itens, ...prato } = row

    return {
      ...prato,
      categoria,
      itens: itens ?? [],
    }
  })
}

export async function updateQuantidadeItemAbaPlanilha(
  itemId: string,
  quantidade: number,
) {
  const { error } = await supabase
    .from('itens_ficha_tecnica')
    .update({
      quantidade,
    })
    .eq('id', itemId)

  if (error) {
    throw new Error(getFriendlyError(error.message))
  }

  invalidateDashboardCache()
}
