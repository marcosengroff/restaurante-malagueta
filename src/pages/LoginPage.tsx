import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  getCurrentSession,
  signInWithPassword,
  signUpWithPassword,
} from '../services/authService'

const leftPanelSrc = '/login-left-panel.png'
const pepperLogoSrc = '/logo-pimenta.png'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname?: string } } | null)?.from
    ?.pathname
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
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
      const message =
        loginError instanceof Error
          ? loginError.message
          : 'Nao foi possivel entrar no sistema.'

      setError(
        message === 'Email not confirmed'
          ? 'E-mail ainda nao confirmado no Supabase. Confirme o usuario em Authentication > Users para liberar o acesso.'
          : message,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCreateAccount() {
    setError('')

    if (!email.trim() || password.length < 6) {
      setError(
        'Informe um e-mail e uma senha com pelo menos 6 caracteres para criar a conta.',
      )
      return
    }

    setIsCreatingAccount(true)

    try {
      const data = await signUpWithPassword(email.trim(), password)

      if (data.session) {
        navigate(from ?? '/painel', { replace: true })
        return
      }

      setError(
        'Conta criada. O Supabase exige confirmacao de e-mail antes do primeiro acesso.',
      )
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : 'Nao foi possivel criar a conta.',
      )
    } finally {
      setIsCreatingAccount(false)
    }
  }

  if (isCheckingSession) {
    return (
      <main className="flex h-screen items-center justify-center overflow-hidden bg-[#080808] px-4 text-sm text-white/75">
        Verificando acesso...
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={from ?? '/painel'} replace />
  }

  return (
    <main className="h-screen overflow-hidden bg-[#080808] text-white">
      <section className="grid h-screen lg:grid-cols-[48%_52%]">
        <aside className="relative hidden h-screen overflow-hidden bg-[#080808] lg:block">
          <img
            src={leftPanelSrc}
            alt="Restaurante Malaguetta"
            className="h-full w-full object-contain object-left"
          />
          <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-r from-transparent to-[#080808]/70" />
        </aside>

        <section className="relative flex h-screen items-center justify-start overflow-hidden px-4 py-4 sm:px-8 lg:pl-2 lg:pr-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(198,40,40,0.1),transparent_30%),linear-gradient(120deg,#080808,#151515_48%,#080808)]" />
          <LoginCard
            email={email}
            password={password}
            rememberMe={rememberMe}
            showPassword={showPassword}
            error={error}
            isSubmitting={isSubmitting}
            isCreatingAccount={isCreatingAccount}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onRememberMeChange={setRememberMe}
            onTogglePassword={() => setShowPassword((current) => !current)}
            onSubmit={handleSubmit}
            onCreateAccount={handleCreateAccount}
          />
        </section>
      </section>
    </main>
  )
}

function LoginCard({
  email,
  password,
  rememberMe,
  showPassword,
  error,
  isSubmitting,
  isCreatingAccount,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onTogglePassword,
  onSubmit,
  onCreateAccount,
}: {
  email: string
  password: string
  rememberMe: boolean
  showPassword: boolean
  error: string
  isSubmitting: boolean
  isCreatingAccount: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onRememberMeChange: (value: boolean) => void
  onTogglePassword: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCreateAccount: () => void
}) {
  return (
    <div className="relative z-10 flex max-h-[calc(100vh-32px)] w-full max-w-[650px] flex-col rounded-2xl border border-[#C62828]/80 bg-[#151515]/86 px-7 py-7 shadow-[0_28px_90px_rgba(0,0,0,0.48)] backdrop-blur-md sm:px-12 lg:px-14">
      <div className="text-center">
        <img
          src={pepperLogoSrc}
          alt="Pimenta Malaguetta"
          className="mx-auto h-14 w-auto max-w-56 object-contain"
        />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Restaurante Malaguetta
        </h1>
        <div className="mt-3 flex items-center justify-center gap-7">
          <span className="h-px w-16 bg-[#2E7D32]" />
          <p className="text-base text-white/70 sm:text-lg">Acesso ao sistema</p>
          <span className="h-px w-16 bg-[#C62828]" />
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#C62828]/45 bg-[#C62828]/10 px-4 py-3 text-sm text-red-100">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form className="mt-6 space-y-5" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm font-bold text-white">E-mail</span>
          <div className="relative mt-2">
            <Mail
              className="absolute left-5 top-1/2 -translate-y-1/2 text-white/72"
              size={24}
              aria-hidden="true"
            />
            <input
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              className="h-14 w-full rounded-lg border border-white/18 bg-[#111]/68 px-16 text-base text-white outline-none transition placeholder:text-white/36 focus:border-[#C62828] focus:bg-[#151515] focus:ring-4 focus:ring-[#C62828]/15"
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
              className="absolute left-5 top-1/2 -translate-y-1/2 text-white/72"
              size={24}
              aria-hidden="true"
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              className="h-14 w-full rounded-lg border border-white/18 bg-[#111]/68 px-16 pr-16 text-base text-white outline-none transition placeholder:text-white/36 focus:border-[#C62828] focus:bg-[#151515] focus:ring-4 focus:ring-[#C62828]/15"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="absolute right-5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/72 transition hover:bg-white/8 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#C62828]/30"
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
          <label className="flex items-center gap-3 text-white/78">
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
          className="flex h-14 w-full items-center justify-center gap-12 rounded-lg bg-[#C62828] px-5 text-base font-bold text-white shadow-[0_18px_38px_rgba(198,40,40,0.25)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#d11f1f] hover:shadow-[0_22px_50px_rgba(198,40,40,0.35)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-red-300 disabled:shadow-none"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
          {!isSubmitting && <ArrowRight size={26} aria-hidden="true" />}
        </button>
      </form>

      <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <span className="h-px bg-white/10" />
        <p className="text-sm text-white/45">Ainda não tem uma conta?</p>
        <span className="h-px bg-white/10" />
      </div>

      <button
        type="button"
        className="mt-5 inline-flex h-14 w-full items-center justify-center gap-3 rounded-lg border border-[#C62828] bg-transparent text-base font-bold text-white transition hover:bg-[#C62828]/12 hover:shadow-[0_0_30px_rgba(198,40,40,0.16)] focus:outline-none focus:ring-4 focus:ring-[#C62828]/15 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isCreatingAccount}
        onClick={onCreateAccount}
      >
        <UserPlus size={27} className="text-[#ff3838]" aria-hidden="true" />
        {isCreatingAccount ? 'Criando conta...' : 'Criar conta'}
      </button>
    </div>
  )
}
