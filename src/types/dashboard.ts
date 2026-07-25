export type DashboardStats = {
  totalPratos: number
  totalIngredientes: number
  fichasCompletas: number
  fichasIncompletas: number
  custoMedioPratos: number
  ultimaAtualizacao: string | null
}

export type DashboardRecipe = {
  id: string
  nome: string
  categoria: string
  custoTotal: number
  ingredientes: number
  pendencias: number
  updatedAt: string
}

export type DashboardCategory = {
  id: string
  nome: string
  pratos: number
}

export type DashboardSearchItem = {
  id: string
  tipo: 'Prato' | 'Ingrediente' | 'Categoria'
  nome: string
  detalhe: string
  path: string
}

export type DashboardUpdate = {
  id: string
  nome: string
  tipo: string
  data: string
}

export type DashboardData = {
  stats: DashboardStats
  pendingRecipes: DashboardRecipe[]
  expensiveRecipes: DashboardRecipe[]
  categories: DashboardCategory[]
  recentUpdates: DashboardUpdate[]
  searchItems: DashboardSearchItem[]
  footer: {
    categorias: number
    ingredientes: number
    pratos: number
    itensFicha: number
    atualizadoHoje: boolean
  }
}
