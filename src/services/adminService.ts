import { supabase } from './supabaseClient'

export type AdminUser = {
  id: string
  email: string | null
  created_at: string
  last_sign_in_at: string | null
  email_confirmed_at: string | null
}

export async function isCurrentUserAdmin() {
  const { data, error } = await supabase.rpc('is_admin')

  if (error) {
    throw new Error(error.message)
  }

  return Boolean(data)
}

export async function listAdminUsers() {
  const { data, error } = await supabase.functions.invoke<{
    users: AdminUser[]
    error?: string
  }>('admin-users', {
    body: { action: 'list' },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  return data?.users ?? []
}

export async function deleteAdminUser(userId: string) {
  const { data, error } = await supabase.functions.invoke<{
    ok?: boolean
    error?: string
  }>('admin-users', {
    body: { action: 'delete', userId },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data?.error) {
    throw new Error(data.error)
  }
}
