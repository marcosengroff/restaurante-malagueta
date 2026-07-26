import {
  ArrowLeft,
  CheckCircle2,
  Edit,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FichaTecnicaItemForm } from '../components/FichaTecnicaItemForm'
import {
  deleteItemFichaTecnica,
  getFichaTecnica,
  listIngredientesParaFicha,
  saveItemFichaTecnica,
} from '../services/fichaTecnicaService'
import type {
  FichaTecnicaData,
  FichaTecnicaFormValues,
  IngredienteFicha,
  ItemFichaTecnica,
} from '../types/fichaTecnica'
import { formatCurrency, formatNumber } from '../utils/formatters'

export function FichaTecnicaPratoPage() {
  const { id } = useParams()
  const [data, setData] = useState<FichaTecnicaData | null>(null)
  const [ingredientes, setIngredientes] = useState<IngredienteFicha[]>([])
  const [editingItem, setEditingItem] = useState<ItemFichaTecnica | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const totalReceita = useMemo(
    () => data?.itens.reduce((total, item) => total + item.custo_total, 0) ?? 0,
    [data],
  )
  const itensAPreencher = useMemo(
    () => data?.itens.filter((item) => item.quantidade <= 0).length ?? 0,
    [data],
  )

  const loadFicha = useCallback(async () => {
    if (!id) {
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const [fichaData, ingredientesData] = await Promise.all([
        getFichaTecnica(id),
        listIngredientesParaFicha(),
      ])
      setData(fichaData)
      setIngredientes(ingredientesData)
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Nao foi possivel carregar a ficha tecnica.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadFicha()
  }, [loadFicha])

  async function handleSubmit(values: FichaTecnicaFormValues) {
    if (!id) {
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      await saveItemFichaTecnica(id, values, editingItem?.id)
      setMessage({
        type: 'success',
        text: editingItem
          ? 'Ingrediente atualizado na ficha tecnica.'
          : 'Ingrediente adicionado a ficha tecnica.',
      })
      setIsFormOpen(false)
      setEditingItem(null)
      await loadFicha()
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Nao foi possivel salvar o ingrediente.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(item: ItemFichaTecnica) {
    if (!window.confirm(`Remover "${item.ingrediente.nome}" desta ficha tecnica?`)) {
      return
    }

    setMessage(null)

    try {
      await deleteItemFichaTecnica(item.id)
      setMessage({
        type: 'success',
        text: 'Ingrediente removido da ficha tecnica.',
      })
      await loadFicha()
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Nao foi possivel remover o ingrediente.',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="malaguetta-card rounded border border-stone-200 bg-white p-8 text-center text-sm text-slate-600">
        Carregando ficha tecnica...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-5 text-sm text-red-900">
        Ficha tecnica nao encontrada.
      </div>
    )
  }

  const { prato } = data

  return (
    <section>
      <div className="mb-5">
        <Link
          to="/pratos"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-red-700"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Voltar para pratos
        </Link>
      </div>

      <div className="mb-6 rounded border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="rounded bg-stone-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">
              {prato.codigo}
            </span>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">
              {prato.nome}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {prato.descricao ?? 'Ficha tecnica do prato.'}
            </p>
          </div>
          <span
            className={`w-fit rounded px-2 py-1 text-xs font-semibold ${
              prato.ativo
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-stone-100 text-slate-600'
            }`}
          >
            {prato.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <InfoItem label="Categoria" value={prato.categoria?.nome ?? '-'} />
          <InfoItem label="Rendimento" value={formatNumber(prato.rendimento)} />
          <InfoItem
            label="Peso final"
            value={prato.peso_final ? formatNumber(prato.peso_final) : '-'}
          />
          <InfoItem
            label="Tempo"
            value={prato.tempo_preparo ? `${prato.tempo_preparo} min` : '-'}
          />
          <InfoItem label="Observacoes" value={prato.observacoes ?? '-'} />
        </dl>
      </div>

      {message && (
        <div
          className={`mb-5 flex items-start gap-2 rounded border p-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={18} aria-hidden="true" />
          ) : (
            <XCircle size={18} aria-hidden="true" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">
            Insumos da Receita
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Composicao importada da planilha. Preencha as quantidades para calcular
            o custo do prato.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded bg-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-800"
          onClick={() => {
            setEditingItem(null)
            setIsFormOpen(true)
          }}
        >
          <Plus size={18} aria-hidden="true" />
          Adicionar ingrediente
        </button>
      </div>

      <div className="malaguetta-card rounded border border-stone-200 bg-white shadow-sm">
        {itensAPreencher > 0 && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {itensAPreencher} insumo{itensAPreencher === 1 ? '' : 's'} ainda
            sem quantidade. Edite os itens marcados como A preencher para calcular
            o custo total.
          </div>
        )}

        {data.itens.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-base font-semibold text-slate-950">
              Nenhum ingrediente na ficha
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Adicione o primeiro ingrediente para montar a composicao do prato.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nome</th>
                    <th className="px-4 py-3 font-semibold">Categoria</th>
                    <th className="px-4 py-3 font-semibold">Quantidade</th>
                    <th className="px-4 py-3 font-semibold">Custo unitario</th>
                    <th className="px-4 py-3 font-semibold">Custo total</th>
                    <th className="px-4 py-3 font-semibold">Observacao</th>
                    <th className="px-4 py-3 text-right font-semibold">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {data.itens.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-slate-950">
                        {item.ingrediente.nome}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.ingrediente.categoria?.nome ?? 'Sem categoria'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.quantidade > 0
                          ? `${formatNumber(item.quantidade)} ${item.unidade_base}`
                          : `A preencher (${item.unidade_base})`}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatCurrency(item.custo_unitario, 4)} por{' '}
                        {item.unidade_base}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-950">
                        {formatCurrency(item.custo_total)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.observacao ?? '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="rounded border border-stone-300 p-2 text-slate-700 hover:bg-stone-50"
                            aria-label={`Editar ${item.ingrediente.nome}`}
                            title="Editar"
                            onClick={() => {
                              setEditingItem(item)
                              setIsFormOpen(true)
                            }}
                          >
                            <Edit size={17} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="rounded border border-stone-300 p-2 text-slate-700 hover:bg-stone-50"
                            aria-label={`Remover ${item.ingrediente.nome}`}
                            title="Remover"
                            onClick={() => handleDelete(item)}
                          >
                            <Trash2 size={17} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-3 lg:hidden">
              {data.itens.map((item) => (
                <article key={item.id} className="malaguetta-card rounded border border-stone-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-950">
                        {item.ingrediente.nome}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {item.ingrediente.categoria?.nome ?? 'Sem categoria'}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-950">
                      {formatCurrency(item.custo_total)}
                    </p>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <InfoItem
                      label="Quantidade"
                      value={
                        item.quantidade > 0
                          ? `${formatNumber(item.quantidade)} ${item.unidade_base}`
                          : `A preencher (${item.unidade_base})`
                      }
                    />
                    <InfoItem
                      label="Custo unitario"
                      value={`${formatCurrency(item.custo_unitario, 4)} por ${
                        item.unidade_base
                      }`}
                    />
                    <InfoItem label="Observacao" value={item.observacao ?? '-'} />
                  </dl>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded border border-stone-300 px-3 py-2 text-sm font-semibold text-slate-700"
                      onClick={() => {
                        setEditingItem(item)
                        setIsFormOpen(true)
                      }}
                    >
                      <Edit size={16} aria-hidden="true" />
                      Editar
                    </button>
                    <button
                      type="button"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded border border-stone-300 px-3 py-2 text-sm font-semibold text-slate-700"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      Remover
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <div className="border-t border-stone-200 bg-stone-50 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem
              label="Quantidade de ingredientes"
              value={`${data.itens.length}`}
            />
            <div className="malaguetta-card rounded border border-stone-200 bg-white p-4 text-right">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Total da receita
              </p>
              <p className="mt-1 text-3xl font-semibold text-red-800">
                {formatCurrency(totalReceita)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <FichaTecnicaItemForm
          ingredientes={ingredientes}
          item={editingItem}
          isSubmitting={isSubmitting}
          onCancel={() => {
            setIsFormOpen(false)
            setEditingItem(null)
          }}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="malaguetta-card rounded border border-stone-200 bg-white p-4">
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-950">{value}</dd>
    </div>
  )
}
