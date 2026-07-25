import type { Database } from './database'

export type UnidadeCompra = 'kg' | 'g' | 'l' | 'ml' | 'unidade'
export type UnidadeBase = 'g' | 'ml' | 'unidade'
export type StatusFiltro = 'todos' | 'ativos' | 'inativos'

export type CategoriaIngrediente =
  Database['public']['Tables']['categorias_ingredientes']['Row']

export type Ingrediente = Database['public']['Tables']['ingredientes']['Row'] & {
  categoria?: Pick<CategoriaIngrediente, 'id' | 'nome'> | null
}

export type IngredienteFormValues = {
  nome: string
  categoria_id: string
  unidade_compra: UnidadeCompra
  quantidade_embalagem: number
  preco_embalagem: number
  observacoes: string
  ativo: boolean
}

export type IngredienteFilters = {
  search: string
  categoriaId: string
  status: StatusFiltro
  unidadeCompra: UnidadeCompra | ''
  page: number
  pageSize: number
}

export type IngredienteListResult = {
  data: Ingrediente[]
  count: number
}
