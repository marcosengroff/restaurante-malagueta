import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type {
  CategoriaIngrediente,
  Ingrediente,
  IngredienteFormValues,
} from '../types/ingrediente'
import { getUnidadeBase, unidadesCompra } from '../utils/ingredientes'
import { ingredienteSchema } from '../utils/ingredienteValidation'

type IngredienteFormProps = {
  categorias: CategoriaIngrediente[]
  ingrediente: Ingrediente | null
  initialCategoriaId?: string
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (values: IngredienteFormValues) => Promise<void>
}

const defaultValues: IngredienteFormValues = {
  nome: '',
  categoria_id: '',
  unidade_compra: 'kg',
  quantidade_embalagem: 1,
  preco_embalagem: 0,
  observacoes: '',
  ativo: true,
}

export function IngredienteForm({
  categorias,
  ingrediente,
  initialCategoriaId = '',
  isSubmitting,
  onCancel,
  onSubmit,
}: IngredienteFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<IngredienteFormValues>({
    resolver: zodResolver(ingredienteSchema),
    defaultValues,
  })

  const unidadeCompra = watch('unidade_compra')

  useEffect(() => {
    if (ingrediente) {
      reset({
        nome: ingrediente.nome,
        categoria_id: ingrediente.categoria_id ?? '',
        unidade_compra: ingrediente.unidade_compra,
        quantidade_embalagem: ingrediente.quantidade_embalagem,
        preco_embalagem: ingrediente.preco_embalagem,
        observacoes: ingrediente.observacoes ?? '',
        ativo: ingrediente.ativo,
      })
      return
    }

    reset({
      ...defaultValues,
      categoria_id: initialCategoriaId,
    })
  }, [ingrediente, initialCategoriaId, reset])

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-0 sm:items-center sm:p-4">
      <section className="max-h-[92vh] w-full overflow-y-auto rounded-t border border-stone-200 bg-white p-5 shadow-xl sm:mx-auto sm:max-w-2xl sm:rounded">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              {ingrediente ? 'Editar ingrediente' : 'Novo ingrediente'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              O custo por unidade-base sera calculado automaticamente pelo banco.
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

        {categorias.length === 0 && (
          <div className="mb-5 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Nenhuma categoria de ingrediente ativa foi encontrada. Cadastre uma
            categoria antes de vincular ingredientes a ela.
          </div>
        )}

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <label className="block sm:col-span-2">
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

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Categoria</span>
            <select
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
              {...register('categoria_id')}
            >
              <option value="">Sem categoria</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Unidade de compra
            </span>
            <select
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
              {...register('unidade_compra')}
            >
              {unidadesCompra.map((unidade) => (
                <option key={unidade} value={unidade}>
                  {unidade}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Quantidade da embalagem
            </span>
            <input
              type="number"
              min="0"
              step="0.0001"
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
              {...register('quantidade_embalagem', { valueAsNumber: true })}
            />
            {errors.quantidade_embalagem && (
              <span className="mt-1 block text-xs text-red-700">
                {errors.quantidade_embalagem.message}
              </span>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Preco da embalagem
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
              {...register('preco_embalagem', { valueAsNumber: true })}
            />
            {errors.preco_embalagem && (
              <span className="mt-1 block text-xs text-red-700">
                {errors.preco_embalagem.message}
              </span>
            )}
          </label>

          <div className="rounded border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-slate-600">
            Unidade-base automatica:{' '}
            <strong className="text-slate-950">{getUnidadeBase(unidadeCompra)}</strong>
          </div>

          <label className="flex items-center gap-2 rounded border border-stone-200 px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 accent-red-700"
              {...register('ativo')}
            />
            Ingrediente ativo
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
              {isSubmitting ? 'Salvando...' : 'Salvar ingrediente'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
