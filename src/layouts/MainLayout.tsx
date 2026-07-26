import { FileSpreadsheet, Gauge, LogOut, Menu, Soup, UploadCloud, Utensils, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from '../services/authService'
import { listCategoriasPratosMenu } from '../services/categoriasPratosService'

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [abasPlanilha, setAbasPlanilha] = useState<
    Array<{ id: string; nome: string }>
  >([])
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    listCategoriasPratosMenu()
      .then((categorias) => {
        setAbasPlanilha(
          categorias.map((categoria) => ({
            id: categoria.id,
            nome: categoria.nome,
          })),
        )
      })
      .catch(() => {
        setAbasPlanilha([])
      })
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-stone-200 bg-white px-4 py-5 shadow-sm transition-transform duration-200 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded bg-red-700 text-white">
              <Utensils size={22} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-red-800">
                Malaguetta
              </p>
              <p className="text-xs text-slate-500">Fichas e custos</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded p-2 text-slate-500 hover:bg-stone-100 lg:hidden"
            aria-label="Fechar menu"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="mt-8 flex h-[calc(100vh-170px)] flex-col">
          <div className="min-h-0 flex-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Planilha Malaguetta
            </p>
            <div className="mt-2 max-h-full space-y-1 overflow-y-auto pr-1">
              <NavLink
                to="/ingredientes"
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-red-700 text-white'
                      : 'text-slate-600 hover:bg-stone-100 hover:text-slate-950'
                  }`
                }
              >
                <Soup size={17} aria-hidden="true" />
                INGREDIENTES
              </NavLink>

              {abasPlanilha.map((aba) => (
                <NavLink
                  key={aba.id}
                  to={`/pratos?categoria=${aba.id}`}
                  onClick={() => setIsSidebarOpen(false)}
                  className={() =>
                    `flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition ${
                      location.pathname === '/pratos' &&
                      new URLSearchParams(location.search).get('categoria') === aba.id
                        ? 'bg-red-700 text-white'
                        : 'text-slate-600 hover:bg-stone-100 hover:text-slate-950'
                    }`
                  }
                >
                  <FileSpreadsheet size={17} aria-hidden="true" />
                  <span className="truncate">{aba.nome}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-stone-200 pt-4">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Sistema
            </p>
            <div className="mt-2 space-y-1">
              <SidebarLink to="/painel" icon={Gauge} label="Painel" onClick={() => setIsSidebarOpen(false)} />
              <SidebarLink to="/importacao" icon={UploadCloud} label="Importacao" onClick={() => setIsSidebarOpen(false)} />
            </div>
          </div>

          <button
            type="button"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-stone-100"
            onClick={handleSignOut}
          >
            <LogOut size={16} aria-hidden="true" />
            Sair
          </button>
        </nav>
      </aside>

      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          aria-label="Fechar menu"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="min-h-screen lg:pl-72">
        <button
          type="button"
          className="fixed left-4 top-4 z-20 rounded border border-stone-200 bg-white p-2 text-slate-700 shadow-sm lg:hidden"
          aria-label="Abrir menu"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={22} aria-hidden="true" />
        </button>

        <main className="px-4 py-6 pt-16 lg:px-8 lg:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarLink({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to: string
  icon: typeof Gauge
  label: string
  onClick: () => void
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition ${
          isActive
            ? 'bg-stone-100 text-slate-950'
            : 'text-slate-500 hover:bg-stone-100 hover:text-slate-950'
        }`
      }
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </NavLink>
  )
}
