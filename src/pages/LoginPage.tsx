import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getCurrentSession, signInWithPassword } from '../services/authService'

const pepperLogoSrc = '/logo-pimenta.png'
const loginPanelSrc = '/login-pizza-panel.png'

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
          : 'Não foi possível entrar no sistema.',
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
    <main className="h-screen overflow-hidden bg-[#0b0b0b] text-white">
      <section className="grid h-screen lg:grid-cols-[46%_54%]">
        <LoginBrandPanel />

        <div className="relative flex h-screen items-center justify-center px-5 py-3 sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(198,40,40,0.12),transparent_30%),linear-gradient(120deg,#0b0b0b,#171717_50%,#0d0d0d)]" />
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
    <aside className="relative hidden h-screen overflow-hidden bg-[#151515] lg:block">
      <img
        src={loginPanelSrc}
        alt="Pizza artesanal do Restaurante Malaguetta"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-r from-transparent to-[#0b0b0b]" />
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
    <section className="relative z-10 max-h-[calc(100vh-24px)] w-full max-w-[620px] animate-[fadeIn_0.45s_ease-out] overflow-hidden rounded-2xl border border-[#C62828]/75 bg-[#151515]/82 px-7 py-6 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-md sm:px-12 sm:py-7">
      <div className="mb-5 text-center">
        <img
          src={pepperLogoSrc}
          alt="Pimenta Malaguetta"
          className="mx-auto h-12 w-auto max-w-44 object-contain"
        />
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Restaurante Malaguetta
        </h1>
        <div className="mt-3 flex items-center justify-center gap-5">
          <span className="h-px w-14 bg-[#2E7D32]" />
          <p className="text-base text-white/70 sm:text-lg">Acesso ao sistema</p>
          <span className="h-px w-14 bg-[#C62828]" />
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#C62828]/45 bg-[#C62828]/10 p-3 text-sm text-red-100">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm font-bold text-white">E-mail</span>
          <div className="relative mt-2">
            <Mail
              className="absolute left-5 top-1/2 -translate-y-1/2 text-white/70"
              size={24}
              aria-hidden="true"
            />
            <input
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              className="h-12 w-full rounded-lg border border-white/18 bg-[#111]/65 px-14 text-base text-white outline-none transition placeholder:text-white/38 focus:border-[#C62828] focus:bg-[#151515] focus:ring-4 focus:ring-[#C62828]/15"
              placeholder="Digite seu e-mail"
              autoComplete="email"
              required
            />
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-white">Senha</span>
          <div className="relative mt-2">
            <Lock
              className="absolute left-5 top-1/2 -translate-y-1/2 text-white/70"
              size={24}
              aria-hidden="true"
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              className="h-12 w-full rounded-lg border border-white/18 bg-[#111]/65 px-14 pr-16 text-base text-white outline-none transition placeholder:text-white/38 focus:border-[#C62828] focus:bg-[#151515] focus:ring-4 focus:ring-[#C62828]/15"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="absolute right-5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/70 transition hover:bg-white/8 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#C62828]/30"
              aria-label={showPassword ? 'Ocultar senha' : 'Visualizar senha'}
              onClick={onTogglePassword}
            >
              {showPassword ? (
                <EyeOff size={22} aria-hidden="true" />
              ) : (
                <Eye size={22} aria-hidden="true" />
              )}
            </button>
          </div>
        </label>

        <div className="flex items-center justify-between gap-4 text-base">
          <label className="flex items-center gap-3 text-white/75">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => onRememberMeChange(event.target.checked)}
              className="h-5 w-5 rounded accent-[#C62828]"
            />
            Lembrar de mim
          </label>
          <button
            type="button"
            className="font-medium text-[#ff3838] transition hover:text-white"
          >
            Esqueci minha senha
          </button>
        </div>

        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center gap-4 rounded-lg bg-[#C62828] px-5 text-base font-bold text-white shadow-[0_18px_38px_rgba(198,40,40,0.25)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#d11f1f] hover:shadow-[0_22px_50px_rgba(198,40,40,0.35)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-red-300 disabled:shadow-none"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
          {!isSubmitting && <ArrowRight size={25} aria-hidden="true" />}
        </button>
      </form>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <span className="h-px bg-white/10" />
        <p className="text-sm text-white/45">Ainda não tem uma conta?</p>
        <span className="h-px bg-white/10" />
      </div>

      <button
        type="button"
        className="mt-4 inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#C62828] bg-transparent text-base font-bold text-white transition hover:bg-[#C62828]/12 hover:shadow-[0_0_30px_rgba(198,40,40,0.16)] focus:outline-none focus:ring-4 focus:ring-[#C62828]/15"
      >
        <UserPlus size={28} className="text-[#ff3838]" aria-hidden="true" />
        Criar conta
      </button>
    </section>
  )
}
