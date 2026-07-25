import type { UnidadeBase, UnidadeCompra } from '../types/ingrediente'

export const unidadesCompra: UnidadeCompra[] = ['kg', 'g', 'l', 'ml', 'unidade']

export function getUnidadeBase(unidadeCompra: UnidadeCompra): UnidadeBase {
  if (unidadeCompra === 'kg' || unidadeCompra === 'g') {
    return 'g'
  }

  if (unidadeCompra === 'l' || unidadeCompra === 'ml') {
    return 'ml'
  }

  return 'unidade'
}

export function normalizeNome(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}
