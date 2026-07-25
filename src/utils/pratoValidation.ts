import { z } from 'zod'

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
  peso_final: z
    .number()
    .positive('Informe um valor maior que zero.')
    .nullable(),
  tempo_preparo: z
    .number()
    .int('O tempo de preparo deve ser um numero inteiro.')
    .positive('O tempo de preparo deve ser maior que zero.')
    .nullable(),
  observacoes: z.string().trim(),
  ativo: z.boolean(),
})
