do $$
declare
  categoria_frango_id uuid;
  categoria_peixe_id uuid;
  prato_uuid uuid;
  ingrediente_uuid uuid;
  receita record;
  ingrediente_nome text;
  ingrediente_ordem integer;
begin
  select id into categoria_frango_id
  from public.categorias_pratos
  where lower(btrim(nome)) = lower(btrim('FILÉS DE FRANGO'))
  limit 1;

  if categoria_frango_id is null then
    insert into public.categorias_pratos (nome, ordem_exibicao, ativo)
    values ('FILÉS DE FRANGO', 3, true)
    returning id into categoria_frango_id;
  else
    update public.categorias_pratos
    set nome = 'FILÉS DE FRANGO',
        ordem_exibicao = 3,
        ativo = true
    where id = categoria_frango_id;
  end if;

  select id into categoria_peixe_id
  from public.categorias_pratos
  where lower(btrim(nome)) = lower(btrim('FILÉS DE PEIXE'))
  limit 1;

  if categoria_peixe_id is null then
    insert into public.categorias_pratos (nome, ordem_exibicao, ativo)
    values ('FILÉS DE PEIXE', 4, true)
    returning id into categoria_peixe_id;
  else
    update public.categorias_pratos
    set nome = 'FILÉS DE PEIXE',
        ordem_exibicao = 4,
        ativo = true
    where id = categoria_peixe_id;
  end if;

  for receita in
    select *
    from (
      values
        ('FILÉS DE FRANGO', categoria_frango_id, 'Frango à Parmegiana (2 pessoas)', array[
          'Filé de frango',
          'Farinha de Milho',
          'Presunto',
          'Queijo muçarela',
          'Molho vermelho',
          'Arroz branco',
          'Batata frita',
          'Salada'
        ]::text[]),
        ('FILÉS DE FRANGO', categoria_frango_id, 'Frango à Malaguetta (2 pessoas)', array[
          'Filé de frango',
          'Molho vermelho',
          'Pimenta malaguetta',
          'Arroz branco',
          'Purê',
          'Salada'
        ]::text[]),
        ('FILÉS DE FRANGO', categoria_frango_id, 'Frango à Canadense (2 pessoas)', array[
          'Filé de frango',
          'Queijo muçarela',
          'Creme de milho',
          'Arroz à Grega',
          'Batata frita',
          'Salada'
        ]::text[]),
        ('FILÉS DE FRANGO', categoria_frango_id, 'Frango da Neve (2 pessoas)', array[
          'Filé de frango',
          'Farinha de milho',
          'Queijo muçarela',
          'Molho branco',
          'Batata palha',
          'Arroz branco',
          'Batata frita',
          'Salada'
        ]::text[]),
        ('FILÉS DE FRANGO', categoria_frango_id, 'Supremo de Frango à Califórnia (2 pessoas)', array[
          'Peito de frango',
          'Farinha de milho',
          'Batata frita',
          'Arroz à Grega',
          'Pêssego',
          'Figo',
          'Salada'
        ]::text[]),
        ('FILÉS DE FRANGO', categoria_frango_id, 'Frango à Suíça (2 pessoas)', array[
          'Filé de frango',
          'Farinha de milho',
          'Bacon',
          'Queijo muçarela',
          'Molho vermelho',
          'Arroz à Grega',
          'Batata frita',
          'Salada'
        ]::text[]),
        ('FILÉS DE PEIXE', categoria_peixe_id, 'Salmão ao Molho Escabeche (2 pessoas)', array[
          'Salmão',
          'Tomate',
          'Pimentão vermelho',
          'Cebola',
          'Louro',
          'Purê',
          'Arroz branco',
          'Salada'
        ]::text[]),
        ('FILÉS DE PEIXE', categoria_peixe_id, 'Peixe Escabeche (2 pessoas)', array[
          'Filé de peixe',
          'Farinha de milho',
          'Tomate',
          'Pimentão vermelho',
          'Cebola',
          'Louro',
          'Purê',
          'Arroz branco',
          'Salada'
        ]::text[]),
        ('FILÉS DE PEIXE', categoria_peixe_id, 'Peixe à Baiana (2 pessoas)', array[
          'Filé de peixe',
          'Molho camarão',
          'Purê',
          'Arroz branco',
          'Salada'
        ]::text[]),
        ('FILÉS DE PEIXE', categoria_peixe_id, 'Salmão ao Molho Manjericão (2 pessoas)', array[
          'Salmão',
          'Molho de tomate',
          'Manjericão',
          'Arroz branco',
          'Purê',
          'Salada'
        ]::text[]),
        ('FILÉS DE PEIXE', categoria_peixe_id, 'Peixe à Malaguetta (2 pessoas)', array[
          'Filé de peixe',
          'Farinha de milho',
          'Molho de tomate',
          'Pimentão vermelho',
          'Pimentão verde',
          'Pimenta malaguetta',
          'Purê',
          'Arroz branco',
          'Salada'
        ]::text[]),
        ('FILÉS DE PEIXE', categoria_peixe_id, 'Salmão ao Molho de Laranja (2 pessoas)', array[
          'Salmão',
          'Laranja',
          'Alcaparra',
          'Arroz branco',
          'Purê',
          'Salada'
        ]::text[]),
        ('FILÉS DE PEIXE', categoria_peixe_id, 'Peixe da Neve (2 pessoas)', array[
          'Filé de peixe',
          'Queijo muçarela',
          'Molho branco',
          'Arroz branco',
          'Purê',
          'Salada'
        ]::text[])
    ) as receitas(aba, categoria_id, prato_nome, ingredientes)
  loop
    select id into prato_uuid
    from public.pratos
    where lower(btrim(nome)) = lower(btrim(receita.prato_nome))
    limit 1;

    if prato_uuid is null then
      insert into public.pratos (
        nome,
        categoria_id,
        descricao,
        rendimento,
        observacoes,
        ativo
      )
      values (
        receita.prato_nome,
        receita.categoria_id,
        'Importado da aba ' || receita.aba || ' da planilha Restaurante Malaguetta.',
        1,
        null,
        true
      )
      returning id into prato_uuid;
    else
      update public.pratos
      set nome = receita.prato_nome,
          categoria_id = receita.categoria_id,
          ativo = true
      where id = prato_uuid;
    end if;

    ingrediente_ordem := 0;
    foreach ingrediente_nome in array receita.ingredientes
    loop
      ingrediente_ordem := ingrediente_ordem + 1;

      select id into ingrediente_uuid
      from public.ingredientes
      where lower(btrim(nome)) = lower(btrim(ingrediente_nome))
      limit 1;

      if ingrediente_uuid is null then
        insert into public.ingredientes (
          nome,
          unidade_compra,
          quantidade_embalagem,
          preco_embalagem,
          unidade_base,
          observacoes,
          ativo
        )
        values (
          ingrediente_nome,
          'kg',
          1,
          0,
          'g',
          'Criado automaticamente para preservar a estrutura da planilha. Revisar unidade, embalagem e preço.',
          true
        )
        returning id into ingrediente_uuid;
      else
        update public.ingredientes
        set nome = ingrediente_nome,
            ativo = true
        where id = ingrediente_uuid;
      end if;

      if not exists (
        select 1
        from public.itens_ficha_tecnica
        where prato_id = prato_uuid
          and ingrediente_id = ingrediente_uuid
      ) then
        insert into public.itens_ficha_tecnica (
          prato_id,
          ingrediente_id,
          quantidade,
          unidade_base,
          quantidade_utilizada,
          unidade_utilizada,
          observacao,
          ordem
        )
        values (
          prato_uuid,
          ingrediente_uuid,
          0,
          'g',
          0,
          'g',
          'Importado da planilha sem quantidade preenchida.',
          ingrediente_ordem
        );
      else
        update public.itens_ficha_tecnica
        set ordem = ingrediente_ordem
        where prato_id = prato_uuid
          and ingrediente_id = ingrediente_uuid;
      end if;
    end loop;
  end loop;
end;
$$;
