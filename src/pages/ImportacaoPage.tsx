import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Play,
  UploadCloud,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileDropzone } from '../components/importacao/FileDropzone'
import { ImportDiagnostics } from '../components/importacao/ImportDiagnostics'
import { ImportSummary } from '../components/importacao/ImportSummary'
import { PreviewTable } from '../components/importacao/PreviewTable'
import { ProblemsList } from '../components/importacao/ProblemsList'
import { PageHeader } from '../components/PageHeader'
import { MalaguettaExcelParser } from '../lib/importacao/MalaguettaExcelParser'
import {
  confirmarImportacao,
  enrichImportacaoPlano,
  hasBlockingErrors,
} from '../services/importacaoService'
import type { ImportacaoPlano, ImportacaoResultado } from '../types/importacao'

const maxFileSize = 15 * 1024 * 1024
const DEBUG_IMPORTACAO = true

export function ImportacaoPage() {
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [plan, setPlan] = useState<ImportacaoPlano | null>(null)
  const [resultado, setResultado] = useState<ImportacaoResultado | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [progress, setProgress] = useState({
    message: '',
    current: 0,
    total: 0,
  })
  const blockingErrors = plan ? hasBlockingErrors(plan) : true
  const pendingReviews = plan
    ? plan.problemas.filter((problem) =>
        ['referencia', 'incompleto', 'duplicidade'].includes(problem.tipo),
      ).length
    : 0

  const finalCounts = useMemo(() => {
    if (!plan) {
      return null
    }

    const allRows = [
      ...plan.categoriasIngredientes,
      ...plan.ingredientes,
      ...plan.categoriasPratos,
      ...plan.pratos,
      ...plan.fichasTecnicas,
    ]

    return {
      criar: allRows.filter((row) => row.acao === 'criar').length,
      reutilizar: allRows.filter((row) => row.acao === 'reutilizar').length,
      atualizar: allRows.filter((row) => row.acao === 'atualizar').length,
      ignorar: allRows.filter((row) => row.acao === 'ignorar').length,
    }
  }, [plan])

  function handleFileSelect(selectedFile: File) {
    const extension = selectedFile.name.split('.').pop()?.toLocaleLowerCase()
    setFileError('')
    setPlan(null)
    setResultado(null)
    setConfirmed(false)

    if (!extension || !['xlsx', 'xls'].includes(extension)) {
      setFile(null)
      setFileError('Selecione um arquivo Excel nos formatos .xlsx ou .xls.')
      return
    }

    if (selectedFile.size === 0) {
      setFile(null)
      setFileError('O arquivo selecionado esta vazio.')
      return
    }

    if (selectedFile.size > maxFileSize) {
      setFile(null)
      setFileError('O arquivo excede o tamanho maximo de 15 MB.')
      return
    }

    setFile(selectedFile)
  }

  async function handleAnalyze() {
    if (!file) {
      return
    }

    setIsAnalyzing(true)
    setFileError('')
    setResultado(null)
    setConfirmed(false)
    setProgress({
      message: 'Lendo arquivo Excel',
      current: 1,
      total: 3,
    })

    try {
      const parser = new MalaguettaExcelParser()
      const parsedPlan = await parser.parse(file)
      setProgress({
        message: 'Comparando com Supabase',
        current: 2,
        total: 3,
      })
      const enrichedPlan = await enrichImportacaoPlano(parsedPlan)
      setPlan(enrichedPlan)
      setProgress({
        message: 'Analise concluida',
        current: 3,
        total: 3,
      })
    } catch (error) {
      setFileError(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel analisar a planilha.',
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function handleImport() {
    if (!plan) {
      return
    }

    setIsImporting(true)
    setResultado(null)

    try {
      const result = await confirmarImportacao(plan, (message, current, total) => {
        setProgress({ message, current, total })
      })
      setResultado(result)
    } catch (error) {
      setFileError(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel confirmar a importacao.',
      )
    } finally {
      setIsImporting(false)
    }
  }

  function downloadJsonReport() {
    if (!plan) {
      return
    }

    const blob = new Blob([JSON.stringify({ plan, resultado }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-importacao-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section>
      <PageHeader
        title="Importacao"
        description="Analise e valide a planilha original antes de gravar qualquer dado no Supabase."
      />

      <div className="mb-6 grid gap-2 sm:grid-cols-6">
        {['Arquivo', 'Analise', 'Validacao', 'Previa', 'Importacao', 'Resultado'].map(
          (step, index) => (
            <div
              key={step}
              className={`rounded border px-3 py-2 text-sm font-semibold ${
                progress.current > index || (index === 0 && file)
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-stone-200 bg-white text-slate-500'
              }`}
            >
              {index + 1}. {step}
            </div>
          ),
        )}
      </div>

      <div className="space-y-6">
        <FileDropzone
          file={file}
          error={fileError}
          onFileSelect={handleFileSelect}
          onClear={() => {
            setFile(null)
            setPlan(null)
            setResultado(null)
            setConfirmed(false)
            setFileError('')
          }}
        />

        <div className="flex flex-col gap-3 rounded border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">Simular importacao</h2>
            <p className="mt-1 text-sm text-slate-600">
              A analise e a previa nao gravam dados. A gravacao exige confirmacao
              explicita.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-300"
            disabled={!file || isAnalyzing || isImporting}
            onClick={handleAnalyze}
          >
            {isAnalyzing ? (
              <Loader2 className="animate-spin" size={18} aria-hidden="true" />
            ) : (
              <Play size={18} aria-hidden="true" />
            )}
            Analisar planilha
          </button>
        </div>

        {(isAnalyzing || isImporting || progress.message) && (
          <div className="rounded border border-stone-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <UploadCloud size={18} aria-hidden="true" />
              {progress.message || 'Aguardando processamento'}
            </div>
            {progress.total > 0 && (
              <div className="mt-3 h-2 rounded bg-stone-100">
                <div
                  className="h-2 rounded bg-red-700"
                  style={{
                    width: `${Math.min(100, (progress.current / progress.total) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {plan && (
          <>
            {plan.arquivoJaImportado && (
              <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Este arquivo parece ja ter sido importado anteriormente. Revise a
                previa com cuidado antes de confirmar uma nova versao.
              </div>
            )}

            <ImportSummary resumo={plan.resumo} />
            {DEBUG_IMPORTACAO && plan.diagnostico && (
              <ImportDiagnostics diagnostico={plan.diagnostico} />
            )}
            <ProblemsList problemas={plan.problemas} />

            <div className="space-y-4">
              <PreviewTable
                title="Categorias de Ingredientes"
                rows={plan.categoriasIngredientes}
              />
              <PreviewTable title="Ingredientes" rows={plan.ingredientes} />
              <PreviewTable title="Categorias de Pratos" rows={plan.categoriasPratos} />
              <PreviewTable title="Pratos" rows={plan.pratos} />
              <PreviewTable title="Fichas Tecnicas" rows={plan.fichasTecnicas} />
            </div>

            {finalCounts && (
              <div className="rounded border border-stone-200 bg-white p-5">
                <h2 className="text-lg font-semibold text-slate-950">
                  Confirmacao final
                </h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-4">
                  <ConfirmCard label="Serao criados" value={finalCounts.criar} />
                  <ConfirmCard
                    label="Serao reutilizados"
                    value={finalCounts.reutilizar}
                  />
                  <ConfirmCard
                    label="Serao atualizados"
                    value={finalCounts.atualizar}
                  />
                  <ConfirmCard label="Serao ignorados" value={finalCounts.ignorar} />
                </div>

                <label className="mt-4 flex items-start gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-red-700"
                    checked={confirmed}
                    onChange={(event) => setConfirmed(event.target.checked)}
                  />
                  Revisei a previa e confirmo a importacao dos dados.
                </label>

                <button
                  type="button"
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-300"
                  disabled={blockingErrors || !confirmed || isImporting}
                  onClick={handleImport}
                >
                  {isImporting ? (
                    <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                  ) : (
                    <UploadCloud size={18} aria-hidden="true" />
                  )}
                  Confirmar importacao
                </button>
                {blockingErrors && (
                  <p className="mt-2 text-xs text-red-700">
                    Existem erros impeditivos na previa. Corrija ou revise a lista
                    de problemas antes de confirmar.
                  </p>
                )}
                {!blockingErrors && pendingReviews > 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    Existem {pendingReviews} pendencias de revisao na previa, mas
                    elas nao bloqueiam a confirmacao.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {resultado && (
          <div className="rounded border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-2 text-emerald-900">
              <CheckCircle2 size={20} aria-hidden="true" />
              <h2 className="text-lg font-semibold">Relatorio final</h2>
            </div>
            <p className="mt-2 text-sm text-emerald-900">
              Finalizado em {new Date(resultado.finalizadaEm).toLocaleString('pt-BR')} ·{' '}
              duracao {resultado.duracaoMs} ms.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/ingredientes"
                className="rounded border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-900"
              >
                Ver ingredientes
              </Link>
              <Link
                to="/pratos"
                className="rounded border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-900"
              >
                Ver pratos
              </Link>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-900"
                onClick={downloadJsonReport}
              >
                <Download size={16} aria-hidden="true" />
                Baixar JSON
              </button>
              <button
                type="button"
                className="rounded border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-900"
                onClick={() => {
                  setFile(null)
                  setPlan(null)
                  setResultado(null)
                  setConfirmed(false)
                  setProgress({ message: '', current: 0, total: 0 })
                }}
              >
                Nova importacao
              </button>
            </div>
          </div>
        )}

        {!plan && (
          <div className="rounded border border-stone-200 bg-white p-5 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-950">
              <FileSpreadsheet size={18} aria-hidden="true" />
              Mapeamento inicial
            </div>
            <p className="mt-2">
              O adaptador MalaguettaExcelParser identifica abas por cabecalhos e
              contexto. Quando a planilha real estiver no projeto, os nomes exatos
              de colunas podem ser refinados sem alterar a interface.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function ConfirmCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-stone-200 bg-stone-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}
