import { z } from 'zod'

export const categoriaPratoSchema = z.object({
  nome: z
    .string()
    .transform((value) => value.trim().replace(/\s+/g, ' '))
    .pipe(
      z
        .string()
        .min(1, 'Informe o nome da categoria.')
        .min(2, 'O nome deve ter pelo menos 2 caracteres.'),
    ),
  ordem_exibicao: z
    .number('Informe a ordem de exibicao.')
    .int('A ordem de exibicao deve ser um numero inteiro.')
    .min(0, 'A ordem de exibicao nao pode ser negativa.'),
  ativo: z.boolean(),
})
