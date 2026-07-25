import { z } from 'zod'

export const categoriaIngredienteSchema = z.object({
  nome: z
    .string()
    .transform((value) => value.trim().replace(/\s+/g, ' '))
    .pipe(
      z
        .string()
        .min(1, 'Informe o nome da categoria.')
        .min(2, 'O nome deve ter pelo menos 2 caracteres.'),
    ),
  ativo: z.boolean(),
})
