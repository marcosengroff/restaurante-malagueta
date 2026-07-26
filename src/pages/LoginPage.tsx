import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getCurrentSession, signInWithPassword } from '../services/authService'

const loginReferenceSrc = '/login-reference.png'
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
      <section className="relative hidden h-screen overflow-hidden xl:block">
        <img
          src={loginReferenceSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/5" />
        <DesktopLoginForm
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
      </section>

      <section className="flex h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(198,40,40,0.28),transparent_30%),linear-gradient(135deg,#090909,#171717_55%,#090909)] px-5 py-4 xl:hidden">
        <MobileLoginCard
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
      </section>
    </main>
  )
}

type LoginFormProps = {
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
}

function DesktopLoginForm(props: LoginFormProps) {
  return (
    <div className="absolute right-[8.6%] top-[9.8%] z-10 h-[81.5%] w-[44.8%]">
      <LoginFormContent {...props} desktop />
    </div>
  )
}

function MobileLoginCard(props: LoginFormProps) {
  return (
    <div className="max-h-[calc(100vh-32px)] w-full max-w-md rounded-2xl border border-[#C62828]/80 bg-[#151515]/88 px-6 py-6 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur">
      <LoginFormContent {...props} />
    </div>
  )
}

function LoginFormContent({
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
  desktop = false,
}: LoginFormProps & { desktop?: boolean }) {
  return (
    <div
      className={
        desktop
          ? 'flex h-full flex-col px-[9.2%] pb-[6.2%] pt-[11.5%]'
          : 'flex h-full flex-col'
      }
    >
      <div className="text-center">
        <img
          src={pepperLogoSrc}
          alt="Pimenta Malaguetta"
          className={desktop ? 'mx-auto h-[8.2vh] w-auto object-contain' : 'mx-auto h-12 w-auto object-contain'}
        />
        <h1 className={desktop ? 'mt-[2.5vh] text-[2.15vw] font-bold tracking-tight text-white' : 'mt-4 text-2xl font-bold tracking-tight text-white'}>
          Restaurante Malaguetta
        </h1>
        <div className="mt-[1.8vh] flex items-center justify-center gap-7">
          <span className="h-px w-16 bg-[#2E7D32]" />
          <p className={desktop ? 'text-[1.45vw] text-white/70' : 'text-base text-white/70'}>
            Acesso ao sistema
          </p>
          <span className="h-px w-16 bg-[#C62828]" />
        </div>
      </div>

      {error && (
        <div className="mt-[2vh] flex items-start gap-2 rounded-lg border border-[#C62828]/45 bg-[#C62828]/10 px-4 py-3 text-sm text-red-100">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form
        className={desktop ? 'mt-[5vh] space-y-[3.4vh]' : 'mt-6 space-y-4'}
        onSubmit={onSubmit}
      >
        <FormField
          label="E-mail"
          icon={Mail}
          type="email"
          value={email}
          placeholder="Digite seu e-mail"
          autoComplete="email"
          onChange={onEmailChange}
          desktop={desktop}
        />

        <FormField
          label="Senha"
          icon={Lock}
          type={showPassword ? 'text' : 'password'}
          value={password}
          placeholder="Digite sua senha"
          autoComplete="current-password"
          onChange={onPasswordChange}
          desktop={desktop}
          trailingButton={
            <button
              type="button"
              className="rounded-lg p-2 text-white/72 transition hover:bg-white/8 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#C62828]/30"
              aria-label={showPassword ? 'Ocultar senha' : 'Visualizar senha'}
              onClick={onTogglePassword}
            >
              {showPassword ? (
                <EyeOff size={desktop ? 24 : 21} aria-hidden="true" />
              ) : (
                <Eye size={desktop ? 24 : 21} aria-hidden="true" />
              )}
            </button>
          }
        />

        <div className={desktop ? 'flex items-center justify-between text-[1.2vw]' : 'flex items-center justify-between gap-3 text-sm'}>
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
          className={desktop ? 'flex h-[6.6vh] w-full items-center justify-center gap-16 rounded-lg bg-[#C62828] px-5 text-[1.35vw] font-bold text-white shadow-[0_18px_38px_rgba(198,40,40,0.25)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#d11f1f] hover:shadow-[0_22px_50px_rgba(198,40,40,0.35)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-red-300 disabled:shadow-none' : 'flex h-12 w-full items-center justify-center gap-4 rounded-lg bg-[#C62828] px-5 text-base font-bold text-white shadow-[0_18px_38px_rgba(198,40,40,0.25)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#d11f1f] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-red-300 disabled:shadow-none'}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
          {!isSubmitting && <ArrowRight size={desktop ? 28 : 23} aria-hidden="true" />}
        </button>
      </form>

      <div className={desktop ? 'mt-auto grid grid-cols-[1fr_auto_1fr] items-center gap-4' : 'mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3'}>
        <span className="h-px bg-white/10" />
        <p className={desktop ? 'text-[1vw] text-white/45' : 'text-xs text-white/45'}>
          Ainda não tem uma conta?
        </p>
        <span className="h-px bg-white/10" />
      </div>

      <button
        type="button"
        className={desktop ? 'mt-[3vh] inline-flex h-[5.6vh] w-full items-center justify-center gap-4 rounded-lg border border-[#C62828] bg-transparent text-[1.2vw] font-bold text-white transition hover:bg-[#C62828]/12 hover:shadow-[0_0_30px_rgba(198,40,40,0.16)] focus:outline-none focus:ring-4 focus:ring-[#C62828]/15' : 'mt-4 inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#C62828] bg-transparent text-base font-bold text-white transition hover:bg-[#C62828]/12 focus:outline-none focus:ring-4 focus:ring-[#C62828]/15'}
      >
        <UserPlus size={desktop ? 30 : 24} className="text-[#ff3838]" aria-hidden="true" />
        Criar conta
      </button>
    </div>
  )
}

function FormField({
  label,
  icon: Icon,
  type,
  value,
  placeholder,
  autoComplete,
  onChange,
  trailingButton,
  desktop,
}: {
  label: string
  icon: typeof Mail
  type: string
  value: string
  placeholder: string
  autoComplete: string
  onChange: (value: string) => void
  trailingButton?: ReactNode
  desktop: boolean
}) {
  return (
    <label className="block">
      <span className={desktop ? 'text-[1.18vw] font-bold text-white' : 'text-sm font-bold text-white'}>
        {label}
      </span>
      <div className="relative mt-3">
        <Icon
          className="absolute left-5 top-1/2 -translate-y-1/2 text-white/72"
          size={desktop ? 26 : 22}
          aria-hidden="true"
        />
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={desktop ? 'h-[6.45vh] w-full rounded-lg border border-white/18 bg-[#111]/68 px-16 pr-16 text-[1.35vw] text-white outline-none transition placeholder:text-white/36 focus:border-[#C62828] focus:bg-[#151515] focus:ring-4 focus:ring-[#C62828]/15' : 'h-12 w-full rounded-lg border border-white/18 bg-[#111]/68 px-14 pr-14 text-base text-white outline-none transition placeholder:text-white/36 focus:border-[#C62828] focus:bg-[#151515] focus:ring-4 focus:ring-[#C62828]/15'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
        />
        {trailingButton && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            {trailingButton}
          </div>
        )}
      </div>
    </label>
  )
}
