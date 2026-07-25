update public.categorias_pratos
set nome = case lower(btrim(nome))
  when 'acomp. - molhos' then 'ACOMP. - MOLHOS'
  when 'petiscos' then 'PETISCOS'
  when 'filés bovinos' then 'FILÉS BOVINOS'
  when 'filés de frango' then 'FILÉS DE FRANGO'
  when 'filés de peixe' then 'FILÉS DE PEIXE'
  when 'pizzas salgadas' then 'PIZZAS SALGADAS'
  when 'pizzas doces' then 'PIZZAS DOCES'
  when 'especiais' then 'ESPECIAIS'
  when 'massas' then 'MASSAS'
  when 'sobremesas' then 'SOBREMESAS'
  else nome
end
where lower(btrim(nome)) in (
  'acomp. - molhos',
  'petiscos',
  'filés bovinos',
  'filés de frango',
  'filés de peixe',
  'pizzas salgadas',
  'pizzas doces',
  'especiais',
  'massas',
  'sobremesas'
);

update public.pratos
set nome = regexp_replace(
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(nome, '([[:alpha:]])\(', '\1 (', 'g'),
              '\ma grega\M', 'à Grega', 'gi'
            ),
            '\ma parmegiana\M', 'à Parmegiana', 'gi'
          ),
          '\ma portuguesa\M', 'à Portuguesa', 'gi'
        ),
        '\ma calif[oó]rnia\M', 'à Califórnia', 'gi'
      ),
      '\ma su[ií]ça\M', 'à Suíça', 'gi'
    ),
    '\ma malaguetta\M', 'à Malaguetta', 'gi'
  ),
  '\ma milanesa\M', 'à Milanesa', 'gi'
);

update public.ingredientes
set nome = regexp_replace(
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(nome, '\ma grega\M', 'à Grega', 'gi'),
            '\ma parmegiana\M', 'à Parmegiana', 'gi'
          ),
          '\ma portuguesa\M', 'à Portuguesa', 'gi'
        ),
        '\ma calif[oó]rnia\M', 'à Califórnia', 'gi'
      ),
      '\ma su[ií]ça\M', 'à Suíça', 'gi'
    ),
    '\ma malaguetta\M', 'à Malaguetta', 'gi'
  ),
  '\ma milanesa\M', 'à Milanesa', 'gi'
);
