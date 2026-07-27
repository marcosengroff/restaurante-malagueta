import { z } from 'zod'

const nullablePositiveNumber = z.union([
  z.number().positive('Informe um valor maior que zero.'),
  z.nan().transform(() => null),
  z.null(),
])

const nullablePositiveInteger = z.union([
  z
    .number()
    .int('O tempo de preparo deve ser um numero inteiro.')
    .positive('O tempo de preparo deve ser maior que zero.'),
  z.nan().transform(() => null),
  z.null(),
])

export const pratoSchema = z.object({
  nome: z
    .string()
    .transform((value) => value.trim().replace(/\s+/g, ' '))
    .pipe(
      z
        .string()
        .min(1, 'Informe o nome do prato.')
        .min(2, 'O nome deve ter pelo menos 2 caracteres.'),
    ),
  categoria_id: z.string().min(1, 'Selecione a categoria do prato.'),
  descricao: z.string().trim(),
  rendimento: z
    .number('Informe o rendimento.')
    .positive('O rendimento deve ser maior que zero.'),
  peso_final: nullablePositiveNumber,
  tempo_preparo: nullablePositiveInteger,
  observacoes: z.string().trim(),
  ativo: z.boolean(),
})
