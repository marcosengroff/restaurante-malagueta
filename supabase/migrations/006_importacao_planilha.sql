create table if not exists public.importacoes (
  id uuid primary key default gen_random_uuid(),
  nome_arquivo text not null,
  hash_arquivo text not null,
  tamanho_arquivo bigint not null,
  status text not null default 'pendente',
  resumo jsonb not null default '{}'::jsonb,
  erros jsonb not null default '[]'::jsonb,
  usuario_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  finalizada_em timestamptz
);

create index if not exists importacoes_hash_arquivo_idx
  on public.importacoes (hash_arquivo);

alter table public.importacoes enable row level security;

drop policy if exists "Authenticated users can select importacoes" on public.importacoes;
create policy "Authenticated users can select importacoes"
on public.importacoes for select
to authenticated
using (auth.uid() = usuario_id);

drop policy if exists "Authenticated users can insert importacoes" on public.importacoes;
create policy "Authenticated users can insert importacoes"
on public.importacoes for insert
to authenticated
with check (auth.uid() = usuario_id);

drop policy if exists "Authenticated users can update importacoes" on public.importacoes;
create policy "Authenticated users can update importacoes"
on public.importacoes for update
to authenticated
using (auth.uid() = usuario_id)
with check (auth.uid() = usuario_id);

create or replace function public.registrar_importacao_planilha(
  nome_arquivo text,
  hash_arquivo text,
  tamanho_arquivo bigint,
  resumo jsonb,
  erros jsonb
)
returns uuid
language plpgsql
security invoker
as $$
declare
  importacao_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Usuario nao autenticado.';
  end if;

  insert into public.importacoes (
    nome_arquivo,
    hash_arquivo,
    tamanho_arquivo,
    status,
    resumo,
    erros,
    usuario_id,
    finalizada_em
  )
  values (
    nome_arquivo,
    hash_arquivo,
    tamanho_arquivo,
    'concluida',
    resumo,
    erros,
    auth.uid(),
    now()
  )
  returning id into importacao_id;

  return importacao_id;
end;
$$;
