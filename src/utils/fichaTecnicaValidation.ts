import { z } from 'zod'

export const fichaTecnicaItemSchema = z.object({
  ingrediente_id: z.string().min(1, 'Selecione o ingrediente.'),
  quantidade: z
    .number('Informe a quantidade.')
    .positive('A quantidade deve ser maior que zero.'),
  observacao: z.string().trim(),
})
