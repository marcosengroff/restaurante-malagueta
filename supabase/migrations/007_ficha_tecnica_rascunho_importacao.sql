alter table public.itens_ficha_tecnica
add column if not exists quantidade numeric,
add column if not exists unidade_base text,
add column if not exists observacao text,
add column if not exists ordem integer not null default 0;

update public.itens_ficha_tecnica
set quantidade = coalesce(quantidade, quantidade_utilizada, 0),
    unidade_base = coalesce(unidade_base, unidade_utilizada)
where quantidade is null or unidade_base is null;

alter table public.itens_ficha_tecnica
alter column quantidade set not null,
alter column unidade_base set not null;

alter table public.itens_ficha_tecnica
drop constraint if exists itens_ficha_tecnica_quantidade_positive,
drop constraint if exists itens_ficha_tecnica_quantidade_non_negative,
add constraint itens_ficha_tecnica_quantidade_non_negative check (quantidade >= 0);

alter table public.itens_ficha_tecnica
drop constraint if exists itens_ficha_tecnica_quantidade_utilizada_positive,
drop constraint if exists itens_ficha_tecnica_quantidade_utilizada_positive_check,
drop constraint if exists itens_ficha_tecnica_quantidade_utilizada_check,
drop constraint if exists itens_ficha_tecnica_quantidade_utilizada_non_negative,
add constraint itens_ficha_tecnica_quantidade_utilizada_non_negative
check (quantidade_utilizada >= 0);

alter table public.itens_ficha_tecnica
drop constraint if exists itens_ficha_tecnica_unidade_utilizada_check,
drop constraint if exists itens_ficha_tecnica_unidade_base_check,
add constraint itens_ficha_tecnica_unidade_base_check
check (unidade_base in ('g', 'ml', 'unidade'));

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

  new.unidade_base = ingrediente_unidade_base;
  new.unidade_utilizada = ingrediente_unidade_base;
  new.quantidade_utilizada = coalesce(new.quantidade, 0);
  new.custo_calculado = coalesce(new.quantidade, 0) * ingrediente_custo;

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
    select sum(coalesce(i.quantidade, 0) * ing.custo_unidade_base)
    from public.itens_ficha_tecnica i
    join public.ingredientes ing on ing.id = i.ingrediente_id
    where i.prato_id = prato_uuid
  ), 0),
  updated_at = now()
  where id = prato_uuid;
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
  set custo_calculado = coalesce(quantidade, 0) * new.custo_unidade_base,
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
