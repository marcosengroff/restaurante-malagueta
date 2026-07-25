create sequence if not exists public.pratos_codigo_seq;

create or replace function public.gerar_codigo_prato()
returns text
language plpgsql
as $$
begin
  return 'PRT' || lpad(nextval('public.pratos_codigo_seq')::text, 4, '0');
end;
$$;

alter table public.pratos
add column if not exists codigo text,
add column if not exists peso_final numeric,
add column if not exists tempo_preparo integer,
add column if not exists observacoes text;

alter table public.pratos
alter column categoria_id set not null,
alter column descricao drop not null,
alter column rendimento set default 1,
alter column rendimento set not null,
alter column ativo set default true,
alter column ativo set not null,
alter column created_at set default now(),
alter column created_at set not null,
alter column updated_at set default now(),
alter column updated_at set not null;

create or replace function public.set_codigo_prato()
returns trigger
language plpgsql
as $$
begin
  if new.codigo is null or btrim(new.codigo) = '' then
    new.codigo = public.gerar_codigo_prato();
  end if;

  return new;
end;
$$;

drop trigger if exists set_codigo_prato on public.pratos;
create trigger set_codigo_prato
before insert on public.pratos
for each row execute function public.set_codigo_prato();

update public.pratos
set codigo = public.gerar_codigo_prato()
where codigo is null or btrim(codigo) = '';

alter table public.pratos
alter column codigo set not null;

create unique index if not exists pratos_codigo_unique
  on public.pratos (codigo);

drop index if exists public.pratos_nome_unique;

create unique index if not exists pratos_nome_unique
  on public.pratos (
    lower(regexp_replace(btrim(nome), '\s+', ' ', 'g'))
  );

alter table public.pratos
drop constraint if exists pratos_peso_final_positive,
add constraint pratos_peso_final_positive check (peso_final is null or peso_final > 0);

alter table public.pratos
drop constraint if exists pratos_tempo_preparo_positive,
add constraint pratos_tempo_preparo_positive check (tempo_preparo is null or tempo_preparo > 0);
