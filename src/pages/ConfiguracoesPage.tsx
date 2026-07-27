import {
  CheckCircle2,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  type AdminUser,
  deleteAdminUser,
  listAdminUsers,
} from '../services/adminService'
import { getCurrentUser, sendPasswordResetEmail } from '../services/authService'
import { formatDate } from '../utils/formatters'

type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>

function getUserName(user: CurrentUser | null) {
  if (!user) {
    return 'Usuário'
  }

  const metadataName =
    typeof user.user_metadata?.name === 'string'
      ? user.user_metadata.name
      : typeof user.user_metadata?.full_name === 'string'
        ? user.user_metadata.full_name
        : ''

  return metadataName || user.email?.split('@')[0] || 'Usuário'
}

export function ConfiguracoesPage() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [resetEmail, setResetEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  useEffect(() => {
    Promise.all([getCurrentUser(), listAdminUsers()])
      .then(([currentUser, authUsers]) => {
        setUser(currentUser)
        setUsers(authUsers)
        setResetEmail(currentUser.email ?? '')
      })
      .catch((error) => {
        setMessage({
          type: 'error',
          text:
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os usuários.',
        })
      })
      .finally(() => {
        setIsLoading(false)
        setIsLoadingUsers(false)
      })
  }, [])

  async function reloadUsers() {
    setIsLoadingUsers(true)
    setMessage(null)

    try {
      setUsers(await listAdminUsers())
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os usuários.',
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  async function handleSendReset() {
    const email = resetEmail.trim()
    setMessage(null)

    if (!email) {
      setMessage({
        type: 'error',
        text: 'Informe o e-mail para enviar a redefinição de senha.',
      })
      return
    }

    setIsSending(true)

    try {
      await sendPasswordResetEmail(email)
      setMessage({
        type: 'success',
        text: 'E-mail de redefinição de senha enviado com sucesso.',
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Não foi possível enviar a redefinição de senha.',
      })
    } finally {
      setIsSending(false)
    }
  }

  async function handleDeleteUser(authUser: AdminUser) {
    if (authUser.id === user?.id) {
      setMessage({
        type: 'error',
        text: 'Você não pode excluir o próprio usuário logado.',
      })
      return
    }

    const confirmed = window.confirm(
      `Deseja excluir o acesso de ${authUser.email ?? 'este usuário'}?`,
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(authUser.id)
    setMessage(null)

    try {
      await deleteAdminUser(authUser.id)
      setUsers((currentUsers) =>
        currentUsers.filter((currentUser) => currentUser.id !== authUser.id),
      )
      setMessage({
        type: 'success',
        text: 'Usuário excluído com sucesso.',
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Não foi possível excluir o usuário.',
      })
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-950">Configurações</h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
          Gerencie os acessos do sistema com segurança. Esta área aparece apenas
          para o administrador.
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
                Administrador logado
              </h2>
              <p className="text-slate-500">Cadastro ativo nesta sessão.</p>
            </div>
          </div>

          {isLoading ? (
            <p className="text-slate-500">Carregando usuário...</p>
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
                Envie um link de redefinição para o e-mail informado.
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

      <section className="malaguetta-card mt-5 rounded border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded bg-red-50 p-3 text-red-700">
              <UsersRound size={24} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Usuários do sistema
              </h2>
              <p className="text-slate-500">
                Visualize cadastros, envie reset de senha e remova acessos.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded border border-stone-300 bg-white px-4 py-2.5 font-semibold text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoadingUsers}
            onClick={reloadUsers}
          >
            <RefreshCw size={18} aria-hidden="true" />
            Atualizar
          </button>
        </div>

        {isLoadingUsers ? (
          <p className="rounded border border-stone-200 bg-stone-50 p-4 text-slate-500">
            Carregando usuários...
          </p>
        ) : users.length === 0 ? (
          <p className="rounded border border-stone-200 bg-stone-50 p-4 text-slate-500">
            Nenhum usuário encontrado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-left text-sm uppercase text-slate-500">
                  <th className="px-4 py-3 font-semibold">E-mail</th>
                  <th className="px-4 py-3 font-semibold">Criado em</th>
                  <th className="px-4 py-3 font-semibold">Último login</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {users.map((authUser) => (
                  <tr key={authUser.id} className="bg-white">
                    <td className="px-4 py-3 font-semibold text-slate-950">
                      {authUser.email ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(authUser.created_at)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {authUser.last_sign_in_at
                        ? formatDate(authUser.last_sign_in_at)
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${
                          authUser.email_confirmed_at
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        <ShieldCheck size={16} aria-hidden="true" />
                        {authUser.email_confirmed_at ? 'Confirmado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-2 rounded border border-stone-300 bg-white px-3 py-2 font-semibold text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                          onClick={() => {
                            setResetEmail(authUser.email ?? '')
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                        >
                          <KeyRound size={16} aria-hidden="true" />
                          Resetar
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isDeleting === authUser.id}
                          onClick={() => handleDeleteUser(authUser)}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                          {isDeleting === authUser.id ? 'Excluindo...' : 'Excluir'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-5 rounded border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 shrink-0" size={24} aria-hidden="true" />
          <div>
            <h2 className="text-xl font-semibold">Importante</h2>
            <p className="mt-2 leading-7">
              O e-mail marcosengroffm@gmail.com fica registrado como admin pela
              migration. Para listar e excluir usuários, publique a Edge Function
              admin-users e configure SUPABASE_SERVICE_ROLE_KEY somente no
              ambiente da função.
            </p>
          </div>
        </div>
      </section>
    </section>
  )
}
