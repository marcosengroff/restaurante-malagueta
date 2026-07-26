import { FileSpreadsheet, Gauge, LogOut, Menu, Soup, X } from 'lucide-react'
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
    <div className="min-h-screen bg-[#eef0f3] text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 overflow-hidden bg-[#111413] px-4 py-6 text-white shadow-2xl transition-transform duration-200 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-[radial-gradient(circle_at_bottom_left,rgba(198,40,40,0.22),transparent_48%)]" />
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/logo-pimenta.png"
              alt="Restaurante Malaguetta"
              className="h-9 w-auto max-w-20 object-contain"
            />
            <div>
              <p className="text-lg font-bold leading-none tracking-tight text-white">
                Malaguetta
              </p>
              <p className="mt-1 text-[11px] font-medium text-white/65">
                Restaurante & Pizzaria
              </p>
            </div>
          </div>
          <button
            type="button"
            className="rounded p-2 text-white/65 hover:bg-white/10 lg:hidden"
            aria-label="Fechar menu"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="relative z-10 mt-9 flex h-[calc(100vh-155px)] flex-col">
          <div className="min-h-0 flex-1">
            <div className="max-h-full space-y-1 overflow-y-auto pr-1">
              <SidebarLink to="/painel" icon={Gauge} label="Painel" onClick={() => setIsSidebarOpen(false)} />
              <NavLink
                to="/ingredientes"
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#C62828] text-white shadow-lg shadow-red-950/25'
                      : 'text-white/72 hover:bg-[#C62828]/18 hover:text-white'
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
                        ? 'bg-[#C62828] text-white shadow-lg shadow-red-950/25'
                        : 'text-white/72 hover:bg-[#C62828]/18 hover:text-white'
                    }`
                  }
                >
                  <FileSpreadsheet size={17} aria-hidden="true" />
                  <span className="truncate">{aba.nome}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded border border-white/12 bg-white/5 px-3 py-2 text-sm font-semibold text-white/78 hover:bg-white/10 hover:text-white"
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
            ? 'bg-[#C62828] text-white shadow-lg shadow-red-950/25'
            : 'text-white/70 hover:bg-[#C62828]/18 hover:text-white'
        }`
      }
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </NavLink>
  )
}
