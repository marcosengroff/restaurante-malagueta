create table if not exists public.perfis_usuarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'usuario' check (role in ('admin', 'usuario')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists perfis_usuarios_role_idx
  on public.perfis_usuarios (role);

create or replace function public.set_perfis_usuarios_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_perfis_usuarios_updated_at on public.perfis_usuarios;

create trigger trg_perfis_usuarios_updated_at
before update on public.perfis_usuarios
for each row
execute function public.set_perfis_usuarios_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.perfis_usuarios
    where role = 'admin'
      and (
        user_id = auth.uid()
        or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

alter table public.perfis_usuarios enable row level security;

drop policy if exists "Usuarios podem ver o proprio perfil" on public.perfis_usuarios;
create policy "Usuarios podem ver o proprio perfil"
on public.perfis_usuarios
for select
to authenticated
using (
  user_id = auth.uid()
  or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or public.is_admin()
);

drop policy if exists "Admins podem gerenciar perfis" on public.perfis_usuarios;
create policy "Admins podem gerenciar perfis"
on public.perfis_usuarios
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.perfis_usuarios (user_id, email, role)
select id, email, 'admin'
from auth.users
where lower(email) = lower('marcosengroffm@gmail.com')
on conflict (email) do update
set user_id = excluded.user_id,
    role = 'admin';

insert into public.perfis_usuarios (email, role)
values ('marcosengroffm@gmail.com', 'admin')
on conflict (email) do update
set role = 'admin';
