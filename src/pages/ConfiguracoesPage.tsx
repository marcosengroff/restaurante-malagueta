import { CheckCircle2, KeyRound, ShieldAlert, UserRound, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getCurrentUser, sendPasswordResetEmail } from '../services/authService'

type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>

function getUserName(user: CurrentUser | null) {
  if (!user) {
    return 'Usuario'
  }

  const metadataName =
    typeof user.user_metadata?.name === 'string'
      ? user.user_metadata.name
      : typeof user.user_metadata?.full_name === 'string'
        ? user.user_metadata.full_name
        : ''

  return metadataName || user.email?.split('@')[0] || 'Usuario'
}

export function ConfiguracoesPage() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [resetEmail, setResetEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  useEffect(() => {
    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser)
        setResetEmail(currentUser.email ?? '')
      })
      .catch(() => {
        setUser(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  async function handleSendReset() {
    const email = resetEmail.trim()
    setMessage(null)

    if (!email) {
      setMessage({
        type: 'error',
        text: 'Informe o e-mail para enviar a redefinicao de senha.',
      })
      return
    }

    setIsSending(true)

    try {
      await sendPasswordResetEmail(email)
      setMessage({
        type: 'success',
        text: 'E-mail de redefinicao de senha enviado com sucesso.',
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Nao foi possivel enviar a redefinicao de senha.',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-950">Configuracoes</h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
          Gerencie os acessos do sistema com seguranca.
        </p>
      </div>

      {message && (
        <div
          className={`mb-5 flex items-start gap-2 rounded border p-3 text-base ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={20} aria-hidden="true" />
          ) : (
            <XCircle size={20} aria-hidden="true" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <section className="malaguetta-card rounded border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded bg-red-50 p-3 text-red-700">
              <UserRound size={24} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Usuario logado
              </h2>
              <p className="text-slate-500">Cadastro ativo nesta sessao.</p>
            </div>
          </div>

          {isLoading ? (
            <p className="text-slate-500">Carregando usuario...</p>
          ) : (
            <dl className="grid gap-3">
              <div className="rounded border border-stone-200 bg-stone-50 p-4">
                <dt className="font-semibold uppercase text-slate-500">Nome</dt>
                <dd className="mt-1 font-semibold text-slate-950">
                  {getUserName(user)}
                </dd>
              </div>
              <div className="rounded border border-stone-200 bg-stone-50 p-4">
                <dt className="font-semibold uppercase text-slate-500">E-mail</dt>
                <dd className="mt-1 font-semibold text-slate-950">
                  {user?.email ?? '-'}
                </dd>
              </div>
              <div className="rounded border border-stone-200 bg-stone-50 p-4">
                <dt className="font-semibold uppercase text-slate-500">Status</dt>
                <dd className="mt-1 font-semibold text-slate-950">
                  {user?.email_confirmed_at ? 'E-mail confirmado' : 'Pendente'}
                </dd>
              </div>
            </dl>
          )}
        </section>

        <section className="malaguetta-card rounded border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded bg-red-50 p-3 text-red-700">
              <KeyRound size={24} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Resetar senha
              </h2>
              <p className="text-slate-500">
                Envie um link de redefinicao para o e-mail informado.
              </p>
            </div>
          </div>

          <label className="block">
            <span className="font-semibold text-slate-700">E-mail</span>
            <input
              type="email"
              value={resetEmail}
              onChange={(event) => setResetEmail(event.target.value)}
              className="mt-2 w-full rounded border border-stone-300 px-3 py-2 text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/15"
              placeholder="usuario@email.com"
            />
          </label>

          <button
            type="button"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded bg-red-700 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-300"
            disabled={isSending}
            onClick={handleSendReset}
          >
            <KeyRound size={18} aria-hidden="true" />
            {isSending ? 'Enviando...' : 'Enviar reset de senha'}
          </button>
        </section>
      </div>

      <section className="malaguetta-card mt-5 rounded border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-1 shrink-0" size={24} aria-hidden="true" />
          <div>
            <h2 className="text-xl font-semibold">Usuarios do sistema</h2>
            <p className="mt-2 leading-7">
              Para visualizar todos os cadastros, excluir usuarios e executar
              acoes administrativas, e necessario criar uma funcao segura no
              Supabase usando a chave administrativa apenas no backend. Essa chave
              nao pode ficar no frontend.
            </p>
          </div>
        </div>
      </section>
    </section>
  )
}
