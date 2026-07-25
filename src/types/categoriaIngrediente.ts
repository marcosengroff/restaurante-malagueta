import type { Database } from './database'
import type { StatusFiltro } from './ingrediente'

export type CategoriaIngrediente =
  Database['public']['Tables']['categorias_ingredientes']['Row']

export type CategoriaIngredienteComContagem = CategoriaIngrediente & {
  ingredientes_vinculados: number
}

export type CategoriaIngredienteFormValues = {
  nome: string
  ativo: boolean
}

export type CategoriaIngredienteFilters = {
  search: string
  status: StatusFiltro
  page: number
  pageSize: number
}

export type CategoriaIngredienteListResult = {
  data: CategoriaIngredienteComContagem[]
  count: number
}
