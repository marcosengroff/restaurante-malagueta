import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type AdminUsersRequest =
  | { action: 'list' }
  | { action: 'delete'; userId: string }

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: 'Funcao administrativa nao configurada.' }, 500)
    }

    const authorization = request.headers.get('Authorization')

    if (!authorization) {
      return json({ error: 'Sessao nao informada.' }, 401)
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    })

    const { data: isAdmin, error: adminError } =
      await userClient.rpc('is_admin')

    if (adminError || !isAdmin) {
      return json({ error: 'Acesso restrito ao administrador.' }, 403)
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const body = (await request.json()) as AdminUsersRequest

    if (body.action === 'list') {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      })

      if (error) {
        return json({ error: error.message }, 400)
      }

      return json({
        users: data.users.map((user) => ({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          email_confirmed_at: user.email_confirmed_at,
        })),
      })
    }

    if (body.action === 'delete') {
      const { error } = await adminClient.auth.admin.deleteUser(body.userId)

      if (error) {
        return json({ error: error.message }, 400)
      }

      return json({ ok: true })
    }

    return json({ error: 'Acao administrativa invalida.' }, 400)
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Nao foi possivel executar a acao administrativa.',
      },
      500,
    )
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}
