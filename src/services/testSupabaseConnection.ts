import { supabase } from './supabaseClient'

export async function testSupabaseConnection() {
  const { error } = await supabase
    .from('categorias_ingredientes')
    .select('id')
    .limit(1)

  if (error) {
    return {
      ok: false,
      message: error.message,
    }
  }

  return {
    ok: true,
    message: 'Conexao com Supabase realizada com sucesso.',
  }
}
