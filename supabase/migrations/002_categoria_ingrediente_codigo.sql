create sequence if not exists public.categorias_ingredientes_codigo_seq;

create or replace function public.gerar_codigo_categoria_ingrediente()
returns text
language plpgsql
as $$
begin
  return 'CAT' || lpad(nextval('public.categorias_ingredientes_codigo_seq')::text, 4, '0');
end;
$$;

alter table public.categorias_ingredientes
add column if not exists codigo text;

create or replace function public.set_codigo_categoria_ingrediente()
returns trigger
language plpgsql
as $$
begin
  if new.codigo is null or btrim(new.codigo) = '' then
    new.codigo = public.gerar_codigo_categoria_ingrediente();
  end if;

  return new;
end;
$$;

drop trigger if exists set_codigo_categoria_ingrediente on public.categorias_ingredientes;
create trigger set_codigo_categoria_ingrediente
before insert on public.categorias_ingredientes
for each row execute function public.set_codigo_categoria_ingrediente();

update public.categorias_ingredientes
set codigo = public.gerar_codigo_categoria_ingrediente()
where codigo is null or btrim(codigo) = '';

alter table public.categorias_ingredientes
alter column codigo set not null;

create unique index if not exists categorias_ingredientes_codigo_unique
  on public.categorias_ingredientes (codigo);

drop index if exists public.categorias_ingredientes_nome_unique;

create unique index if not exists categorias_ingredientes_nome_unique
  on public.categorias_ingredientes (
    lower(regexp_replace(btrim(nome), '\s+', ' ', 'g'))
  );
