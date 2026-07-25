import type { CategoriaPrato } from './categoriaPrato'
import type { Database } from './database'
import type { StatusFiltro } from './ingrediente'

export type Prato = Database['public']['Tables']['pratos']['Row'] & {
  categoria?: Pick<CategoriaPrato, 'id' | 'nome' | 'codigo' | 'ativo'> | null
}

export type PratoFormValues = {
  nome: string
  categoria_id: string
  descricao: string
  rendimento: number
  peso_final: number | null
  tempo_preparo: number | null
  observacoes: string
  ativo: boolean
}

export type PratoSort = 'nome' | 'codigo' | 'categoria'

export type PratoFilters = {
  search: string
  categoriaId: string
  status: StatusFiltro
  sortBy: PratoSort
  page: number
  pageSize: number
}

export type PratoListResult = {
  data: Prato[]
  count: number
}

export type PratoAbaPlanilha = Prato & {
  itens: Array<{
    id: string
    quantidade: number
    unidade_base: 'g' | 'ml' | 'unidade'
    custo_calculado: number
    ordem: number
    ingredientes: {
      nome: string
      custo_unidade_base: number
    } | null
  }>
}
