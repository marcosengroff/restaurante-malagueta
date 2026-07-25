import type { Database } from './database'
import type { StatusFiltro } from './ingrediente'

export type CategoriaPrato = Database['public']['Tables']['categorias_pratos']['Row']

export type CategoriaPratoComContagem = CategoriaPrato & {
  pratos_vinculados: number
}

export type CategoriaPratoFormValues = {
  nome: string
  ordem_exibicao: number
  ativo: boolean
}

export type CategoriaPratoSort = 'ordem_exibicao' | 'nome' | 'codigo'

export type CategoriaPratoFilters = {
  search: string
  status: StatusFiltro
  sortBy: CategoriaPratoSort
  page: number
  pageSize: number
}

export type CategoriaPratoListResult = {
  data: CategoriaPratoComContagem[]
  count: number
}
