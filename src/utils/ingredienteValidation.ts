import { z } from 'zod'
import { unidadesCompra } from './ingredientes'

export const ingredienteSchema = z.object({
  nome: z
    .string()
    .transform((value) => value.trim().replace(/\s+/g, ' '))
    .pipe(
      z
        .string()
        .min(1, 'Informe o nome do ingrediente.')
        .min(2, 'O nome deve ter pelo menos 2 caracteres.'),
    ),
  categoria_id: z.string(),
  unidade_compra: z.enum(unidadesCompra, {
    message: 'Selecione a unidade de compra.',
  }),
  quantidade_embalagem: z
    .number('Informe a quantidade da embalagem.')
    .positive('A quantidade da embalagem deve ser maior que zero.'),
  preco_embalagem: z
    .number('Informe o preco da embalagem.')
    .min(0, 'O preco da embalagem nao pode ser negativo.'),
  observacoes: z.string().trim(),
  ativo: z.boolean(),
})
