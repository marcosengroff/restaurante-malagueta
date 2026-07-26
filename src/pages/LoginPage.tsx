import { AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getCurrentSession, signInWithPassword } from '../services/authService'

const logoSrc = '/logo-malaguetta.jpeg'
const pizzaImageUrl =
  'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=1600&q=90'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname?: string } } | null)?.from
    ?.pathname
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getCurrentSession()
      .then((session) => {
        setIsAuthenticated(Boolean(session))
      })
      .catch(() => {
        setIsAuthenticated(false)
      })
      .finally(() => {
        setIsCheckingSession(false)
      })
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await signInWithPassword(email.trim(), password)
      navigate(from ?? '/painel', { replace: true })
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Nao foi possivel entrar no sistema.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#151515] px-4 text-sm text-white/75">
        Verificando acesso...
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={from ?? '/painel'} replace />
  }

  return (
    <main className="min-h-screen bg-[#F6F7F8] text-[#151515]">
      <section className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <LoginBrandPanel />

        <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <LoginCard
            email={email}
            password={password}
            rememberMe={rememberMe}
            showPassword={showPassword}
            error={error}
            isSubmitting={isSubmitting}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onRememberMeChange={setRememberMe}
            onTogglePassword={() => setShowPassword((current) => !current)}
            onSubmit={handleSubmit}
          />
        </div>
      </section>
    </main>
  )
}

function LoginBrandPanel() {
  return (
    <aside
      className="relative hidden min-h-screen overflow-hidden bg-[#151515] lg:block"
      aria-label="Restaurante Malaguetta"
    >
      <img
        src={pizzaImageUrl}
        alt="Pizza artesanal recem-saida do forno"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[#151515]/70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_25%,rgba(198,40,40,0.42),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(46,125,50,0.34),transparent_30%)]" />

      <div className="relative z-10 flex min-h-screen flex-col justify-between p-10 xl:p-14">
        <MalaguettaLogo className="h-16 w-auto object-contain" />

        <div className="max-w-xl animate-[fadeIn_0.7s_ease-out]">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-1.5 w-12 rounded-full bg-[#C62828]" />
            <span className="h-1.5 w-8 rounded-full bg-[#2E7D32]" />
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-white xl:text-6xl">
            Bem-vindo!
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-white/78">
            Acesse o sistema administrativo e gerencie seu restaurante de forma
            simples, rapida e eficiente.
          </p>
        </div>

        <p className="text-sm font-medium text-white/68">
          🌶️ Sabor que marca. Qualidade que permanece.
        </p>
      </div>
    </aside>
  )
}

function LoginCard({
  email,
  password,
  rememberMe,
  showPassword,
  error,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onTogglePassword,
  onSubmit,
}: {
  email: string
  password: string
  rememberMe: boolean
  showPassword: boolean
  error: string
  isSubmitting: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onRememberMeChange: (value: boolean) => void
  onTogglePassword: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section className="w-full max-w-md animate-[fadeIn_0.45s_ease-out] rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_24px_70px_rgba(21,21,21,0.12)] sm:p-8">
      <div className="mb-8 text-center">
        <MalaguettaLogo className="mx-auto h-20 w-auto object-contain" />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[#151515]">
          Restaurante Malaguetta
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Acesso ao sistema
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-5" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-stone-300 bg-[#F6F7F8] px-4 py-3 text-[#151515] outline-none transition placeholder:text-slate-400 focus:border-[#C62828] focus:bg-white focus:ring-4 focus:ring-[#C62828]/10"
            placeholder="usuario@malaguetta.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Senha</span>
          <div className="relative mt-2">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-[#F6F7F8] px-4 py-3 pr-12 text-[#151515] outline-none transition placeholder:text-slate-400 focus:border-[#C62828] focus:bg-white focus:ring-4 focus:ring-[#C62828]/10"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-stone-200 hover:text-[#151515] focus:outline-none focus:ring-2 focus:ring-[#C62828]/25"
              aria-label={showPassword ? 'Ocultar senha' : 'Visualizar senha'}
              onClick={onTogglePassword}
            >
              {showPassword ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </button>
          </div>
        </label>

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2 font-medium text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => onRememberMeChange(event.target.checked)}
              className="h-4 w-4 rounded border-stone-300 accent-[#C62828]"
            />
            Lembrar de mim
          </label>
          <button
            type="button"
            className="font-semibold text-[#C62828] transition hover:text-[#9f1f1f]"
          >
            Esqueci minha senha
          </button>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-[#C62828] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#C62828]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#b71f1f] hover:shadow-xl hover:shadow-[#C62828]/25 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-red-300 disabled:shadow-none"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="mt-7 border-t border-stone-200 pt-6 text-center">
        <p className="text-sm text-slate-500">Ainda nao possui uma conta?</p>
        <button
          type="button"
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#C62828] bg-transparent px-4 py-3 text-sm font-semibold text-[#C62828] transition hover:bg-[#C62828]/8 hover:shadow-sm focus:outline-none focus:ring-4 focus:ring-[#C62828]/10"
        >
          <UserPlus size={17} aria-hidden="true" />
          Criar conta
        </button>
      </div>

      <p className="mt-8 text-center text-xs font-medium text-slate-400">
        🌶️ Sabor que marca. Qualidade que permanece.
      </p>
    </section>
  )
}

function MalaguettaLogo({ className }: { className?: string }) {
  return (
    <img
      src={logoSrc}
      alt="Restaurante Malaguetta"
      className={className}
    />
  )
}
