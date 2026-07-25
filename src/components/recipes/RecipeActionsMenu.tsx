import { Edit, FileText, MoreVertical, RotateCcw, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type RecipeActionsMenuProps = {
  ativo: boolean
  onOpen: () => void
  onEdit: () => void
  onToggleActive: () => void
}

export function RecipeActionsMenu({
  ativo,
  onOpen,
  onEdit,
  onToggleActive,
}: RecipeActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function runAction(action: () => void) {
    setIsOpen(false)
    action()
  }

  return (
    <div ref={containerRef} className="relative" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        className="rounded p-2 text-slate-500 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-red-700/25"
        aria-label="Abrir menu de acoes"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <MoreVertical size={18} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-20 mt-1 w-48 rounded border border-stone-200 bg-white py-1 text-sm shadow-lg"
          role="menu"
        >
          <MenuItem icon={FileText} label="Abrir ficha tecnica" onClick={() => runAction(onOpen)} />
          <MenuItem icon={Edit} label="Editar prato" onClick={() => runAction(onEdit)} />
          <MenuItem
            icon={ativo ? XCircle : RotateCcw}
            label={ativo ? 'Desativar' : 'Reativar'}
            onClick={() => runAction(onToggleActive)}
          />
        </div>
      )}
    </div>
  )
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof FileText
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-stone-50"
      role="menuitem"
      onClick={onClick}
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </button>
  )
}
