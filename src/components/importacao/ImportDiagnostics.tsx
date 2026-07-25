import type { ImportacaoDiagnostico } from '../../types/importacao'

type ImportDiagnosticsProps = {
  diagnostico: ImportacaoDiagnostico
}

export function ImportDiagnostics({ diagnostico }: ImportDiagnosticsProps) {
  return (
    <details className="rounded border border-amber-200 bg-amber-50 p-4">
      <summary className="cursor-pointer">
        <h2 className="text-lg font-semibold text-amber-950">
          Diagnostico tecnico
        </h2>
        <p className="mt-1 text-sm text-amber-900">
          Modo temporario de inspecao ativo para ajustar o parser da planilha real.
        </p>
      </summary>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <DiagnosticCard label="Abas" value={diagnostico.abas.length} />
        <DiagnosticCard label="Linhas" value={diagnostico.totais.linhas} />
        <DiagnosticCard
          label="Celulas preenchidas"
          value={diagnostico.totais.celulasPreenchidas}
        />
        <DiagnosticCard label="Formulas" value={diagnostico.totais.formulas} />
        <DiagnosticCard label="Mesclagens" value={diagnostico.totais.mesclagens} />
      </div>

      <div className="mt-4 space-y-4">
        {diagnostico.abas.map((aba) => (
          <details
            key={aba.nome}
            className="rounded border border-amber-200 bg-white p-4"
            open
          >
            <summary className="cursor-pointer font-semibold text-slate-950">
              {aba.nome} · {aba.tipoDetectado}
            </summary>
            <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
              <p>Normalizada: {aba.nomeNormalizado}</p>
              <p>Range: {aba.range}</p>
              <p>Linhas: {aba.linhas}</p>
              <p>Colunas: {aba.colunas}</p>
              <p>Preenchidas: {aba.celulasPreenchidas}</p>
              <p>Formulas: {aba.formulas}</p>
              <p>Mesclagens: {aba.mesclagens}</p>
              <p>Descartes: {aba.linhasDescartadasTotal}</p>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-950">
                  Blocos detectados
                </h3>
                <pre className="mt-2 max-h-56 overflow-auto rounded bg-stone-950 p-3 text-xs text-stone-50">
                  {JSON.stringify(aba.blocosDetectados, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-950">
                  Grade A1:U40
                </h3>
                <pre className="mt-2 max-h-56 overflow-auto rounded bg-stone-950 p-3 text-xs text-stone-50">
                  {JSON.stringify(aba.grade.slice(0, 840), null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-950">
                Cabecalhos candidatos
              </h3>
              <pre className="mt-2 max-h-40 overflow-auto rounded bg-stone-950 p-3 text-xs text-stone-50">
                {JSON.stringify(aba.cabecalhosCandidatos, null, 2)}
              </pre>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-950">
                Primeiras 20 linhas
              </h3>
              <pre className="mt-2 max-h-64 overflow-auto rounded bg-stone-950 p-3 text-xs text-stone-50">
                {JSON.stringify(aba.primeirasLinhasMatriz, null, 2)}
              </pre>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-950">
                Linhas descartadas
              </h3>
              <pre className="mt-2 max-h-64 overflow-auto rounded bg-stone-950 p-3 text-xs text-stone-50">
                {JSON.stringify(aba.linhasDescartadas, null, 2)}
              </pre>
            </div>
          </details>
        ))}
      </div>
    </details>
  )
}

function DiagnosticCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-amber-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  )
}
