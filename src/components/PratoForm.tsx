import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { CategoriaPrato } from '../types/categoriaPrato'
import type { Prato, PratoFormValues } from '../types/prato'
import { pratoSchema } from '../utils/pratoValidation'

type PratoFormProps = {
  categorias: CategoriaPrato[]
  prato: Prato | null
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (values: PratoFormValues) => Promise<void>
}

const defaultValues: PratoFormValues = {
  nome: '',
  categoria_id: '',
  descricao: '',
  rendimento: 1,
  peso_final: null,
  tempo_preparo: null,
  observacoes: '',
  ativo: true,
}

export function PratoForm({
  categorias,
  prato,
  isSubmitting,
  onCancel,
  onSubmit,
}: PratoFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PratoFormValues>({
    resolver: zodResolver(pratoSchema),
    defaultValues,
  })

  useEffect(() => {
    if (prato) {
      reset({
        nome: prato.nome,
        categoria_id: prato.categoria_id,
        descricao: prato.descricao ?? '',
        rendimento: prato.rendimento,
        peso_final: prato.peso_final,
        tempo_preparo: prato.tempo_preparo,
        observacoes: prato.observacoes ?? '',
        ativo: prato.ativo,
      })
      return
    }

    reset(defaultValues)
  }, [prato, reset])

  async function handleValidSubmit(values: PratoFormValues) {
    await onSubmit({
      ...values,
      peso_final: Number.isNaN(values.peso_final) ? null : values.peso_final,
      tempo_preparo: Number.isNaN(values.tempo_preparo)
        ? null
        : values.tempo_preparo,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-0 sm:items-center sm:p-4">
      <section className="max-h-[92vh] w-full overflow-y-auto rounded-t border border-stone-200 bg-white p-5 shadow-xl sm:mx-auto sm:max-w-2xl sm:rounded">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              {prato ? 'Editar prato' : 'Novo prato'}
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

        {prato && (
          <div className="mb-4 rounded border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-slate-600">
            Codigo: <strong className="text-slate-950">{prato.codigo}</strong>
          </div>
        )}

        {categorias.length === 0 && (
          <div className="mb-5 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Nenhuma categoria de prato ativa foi encontrada. Cadastre uma categoria
            antes de criar pratos.
          </div>
        )}

        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={handleSubmit(handleValidSubmit)}
        >
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Nome *</span>
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

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Categoria *</span>
            <select
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
              {...register('categoria_id')}
            >
              <option value="">Selecione</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
            {errors.categoria_id && (
              <span className="mt-1 block text-xs text-red-700">
                {errors.categoria_id.message}
              </span>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Rendimento</span>
            <input
              type="number"
              min="0"
              step="0.0001"
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
              {...register('rendimento', { valueAsNumber: true })}
            />
            {errors.rendimento && (
              <span className="mt-1 block text-xs text-red-700">
                {errors.rendimento.message}
              </span>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Peso final</span>
            <input
              type="number"
              min="0"
              step="0.0001"
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
              {...register('peso_final', { valueAsNumber: true })}
            />
            {errors.peso_final && (
              <span className="mt-1 block text-xs text-red-700">
                {errors.peso_final.message}
              </span>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Tempo de preparo
            </span>
            <input
              type="number"
              min="1"
              step="1"
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
              {...register('tempo_preparo', { valueAsNumber: true })}
            />
            {errors.tempo_preparo && (
              <span className="mt-1 block text-xs text-red-700">
                {errors.tempo_preparo.message}
              </span>
            )}
          </label>

          <label className="flex items-center gap-2 rounded border border-stone-200 px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 accent-red-700"
              {...register('ativo')}
            />
            Prato ativo
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Descricao</span>
            <textarea
              rows={3}
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
              {...register('descricao')}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Observacoes</span>
            <textarea
              rows={3}
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
              {...register('observacoes')}
            />
          </label>

          <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
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
