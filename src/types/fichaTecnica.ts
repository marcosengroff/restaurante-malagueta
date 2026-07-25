import type { CategoriaIngrediente } from './ingrediente'
import type { Prato } from './prato'

export type IngredienteFicha = {
  id: string
  nome: string
  unidade_base: 'g' | 'ml' | 'unidade'
  custo_unidade_base: number
  ativo: boolean
  categoria?: Pick<CategoriaIngrediente, 'id' | 'nome'> | null
}

export type ItemFichaTecnica = {
  id: string
  prato_id: string
  ingrediente_id: string
  quantidade: number
  unidade_base: 'g' | 'ml' | 'unidade'
  observacao: string | null
  ordem: number
  created_at: string
  updated_at: string
  ingrediente: IngredienteFicha
  custo_unitario: number
  custo_total: number
}

export type FichaTecnicaPrato = Prato

export type FichaTecnicaFormValues = {
  ingrediente_id: string
  quantidade: number
  observacao: string
}

export type FichaTecnicaData = {
  prato: FichaTecnicaPrato
  itens: ItemFichaTecnica[]
}
