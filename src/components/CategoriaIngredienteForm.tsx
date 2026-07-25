import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type {
  CategoriaIngredienteComContagem,
  CategoriaIngredienteFormValues,
} from '../types/categoriaIngrediente'
import { categoriaIngredienteSchema } from '../utils/categoriaIngredienteValidation'

type CategoriaIngredienteFormProps = {
  categoria: CategoriaIngredienteComContagem | null
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (values: CategoriaIngredienteFormValues) => Promise<void>
}

const defaultValues: CategoriaIngredienteFormValues = {
  nome: '',
  ativo: true,
}

export function CategoriaIngredienteForm({
  categoria,
  isSubmitting,
  onCancel,
  onSubmit,
}: CategoriaIngredienteFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoriaIngredienteFormValues>({
    resolver: zodResolver(categoriaIngredienteSchema),
    defaultValues,
  })

  useEffect(() => {
    if (categoria) {
      reset({
        nome: categoria.nome,
        ativo: categoria.ativo,
      })
      return
    }

    reset(defaultValues)
  }, [categoria, reset])

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-0 sm:items-center sm:p-4">
      <section className="max-h-[92vh] w-full overflow-y-auto rounded-t border border-stone-200 bg-white p-5 shadow-xl sm:mx-auto sm:max-w-xl sm:rounded">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              {categoria ? 'Editar categoria' : 'Nova categoria'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              O codigo e gerado automaticamente pelo banco de dados.
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

        {categoria && (
          <div className="mb-4 rounded border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-slate-600">
            Codigo:{' '}
            <strong className="font-semibold text-slate-950">
              {categoria.codigo}
            </strong>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nome</span>
            <input
              type="text"
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
              {...register('nome')}
            />
            {errors.nome && (
              <span className="mt-1 block text-xs text-red-700">
                {errors.nome.message}
              </span>
            )}
          </label>

          <label className="flex items-center gap-2 rounded border border-stone-200 px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 accent-red-700"
              {...register('ativo')}
            />
            Categoria ativa
          </label>

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
