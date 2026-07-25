create extension if not exists pgcrypto;

create table if not exists public.categorias_ingredientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categorias_ingredientes_nome_not_blank check (btrim(nome) <> '')
);

create unique index if not exists categorias_ingredientes_nome_unique
  on public.categorias_ingredientes (lower(btrim(nome)));

create table if not exists public.ingredientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria_id uuid references public.categorias_ingredientes (id) on update cascade on delete set null,
  unidade_compra text not null,
  quantidade_embalagem numeric not null,
  preco_embalagem numeric not null,
  unidade_base text not null,
  custo_unidade_base numeric not null default 0,
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ingredientes_nome_not_blank check (btrim(nome) <> ''),
  constraint ingredientes_unidade_compra_check check (unidade_compra in ('kg', 'g', 'l', 'ml', 'unidade')),
  constraint ingredientes_unidade_base_check check (unidade_base in ('g', 'ml', 'unidade')),
  constraint ingredientes_unidades_compativeis_check check (
    (unidade_compra in ('kg', 'g') and unidade_base = 'g')
    or (unidade_compra in ('l', 'ml') and unidade_base = 'ml')
    or (unidade_compra = 'unidade' and unidade_base = 'unidade')
  ),
  constraint ingredientes_quantidade_embalagem_positive check (quantidade_embalagem > 0),
  constraint ingredientes_preco_embalagem_non_negative check (preco_embalagem >= 0),
  constraint ingredientes_custo_unidade_base_non_negative check (custo_unidade_base >= 0)
);

create unique index if not exists ingredientes_nome_unique
  on public.ingredientes (lower(btrim(nome)));

create table if not exists public.categorias_pratos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ordem_exibicao integer not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categorias_pratos_nome_not_blank check (btrim(nome) <> '')
);

create unique index if not exists categorias_pratos_nome_unique
  on public.categorias_pratos (lower(btrim(nome)));

create table if not exists public.pratos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria_id uuid not null references public.categorias_pratos (id) on update cascade on delete restrict,
  descricao text,
  rendimento numeric not null default 1,
  custo_total numeric not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pratos_nome_not_blank check (btrim(nome) <> ''),
  constraint pratos_rendimento_positive check (rendimento > 0),
  constraint pratos_custo_total_non_negative check (custo_total >= 0)
);

create unique index if not exists pratos_nome_unique
  on public.pratos (lower(btrim(nome)));

create table if not exists public.itens_ficha_tecnica (
  id uuid primary key default gen_random_uuid(),
  prato_id uuid not null references public.pratos (id) on update cascade on delete cascade,
  ingrediente_id uuid not null references public.ingredientes (id) on update cascade on delete restrict,
  quantidade_utilizada numeric not null,
  unidade_utilizada text not null,
  custo_calculado numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint itens_ficha_tecnica_quantidade_positive check (quantidade_utilizada > 0),
  constraint itens_ficha_tecnica_unidade_utilizada_check check (unidade_utilizada in ('g', 'ml', 'unidade')),
  constraint itens_ficha_tecnica_custo_calculado_non_negative check (custo_calculado >= 0),
  constraint itens_ficha_tecnica_prato_ingrediente_unique unique (prato_id, ingrediente_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.calcular_custo_unidade_base()
returns trigger
language plpgsql
as $$
begin
  new.custo_unidade_base =
    case new.unidade_compra
      when 'kg' then new.preco_embalagem / (new.quantidade_embalagem * 1000)
      when 'g' then new.preco_embalagem / new.quantidade_embalagem
      when 'l' then new.preco_embalagem / (new.quantidade_embalagem * 1000)
      when 'ml' then new.preco_embalagem / new.quantidade_embalagem
      when 'unidade' then new.preco_embalagem / new.quantidade_embalagem
    end;

  return new;
end;
$$;

create or replace function public.calcular_custo_item_ficha()
returns trigger
language plpgsql
as $$
declare
  ingrediente_custo numeric;
  ingrediente_unidade_base text;
begin
  select custo_unidade_base, unidade_base
    into ingrediente_custo, ingrediente_unidade_base
  from public.ingredientes
  where id = new.ingrediente_id;

  if ingrediente_unidade_base is null then
    raise exception 'Ingrediente % nao encontrado.', new.ingrediente_id;
  end if;

  if new.unidade_utilizada <> ingrediente_unidade_base then
    raise exception 'Unidade utilizada % incompativel com unidade-base % do ingrediente.',
      new.unidade_utilizada,
      ingrediente_unidade_base;
  end if;

  new.custo_calculado = new.quantidade_utilizada * ingrediente_custo;

  return new;
end;
$$;

create or replace function public.recalcular_custo_total_prato(prato_uuid uuid)
returns void
language plpgsql
as $$
begin
  update public.pratos
  set custo_total = coalesce((
    select sum(custo_calculado)
    from public.itens_ficha_tecnica
    where prato_id = prato_uuid
  ), 0),
  updated_at = now()
  where id = prato_uuid;
end;
$$;

create or replace function public.recalcular_custo_total_prato_trigger()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    perform public.recalcular_custo_total_prato(new.prato_id);
  elsif tg_op = 'UPDATE' then
    perform public.recalcular_custo_total_prato(new.prato_id);

    if old.prato_id is distinct from new.prato_id then
      perform public.recalcular_custo_total_prato(old.prato_id);
    end if;
  elsif tg_op = 'DELETE' then
    perform public.recalcular_custo_total_prato(old.prato_id);
  end if;

  return null;
end;
$$;

create or replace function public.recalcular_itens_por_ingrediente()
returns trigger
language plpgsql
as $$
declare
  prato_afetado uuid;
begin
  update public.itens_ficha_tecnica
  set custo_calculado = quantidade_utilizada * new.custo_unidade_base,
      updated_at = now()
  where ingrediente_id = new.id;

  for prato_afetado in
    select distinct prato_id
    from public.itens_ficha_tecnica
    where ingrediente_id = new.id
  loop
    perform public.recalcular_custo_total_prato(prato_afetado);
  end loop;

  return null;
end;
$$;

drop trigger if exists set_updated_at_categorias_ingredientes on public.categorias_ingredientes;
create trigger set_updated_at_categorias_ingredientes
before update on public.categorias_ingredientes
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_ingredientes on public.ingredientes;
create trigger set_updated_at_ingredientes
before update on public.ingredientes
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_categorias_pratos on public.categorias_pratos;
create trigger set_updated_at_categorias_pratos
before update on public.categorias_pratos
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_pratos on public.pratos;
create trigger set_updated_at_pratos
before update on public.pratos
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_itens_ficha_tecnica on public.itens_ficha_tecnica;
create trigger set_updated_at_itens_ficha_tecnica
before update on public.itens_ficha_tecnica
for each row execute function public.set_updated_at();

drop trigger if exists calcular_custo_unidade_base_ingredientes on public.ingredientes;
create trigger calcular_custo_unidade_base_ingredientes
before insert or update of unidade_compra, quantidade_embalagem, preco_embalagem, unidade_base
on public.ingredientes
for each row execute function public.calcular_custo_unidade_base();

drop trigger if exists calcular_custo_item_ficha on public.itens_ficha_tecnica;
create trigger calcular_custo_item_ficha
before insert or update of ingrediente_id, quantidade_utilizada, unidade_utilizada
on public.itens_ficha_tecnica
for each row execute function public.calcular_custo_item_ficha();

drop trigger if exists recalcular_custo_total_prato_itens on public.itens_ficha_tecnica;
create trigger recalcular_custo_total_prato_itens
after insert or update or delete on public.itens_ficha_tecnica
for each row execute function public.recalcular_custo_total_prato_trigger();

drop trigger if exists recalcular_itens_por_ingrediente on public.ingredientes;
create trigger recalcular_itens_por_ingrediente
after update of custo_unidade_base on public.ingredientes
for each row
when (old.custo_unidade_base is distinct from new.custo_unidade_base)
execute function public.recalcular_itens_por_ingrediente();

alter table public.categorias_ingredientes enable row level security;
alter table public.ingredientes enable row level security;
alter table public.categorias_pratos enable row level security;
alter table public.pratos enable row level security;
alter table public.itens_ficha_tecnica enable row level security;

drop policy if exists "Authenticated users can select categorias_ingredientes" on public.categorias_ingredientes;
create policy "Authenticated users can select categorias_ingredientes"
on public.categorias_ingredientes for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert categorias_ingredientes" on public.categorias_ingredientes;
create policy "Authenticated users can insert categorias_ingredientes"
on public.categorias_ingredientes for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update categorias_ingredientes" on public.categorias_ingredientes;
create policy "Authenticated users can update categorias_ingredientes"
on public.categorias_ingredientes for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete categorias_ingredientes" on public.categorias_ingredientes;
create policy "Authenticated users can delete categorias_ingredientes"
on public.categorias_ingredientes for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can select ingredientes" on public.ingredientes;
create policy "Authenticated users can select ingredientes"
on public.ingredientes for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert ingredientes" on public.ingredientes;
create policy "Authenticated users can insert ingredientes"
on public.ingredientes for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update ingredientes" on public.ingredientes;
create policy "Authenticated users can update ingredientes"
on public.ingredientes for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete ingredientes" on public.ingredientes;
create policy "Authenticated users can delete ingredientes"
on public.ingredientes for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can select categorias_pratos" on public.categorias_pratos;
create policy "Authenticated users can select categorias_pratos"
on public.categorias_pratos for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert categorias_pratos" on public.categorias_pratos;
create policy "Authenticated users can insert categorias_pratos"
on public.categorias_pratos for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update categorias_pratos" on public.categorias_pratos;
create policy "Authenticated users can update categorias_pratos"
on public.categorias_pratos for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete categorias_pratos" on public.categorias_pratos;
create policy "Authenticated users can delete categorias_pratos"
on public.categorias_pratos for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can select pratos" on public.pratos;
create policy "Authenticated users can select pratos"
on public.pratos for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert pratos" on public.pratos;
create policy "Authenticated users can insert pratos"
on public.pratos for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update pratos" on public.pratos;
create policy "Authenticated users can update pratos"
on public.pratos for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete pratos" on public.pratos;
create policy "Authenticated users can delete pratos"
on public.pratos for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can select itens_ficha_tecnica" on public.itens_ficha_tecnica;
create policy "Authenticated users can select itens_ficha_tecnica"
on public.itens_ficha_tecnica for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert itens_ficha_tecnica" on public.itens_ficha_tecnica;
create policy "Authenticated users can insert itens_ficha_tecnica"
on public.itens_ficha_tecnica for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update itens_ficha_tecnica" on public.itens_ficha_tecnica;
create policy "Authenticated users can update itens_ficha_tecnica"
on public.itens_ficha_tecnica for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete itens_ficha_tecnica" on public.itens_ficha_tecnica;
create policy "Authenticated users can delete itens_ficha_tecnica"
on public.itens_ficha_tecnica for delete
to authenticated
using (true);
