import { supabase } from './supabaseClient'
import type {
  DashboardCategory,
  DashboardData,
  DashboardRecipe,
  DashboardSearchItem,
  DashboardUpdate,
} from '../types/dashboard'

type PratoRow = {
  id: string
  nome: string
  categoria_id: string
  custo_total: number
  updated_at: string
  created_at: string
  categorias_pratos: { id: string; nome: string } | null
}

type IngredienteRow = {
  id: string
  nome: string
  updated_at: string
}

type CategoriaRow = {
  id: string
  nome: string
  updated_at: string
}

type ItemRow = {
  id: string
  prato_id: string
  quantidade: number
  unidade_base: 'g' | 'ml' | 'unidade' | null
  custo_calculado: number
  updated_at: string
  ingredientes: { custo_unidade_base: number } | null
  pratos: { id: string; nome: string } | null
}

function getFriendlyError(message: string) {
  if (message.includes('permission denied') || message.includes('row-level security')) {
    return 'Usuario sem permissao para carregar o painel.'
  }

  if (message.includes('Failed to fetch')) {
    return 'Falha de conexao com o Supabase.'
  }

  return message
}

export async function getDashboardData(): Promise<DashboardData> {
  const [
    pratosResponse,
    ingredientesResponse,
    categoriasResponse,
    itensResponse,
  ] = await Promise.all([
    supabase
      .from('pratos')
      .select(
        `
          id,
          nome,
          categoria_id,
          custo_total,
          updated_at,
          created_at,
          categorias_pratos (
            id,
            nome
          )
        `,
      )
      .eq('ativo', true),
    supabase
      .from('ingredientes')
      .select('id, nome, updated_at')
      .eq('ativo', true),
    supabase
      .from('categorias_pratos')
      .select('id, nome, updated_at')
      .eq('ativo', true),
    supabase.from('itens_ficha_tecnica').select(
      `
        id,
        prato_id,
        quantidade,
        unidade_base,
        custo_calculado,
        updated_at,
        ingredientes (
          custo_unidade_base
        ),
        pratos (
          id,
          nome
        )
      `,
    ),
  ])

  const failed = [
    pratosResponse,
    ingredientesResponse,
    categoriasResponse,
    itensResponse,
  ].find((response) => response.error)

  if (failed?.error) {
    throw new Error(getFriendlyError(failed.error.message))
  }

  const pratos = (pratosResponse.data ?? []) as unknown as PratoRow[]
  const ingredientes = (ingredientesResponse.data ?? []) as IngredienteRow[]
  const categorias = (categoriasResponse.data ?? []) as CategoriaRow[]
  const itens = (itensResponse.data ?? []) as unknown as ItemRow[]
  const itensByPrato = groupItemsByPrato(itens)

  const recipes = pratos.map<DashboardRecipe>((prato) => {
    const recipeItems = itensByPrato.get(prato.id) ?? []
    const pendencias = recipeItems.filter(
      (item) => Number(item.quantidade ?? 0) <= 0 || !item.unidade_base,
    ).length
    const custoTotal = recipeItems.reduce((total, item) => {
      const custoUnitario = Number(item.ingredientes?.custo_unidade_base ?? 0)
      return total + Number(item.quantidade ?? 0) * custoUnitario
    }, 0)

    return {
      id: prato.id,
      nome: prato.nome,
      categoria: prato.categorias_pratos?.nome ?? 'Sem categoria',
      custoTotal,
      ingredientes: recipeItems.length,
      pendencias,
      updatedAt: prato.updated_at,
    }
  })

  const fichasCompletas = recipes.filter(
    (recipe) => recipe.ingredientes > 0 && recipe.pendencias === 0,
  ).length
  const fichasIncompletas = recipes.filter(
    (recipe) => recipe.ingredientes === 0 || recipe.pendencias > 0,
  ).length
  const pratosComCusto = recipes.filter((recipe) => recipe.custoTotal > 0)
  const custoMedioPratos =
    pratosComCusto.length > 0
      ? pratosComCusto.reduce((total, recipe) => total + recipe.custoTotal, 0) /
        pratosComCusto.length
      : 0
  const ultimaAtualizacao = [
    ...pratos.map((item) => item.updated_at),
    ...ingredientes.map((item) => item.updated_at),
    ...categorias.map((item) => item.updated_at),
    ...itens.map((item) => item.updated_at),
  ]
    .filter(Boolean)
    .sort()
    .at(-1) ?? null

  return {
    stats: {
      totalPratos: pratos.length,
      totalIngredientes: ingredientes.length,
      fichasCompletas,
      fichasIncompletas,
      custoMedioPratos,
      ultimaAtualizacao,
    },
    pendingRecipes: recipes
      .filter((recipe) => recipe.ingredientes === 0 || recipe.pendencias > 0)
      .sort((a, b) => b.pendencias - a.pendencias)
      .slice(0, 8),
    expensiveRecipes: [...recipes]
      .sort((a, b) => b.custoTotal - a.custoTotal)
      .slice(0, 10),
    categories: buildCategories(categorias, pratos),
    recentUpdates: buildRecentUpdates(pratos, ingredientes, categorias, itens),
    searchItems: buildSearchItems(pratos, ingredientes, categorias),
    footer: {
      categorias: categorias.length,
      ingredientes: ingredientes.length,
      pratos: pratos.length,
      itensFicha: itens.length,
      atualizadoHoje: ultimaAtualizacao
        ? new Date(ultimaAtualizacao).toDateString() === new Date().toDateString()
        : false,
    },
  }
}

function groupItemsByPrato(itens: ItemRow[]) {
  const map = new Map<string, ItemRow[]>()

  itens.forEach((item) => {
    const current = map.get(item.prato_id) ?? []
    current.push(item)
    map.set(item.prato_id, current)
  })

  return map
}

function buildCategories(categorias: CategoriaRow[], pratos: PratoRow[]) {
  return categorias
    .map<DashboardCategory>((categoria) => ({
      id: categoria.id,
      nome: categoria.nome,
      pratos: pratos.filter((prato) => prato.categoria_id === categoria.id).length,
    }))
    .sort((a, b) => b.pratos - a.pratos)
}

function buildRecentUpdates(
  pratos: PratoRow[],
  ingredientes: IngredienteRow[],
  categorias: CategoriaRow[],
  itens: ItemRow[],
) {
  const updates: DashboardUpdate[] = [
    ...pratos.map((prato) => ({
      id: `prato-${prato.id}`,
      nome: prato.nome,
      tipo: prato.created_at === prato.updated_at ? 'Novo prato' : 'Prato atualizado',
      data: prato.updated_at,
    })),
    ...ingredientes.map((ingrediente) => ({
      id: `ingrediente-${ingrediente.id}`,
      nome: ingrediente.nome,
      tipo: 'Ingrediente atualizado',
      data: ingrediente.updated_at,
    })),
    ...categorias.map((categoria) => ({
      id: `categoria-${categoria.id}`,
      nome: categoria.nome,
      tipo: 'Categoria atualizada',
      data: categoria.updated_at,
    })),
    ...itens.map((item) => ({
      id: `item-${item.id}`,
      nome: item.pratos?.nome ?? 'Ficha tecnica',
      tipo: 'Ficha alterada',
      data: item.updated_at,
    })),
  ]

  return updates.sort((a, b) => b.data.localeCompare(a.data)).slice(0, 8)
}

function buildSearchItems(
  pratos: PratoRow[],
  ingredientes: IngredienteRow[],
  categorias: CategoriaRow[],
) {
  const pratosItems = pratos.map<DashboardSearchItem>((prato) => ({
    id: `prato-${prato.id}`,
    tipo: 'Prato',
    nome: prato.nome,
    detalhe: prato.categorias_pratos?.nome ?? 'Sem categoria',
    path: `/pratos/${prato.id}/ficha-tecnica`,
  }))
  const ingredientesItems = ingredientes.map<DashboardSearchItem>((ingrediente) => ({
    id: `ingrediente-${ingrediente.id}`,
    tipo: 'Ingrediente',
    nome: ingrediente.nome,
    detalhe: 'Cadastro de ingrediente',
    path: '/ingredientes',
  }))
  const categoriasItems = categorias.map<DashboardSearchItem>((categoria) => ({
    id: `categoria-${categoria.id}`,
    tipo: 'Categoria',
    nome: categoria.nome,
    detalhe: 'Aba da planilha',
    path: `/pratos?categoria=${categoria.id}`,
  }))

  return [...pratosItems, ...ingredientesItems, ...categoriasItems]
}
