import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type {
  FichaTecnicaFormValues,
  IngredienteFicha,
  ItemFichaTecnica,
} from '../types/fichaTecnica'
import { formatCurrency } from '../utils/formatters'
import { fichaTecnicaItemSchema } from '../utils/fichaTecnicaValidation'

type FichaTecnicaItemFormProps = {
  ingredientes: IngredienteFicha[]
  item: ItemFichaTecnica | null
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (values: FichaTecnicaFormValues) => Promise<void>
}

const defaultValues: FichaTecnicaFormValues = {
  ingrediente_id: '',
  quantidade: 1,
  observacao: '',
}

export function FichaTecnicaItemForm({
  ingredientes,
  item,
  isSubmitting,
  onCancel,
  onSubmit,
}: FichaTecnicaItemFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FichaTecnicaFormValues>({
    resolver: zodResolver(fichaTecnicaItemSchema),
    defaultValues,
  })

  const ingredienteId = watch('ingrediente_id')
  const quantidade = watch('quantidade')
  const ingredienteSelecionado = useMemo(
    () => ingredientes.find((ingrediente) => ingrediente.id === ingredienteId),
    [ingredienteId, ingredientes],
  )
  const custoTotal =
    ingredienteSelecionado && quantidade > 0
      ? quantidade * ingredienteSelecionado.custo_unidade_base
      : 0

  useEffect(() => {
    if (item) {
      reset({
        ingrediente_id: item.ingrediente_id,
        quantidade: item.quantidade,
        observacao: item.observacao ?? '',
      })
      return
    }

    reset(defaultValues)
  }, [item, reset])

  async function handleValidSubmit(values: FichaTecnicaFormValues) {
    await onSubmit({
      ...values,
      observacao: '',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-0 sm:items-center sm:p-4">
      <section className="max-h-[92vh] w-full overflow-y-auto rounded-t border border-stone-200 bg-white p-5 shadow-xl sm:mx-auto sm:max-w-xl sm:rounded">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              {item ? 'Editar ingrediente' : 'Adicionar ingrediente'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              O custo usa sempre o cadastro atual do ingrediente.
            </p>
          </div>
          <button
            type="button"
            className="rounded p-2 text-slate-500 hover:bg-stone-100"
            aria-label="Fechar formulario"
            onClick={onCancel}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(handleValidSubmit)}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Ingrediente</span>
            <select
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
              {...register('ingrediente_id')}
            >
              <option value="">Selecione</option>
              {ingredientes.map((ingrediente) => (
                <option key={ingrediente.id} value={ingrediente.id}>
                  {ingrediente.nome}
                </option>
              ))}
            </select>
            {errors.ingrediente_id && (
              <span className="mt-1 block text-xs text-red-700">
                {errors.ingrediente_id.message}
              </span>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Quantidade</span>
            <input
              type="number"
              min="0"
              step="0.0001"
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
              {...register('quantidade', { valueAsNumber: true })}
            />
            {errors.quantidade && (
              <span className="mt-1 block text-xs text-red-700">
                {errors.quantidade.message}
              </span>
            )}
          </label>

          <div className="grid gap-3 rounded border border-stone-200 bg-stone-50 p-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500">Unidade</p>
              <p className="font-semibold text-slate-950">
                {ingredienteSelecionado?.unidade_base ?? '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Custo unitario</p>
              <p className="font-semibold text-slate-950">
                {ingredienteSelecionado
                  ? `${formatCurrency(ingredienteSelecionado.custo_unidade_base, 4)}`
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Custo total</p>
              <p className="font-semibold text-slate-950">
                {formatCurrency(custoTotal)}
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="rounded border border-stone-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-stone-50"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
