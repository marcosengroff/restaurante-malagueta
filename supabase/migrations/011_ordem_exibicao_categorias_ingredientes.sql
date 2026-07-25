-- Adiciona coluna ordem_exibicao para controlar a ordem de exibicao das categorias
-- conforme a sequencia definida na planilha original (Restaurante Malaguetta.xlsx)

alter table public.categorias_ingredientes
  add column ordem_exibicao int not null default 0;

-- Ordem definida pela planilha (9 categorias)
with categorias_ordenadas (nome, ordem) as (
  values
    ('CARNES E PROTEÍNAS', 1),
    ('MOLHOS', 2),
    ('QUEIJOS E LATICÍNIOS', 3),
    ('MASSAS E FARINHAS', 4),
    ('HORTALIÇAS E LEGUMES', 5),
    ('FRUTAS', 6),
    ('CEREAIS, TUBÉRCULOS E DERIVADOS', 7),
    ('TEMPEROS, ERVAS E CONDIMENTOS', 8),
    ('DOCES, CHOCOLATES E SOBREMESAS', 9)
)
update public.categorias_ingredientes ci
set ordem_exibicao = co.ordem
from categorias_ordenadas co
where lower(btrim(ci.nome)) = lower(btrim(co.nome));

-- Categorias sem ordem definida vao para o final
update public.categorias_ingredientes
set ordem_exibicao = 999
where ordem_exibicao = 0;
