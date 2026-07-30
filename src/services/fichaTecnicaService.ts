import { supabase } from './supabaseClient'
import type {
  FichaTecnicaData,
  FichaTecnicaFormValues,
  IngredienteFicha,
  ItemFichaTecnica,
} from '../types/fichaTecnica'
import { invalidateDashboardCache } from './dashboardService'

function getFriendlyError(message: string) {
  if (message.includes('itens_ficha_tecnica_prato_ingrediente_unique')) {
    return 'Este ingrediente ja esta cadastrado nesta ficha tecnica.'
  }

  if (message.includes('permission denied') || message.includes('row-level security')) {
    return 'Usuario sem permissao para realizar esta operacao.'
  }

  if (message.includes('Failed to fetch')) {
    return 'Falha de conexao com o Supabase.'
  }

  return message
}

type PratoRow = {
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
  categorias_pratos: {
    id: string
    codigo: string
    nome: string
    ativo: boolean
  } | null
}

type ItemRow = {
  id: string
  prato_id: string
  ingrediente_id: string
  quantidade: number
  unidade_base: 'g' | 'ml' | 'unidade'
  observacao: string | null
  ordem: number
  created_at: string
  updated_at: string
  ingredientes: {
    id: string
    nome: string
    unidade_base: 'g' | 'ml' | 'unidade'
    custo_unidade_base: number
    ativo: boolean
    categorias_ingredientes: {
      id: string
      nome: string
    } | null
  }
}

function mapItem(row: ItemRow): ItemFichaTecnica {
  const ingrediente: IngredienteFicha = {
    id: row.ingredientes.id,
    nome: row.ingredientes.nome,
    unidade_base: row.ingredientes.unidade_base,
    custo_unidade_base: row.ingredientes.custo_unidade_base,
    ativo: row.ingredientes.ativo,
    categoria: row.ingredientes.categorias_ingredientes,
  }

  return {
    id: row.id,
    prato_id: row.prato_id,
    ingrediente_id: row.ingrediente_id,
    quantidade: row.quantidade,
    unidade_base: row.ingredientes.unidade_base,
    observacao: row.observacao,
    ordem: row.ordem,
    created_at: row.created_at,
    updated_at: row.updated_at,
    ingrediente,
    custo_unitario: row.ingredientes.custo_unidade_base,
    custo_total: row.quantidade * row.ingredientes.custo_unidade_base,
  }
}

export async function getFichaTecnica(pratoId: string): Promise<FichaTecnicaData> {
  const { data: prato, error: pratoError } = await supabase
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
    )
    .eq('id', pratoId)
    .single()

  if (pratoError) {
    throw new Error(getFriendlyError(pratoError.message))
  }

  const { data: itens, error: itensError } = await supabase
    .from('itens_ficha_tecnica')
    .select(
      `
        id,
        prato_id,
        ingrediente_id,
        quantidade,
        unidade_base,
        observacao,
        ordem,
        created_at,
        updated_at,
        ingredientes (
          id,
          nome,
          unidade_base,
          custo_unidade_base,
          ativo,
          categorias_ingredientes (
            id,
            nome
          )
        )
      `,
    )
    .eq('prato_id', pratoId)
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: true })

  if (itensError) {
    throw new Error(getFriendlyError(itensError.message))
  }

  const pratoRow = prato as unknown as PratoRow

  return {
    prato: {
      ...pratoRow,
      categoria: pratoRow.categorias_pratos,
    },
    itens: ((itens ?? []) as unknown as ItemRow[]).map(mapItem),
  }
}

export async function listIngredientesParaFicha() {
  const { data, error } = await supabase
    .from('ingredientes')
    .select(
      `
        id,
        nome,
        unidade_base,
        custo_unidade_base,
        ativo,
        categorias_ingredientes (
          id,
          nome
        )
      `,
    )
    .eq('ativo', true)
    .order('nome', { ascending: true })

  if (error) {
    throw new Error(getFriendlyError(error.message))
  }

  return ((data ?? []) as unknown as Array<{
    id: string
    nome: string
    unidade_base: 'g' | 'ml' | 'unidade'
    custo_unidade_base: number
    ativo: boolean
    categorias_ingredientes: { id: string; nome: string } | null
  }>).map((ingrediente) => ({
    id: ingrediente.id,
    nome: ingrediente.nome,
    unidade_base: ingrediente.unidade_base,
    custo_unidade_base: ingrediente.custo_unidade_base,
    ativo: ingrediente.ativo,
    categoria: ingrediente.categorias_ingredientes,
  }))
}

export async function saveItemFichaTecnica(
  pratoId: string,
  values: FichaTecnicaFormValues,
  itemId?: string,
) {
  const { data: ingrediente, error: ingredienteError } = await supabase
    .from('ingredientes')
    .select('unidade_base')
    .eq('id', values.ingrediente_id)
    .single()

  if (ingredienteError) {
    throw new Error(getFriendlyError(ingredienteError.message))
  }

  const payload = {
    prato_id: pratoId,
    ingrediente_id: values.ingrediente_id,
    quantidade: values.quantidade,
    unidade_base: ingrediente.unidade_base,
    quantidade_utilizada: values.quantidade,
    unidade_utilizada: ingrediente.unidade_base,
    observacao: values.observacao.trim() || null,
  }

  const response = itemId
    ? await supabase.from('itens_ficha_tecnica').update(payload).eq('id', itemId)
    : await supabase.from('itens_ficha_tecnica').insert(payload)

  if (response.error) {
    throw new Error(getFriendlyError(response.error.message))
  }

  invalidateDashboardCache()
}

export async function deleteItemFichaTecnica(itemId: string) {
  const { error } = await supabase
    .from('itens_ficha_tecnica')
    .delete()
    .eq('id', itemId)

  if (error) {
    throw new Error(getFriendlyError(error.message))
  }

  invalidateDashboardCache()
}

export async function deleteFichaTecnicaByPrato(pratoId: string) {
  const { error } = await supabase
    .from('itens_ficha_tecnica')
    .delete()
    .eq('prato_id', pratoId)

  if (error) {
    throw new Error(getFriendlyError(error.message))
  }

  invalidateDashboardCache()
}
