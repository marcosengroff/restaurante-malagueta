import { FileSpreadsheet, X } from 'lucide-react'

type FileDropzoneProps = {
  file: File | null
  error: string
  onFileSelect: (file: File) => void
  onClear: () => void
}

export function FileDropzone({
  file,
  error,
  onFileSelect,
  onClear,
}: FileDropzoneProps) {
  function handleFile(fileList: FileList | null) {
    const selected = fileList?.[0]
    if (selected) {
      onFileSelect(selected)
    }
  }

  return (
    <div
      className="rounded border border-dashed border-stone-300 bg-white p-6"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        handleFile(event.dataTransfer.files)
      }}
    >
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded bg-red-50 text-red-700">
          <FileSpreadsheet size={26} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Selecionar planilha
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Arraste o arquivo Excel aqui ou selecione no computador.
          </p>
        </div>
        <label className="cursor-pointer rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">
          Selecionar planilha
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(event) => handleFile(event.target.files)}
          />
        </label>
      </div>

      {file && (
        <div className="mt-5 flex flex-col gap-3 rounded border border-stone-200 bg-stone-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <p className="font-semibold text-slate-950">{file.name}</p>
            <p className="text-slate-600">
              {(file.size / 1024).toLocaleString('pt-BR', {
                maximumFractionDigits: 1,
              })}{' '}
              KB · selecionado em {new Date().toLocaleString('pt-BR')}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded border border-stone-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
            onClick={onClear}
          >
            <X size={16} aria-hidden="true" />
            Remover
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      )}
    </div>
  )
}
