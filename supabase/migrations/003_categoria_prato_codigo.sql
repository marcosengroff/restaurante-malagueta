create sequence if not exists public.categorias_pratos_codigo_seq;

create or replace function public.gerar_codigo_categoria_prato()
returns text
language plpgsql
as $$
begin
  return 'CPR' || lpad(nextval('public.categorias_pratos_codigo_seq')::text, 4, '0');
end;
$$;

alter table public.categorias_pratos
add column if not exists codigo text;

create or replace function public.set_codigo_categoria_prato()
returns trigger
language plpgsql
as $$
begin
  if new.codigo is null or btrim(new.codigo) = '' then
    new.codigo = public.gerar_codigo_categoria_prato();
  end if;

  return new;
end;
$$;

drop trigger if exists set_codigo_categoria_prato on public.categorias_pratos;
create trigger set_codigo_categoria_prato
before insert on public.categorias_pratos
for each row execute function public.set_codigo_categoria_prato();

update public.categorias_pratos
set codigo = public.gerar_codigo_categoria_prato()
where codigo is null or btrim(codigo) = '';

alter table public.categorias_pratos
alter column codigo set not null;

create unique index if not exists categorias_pratos_codigo_unique
  on public.categorias_pratos (codigo);

drop index if exists public.categorias_pratos_nome_unique;

create unique index if not exists categorias_pratos_nome_unique
  on public.categorias_pratos (
    lower(regexp_replace(btrim(nome), '\s+', ' ', 'g'))
  );
