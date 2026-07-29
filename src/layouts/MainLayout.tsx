import {
  Beef,
  CakeSlice,
  ChefHat,
  CookingPot,
  Drumstick,
  Fish,
  Gauge,
  IceCreamBowl,
  LogOut,
  Menu,
  Pizza,
  Plus,
  Salad,
  Settings,
  Soup,
  Utensils,
  Wheat,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAdminStatus } from '../hooks/useAdminStatus'
import { signOut } from '../services/authService'
import { listCategoriasPratosMenu } from '../services/categoriasPratosService'

function formatMenuLabel(value: string) {
  return value
    .toLocaleLowerCase('pt-BR')
    .replace(/(^|\s|\.|-)(\p{L})/gu, (match) => match.toLocaleUpperCase('pt-BR'))
}

function normalizeMenuName(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR')
}

function getMenuIcon(value: string): LucideIcon {
  const name = normalizeMenuName(value)

  if (name.includes('pizza')) {
    return Pizza
  }

  if (name.includes('frango') || name.includes('aves')) {
    return Drumstick
  }

  if (name.includes('peixe')) {
    return Fish
  }

  if (name.includes('bovino') || name.includes('file')) {
    return Beef
  }

  if (name.includes('molho') || name.includes('acomp')) {
    return CookingPot
  }

  if (name.includes('petisco')) {
    return Utensils
  }

  if (name.includes('massa')) {
    return Wheat
  }

  if (name.includes('sobremesa') || name.includes('doce')) {
    return CakeSlice
  }

  if (name.includes('salada')) {
    return Salad
  }

  if (name.includes('especial')) {
    return ChefHat
  }

  return IceCreamBowl
}

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [abasPlanilha, setAbasPlanilha] = useState<
    Array<{ id: string; nome: string }>
  >([])
  const navigate = useNavigate()
  const location = useLocation()
  const { isAdmin } = useAdminStatus()
  const mobileTitle = getMobileTitle(location.pathname)

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
    <div className="min-h-screen bg-[#f4eee7] text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 overflow-hidden border-r border-red-900/35 bg-[#0f100f] px-5 py-7 text-white shadow-2xl transition-transform duration-200 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-[radial-gradient(circle_at_bottom_left,rgba(198,40,40,0.24),transparent_46%),linear-gradient(180deg,transparent,rgba(93,18,13,0.26))]" />
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/logo-pimenta.png"
              alt="Restaurante Malaguetta"
              className="h-10 w-auto max-w-20 object-contain drop-shadow"
            />
            <div>
              <p className="text-2xl font-bold leading-none tracking-tight text-white">
                Malaguetta
              </p>
              <p className="mt-1 text-sm font-medium text-white/65">
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

        <nav className="relative z-10 mt-10 flex h-[calc(100vh-164px)] flex-col">
          <div className="min-h-0 flex-1">
            <div className="sidebar-scroll max-h-full space-y-1.5 overflow-y-auto pr-1">
              <SidebarLink
                to="/painel"
                icon={Gauge}
                label="Painel"
                onClick={() => setIsSidebarOpen(false)}
              />
              <NavLink
                to="/ingredientes"
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-[#E02D2D] to-[#B9151A] text-white shadow-[0_12px_28px_rgba(198,40,40,0.34)]'
                      : 'text-white/76 hover:bg-white/8 hover:text-white'
                  }`
                }
              >
                <Soup size={19} aria-hidden="true" />
                Ingredientes
              </NavLink>

              {abasPlanilha.map((aba) => {
                const MenuIcon = getMenuIcon(aba.nome)

                return (
                  <NavLink
                    key={aba.id}
                    to={`/pratos?categoria=${aba.id}`}
                    onClick={() => setIsSidebarOpen(false)}
                    className={() =>
                      `flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold transition ${
                        location.pathname === '/pratos' &&
                        new URLSearchParams(location.search).get('categoria') ===
                          aba.id
                          ? 'bg-gradient-to-r from-[#E02D2D] to-[#B9151A] text-white shadow-[0_12px_28px_rgba(198,40,40,0.34)]'
                          : 'text-white/76 hover:bg-white/8 hover:text-white'
                      }`
                    }
                  >
                    <MenuIcon size={19} aria-hidden="true" />
                    <span className="truncate">{formatMenuLabel(aba.nome)}</span>
                  </NavLink>
                )
              })}
              {isAdmin && (
                <SidebarLink
                  to="/configuracoes"
                  icon={Settings}
                  label="Configurações"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}
            </div>
          </div>

          <button
            type="button"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/14 bg-white/7 px-3 py-3 text-base font-semibold text-white/82 shadow-inner hover:bg-white/12 hover:text-white"
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
        <header className="fixed inset-x-0 top-0 z-20 border-b border-stone-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded border border-stone-200 text-slate-700"
              aria-label="Abrir menu completo"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={22} aria-hidden="true" />
            </button>
            <div className="min-w-0 text-center">
              <p className="truncate text-sm font-semibold text-slate-950">
                {mobileTitle}
              </p>
              <p className="truncate text-xs font-medium text-slate-500">
                Malaguetta
              </p>
            </div>
            <button
              type="button"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded bg-red-700 text-white shadow-sm"
              aria-label="Novo prato"
              onClick={() => navigate('/pratos')}
            >
              <Plus size={21} aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="px-3 py-5 pt-20 pb-24 sm:px-4 lg:px-8 lg:pt-6 lg:pb-6">
          <Outlet />
        </main>
        <MobileBottomNav />
        <footer className="px-4 pb-24 lg:px-8 lg:pb-5">
          <div className="flex items-center justify-end gap-7 text-sm font-medium text-slate-500">
            <span>Versão 1.0.0</span>
            <span className="h-7 w-px bg-stone-300" />
            <div className="flex items-center gap-4">
              <p>Desenvolvido por Marcos Engroff</p>
              <a
                href="https://wa.me/55999634642?text=Olá,%20Marcos!%20Estou%20utilizando%20o%20Restaurante%20Malaguetta%20e%20gostaria%20de%20falar%20com%20você."
                target="_blank"
                rel="noopener noreferrer"
                title="Fale comigo no WhatsApp"
                aria-label="Fale comigo no WhatsApp"
                className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_24px_rgba(37,211,102,0.30)] ring-4 ring-white transition-transform duration-200 hover:scale-110"
              >
                <WhatsAppIcon />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

function getMobileTitle(pathname: string) {
  if (pathname === '/painel') return 'Painel'
  if (pathname === '/ingredientes') return 'Ingredientes'
  if (pathname === '/categorias') return 'Categorias'
  if (pathname === '/fichas-tecnicas') return 'Fichas tecnicas'
  if (pathname === '/importacao') return 'Importacao'
  if (pathname === '/configuracoes') return 'Configuracoes'
  if (pathname === '/pratos') return 'Pratos'

  return 'Restaurante Malaguetta'
}

function MobileBottomNav() {
  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded px-2 py-2 text-xs font-semibold transition ${
      isActive ? 'text-red-700' : 'text-slate-500'
    }`

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around gap-1">
        <NavLink to="/painel" className={itemClass}>
          <Gauge size={20} aria-hidden="true" />
          <span>Painel</span>
        </NavLink>
        <NavLink to="/ingredientes" className={itemClass}>
          <Soup size={20} aria-hidden="true" />
          <span>Insumos</span>
        </NavLink>
        <NavLink to="/pratos" className={itemClass}>
          <Utensils size={20} aria-hidden="true" />
          <span>Pratos</span>
        </NavLink>
        <NavLink to="/fichas-tecnicas" className={itemClass}>
          <ChefHat size={20} aria-hidden="true" />
          <span>Fichas</span>
        </NavLink>
      </div>
    </nav>
  )
}

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M16.001 3.2c-7.058 0-12.8 5.74-12.8 12.797 0 2.257.59 4.458 1.71 6.397L3.2 28.8l6.557-1.672a12.77 12.77 0 0 0 6.24 1.589h.004c7.057 0 12.798-5.74 12.8-12.797C28.8 8.94 23.06 3.2 16.001 3.2Zm0 23.36h-.004a10.62 10.62 0 0 1-5.415-1.483l-.389-.23-3.89.992 1.039-3.793-.254-.389a10.6 10.6 0 0 1-1.728-5.66c0-5.866 4.774-10.64 10.644-10.64 2.842 0 5.514 1.107 7.523 3.117a10.57 10.57 0 0 1 3.115 7.445c-.002 5.868-4.776 10.641-10.641 10.641Zm5.833-7.967c-.32-.16-1.894-.934-2.187-1.04-.293-.107-.506-.16-.72.16-.213.32-.826 1.04-1.013 1.253-.187.214-.373.24-.693.08-.32-.16-1.351-.498-2.574-1.586-.951-.848-1.594-1.895-1.781-2.215-.187-.32-.02-.493.14-.652.144-.143.32-.374.48-.56.16-.187.213-.32.32-.534.107-.213.053-.4-.027-.56-.08-.16-.72-1.735-.986-2.375-.26-.624-.523-.54-.72-.55l-.614-.01c-.213 0-.56.08-.853.4-.293.32-1.12 1.094-1.12 2.667s1.146 3.094 1.306 3.307c.16.213 2.255 3.443 5.461 4.828.763.329 1.359.525 1.823.672.766.244 1.464.209 2.015.127.615-.092 1.894-.774 2.16-1.52.267-.747.267-1.387.187-1.52-.08-.134-.293-.214-.613-.374Z" />
    </svg>
  )
}

function SidebarLink({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to: string
  icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold transition ${
          isActive
            ? 'bg-gradient-to-r from-[#E02D2D] to-[#B9151A] text-white shadow-[0_12px_28px_rgba(198,40,40,0.34)]'
            : 'text-white/76 hover:bg-white/8 hover:text-white'
        }`
      }
    >
      <Icon size={19} aria-hidden="true" />
      {label}
    </NavLink>
  )
}
