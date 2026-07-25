-- Dados ficticios para demonstracao visual do funcionamento das fichas tecnicas.
-- Pode ser ajustado ou removido depois que os valores reais forem lancados.

update public.ingredientes
set quantidade_embalagem = case unidade_compra
    when 'kg' then 1
    when 'g' then 1000
    when 'l' then 1
    when 'ml' then 1000
    else 1
  end,
  preco_embalagem = case lower(btrim(nome))
    when 'filé bovino' then 42.00
    when 'filé de frango' then 18.00
    when 'peito de frango' then 16.00
    when 'filé de peixe' then 28.00
    when 'filé de tilápia' then 32.00
    when 'salmão' then 75.00
    when 'camarão' then 68.00
    when 'bacon' then 36.00
    when 'presunto' then 24.00
    when 'queijo muçarela' then 34.00
    when 'molho vermelho' then 9.00
    when 'molho de tomate' then 8.00
    when 'molho branco' then 12.00
    when 'molho camarão' then 22.00
    when 'creme de milho' then 11.00
    when 'arroz branco' then 6.00
    when 'arroz à grega' then 8.50
    when 'batata frita' then 12.00
    when 'batata palha' then 18.00
    when 'purê' then 10.00
    when 'salada' then 7.00
    when 'tomate' then 8.00
    when 'cebola' then 5.00
    when 'alho' then 18.00
    when 'pimentão vermelho' then 12.00
    when 'pimentão verde' then 10.00
    when 'pimenta malaguetta' then 25.00
    when 'farinha de milho' then 7.00
    when 'farinha de trigo' then 6.00
    when 'margarina' then 14.00
    when 'leite' then 5.50
    when 'milho' then 9.00
    when 'uva passa' then 22.00
    when 'pêssego' then 18.00
    when 'figo' then 24.00
    when 'laranja' then 6.00
    when 'alcaparra' then 45.00
    when 'manjericão' then 30.00
    when 'louro' then 40.00
    else
      case unidade_compra
        when 'kg' then 10.00
        when 'g' then 10.00
        when 'l' then 8.00
        when 'ml' then 8.00
        else 2.00
      end
  end,
  observacoes = concat_ws(
    ' ',
    nullif(observacoes, ''),
    '[DEMO] Valor ficticio para visualizacao do sistema.'
  )
where preco_embalagem = 0
   or preco_embalagem is null;

with itens_para_demo as (
  select
    i.id,
    i.ordem,
    ing.unidade_base,
    lower(btrim(ing.nome)) as ingrediente_nome
  from public.itens_ficha_tecnica i
  join public.ingredientes ing on ing.id = i.ingrediente_id
  where coalesce(i.quantidade, 0) = 0
)
update public.itens_ficha_tecnica item
set quantidade = case
    when demo.unidade_base = 'unidade' then
      case
        when demo.ingrediente_nome like '%ovo%' then 2
        else 1
      end
    when demo.unidade_base = 'ml' then
      case
        when demo.ingrediente_nome like '%molho%' then 150
        when demo.ingrediente_nome like '%leite%' then 200
        else 100
      end
    else
      case
        when demo.ingrediente_nome like '%filé bovino%' then 250
        when demo.ingrediente_nome like '%filé de frango%' then 250
        when demo.ingrediente_nome like '%peito de frango%' then 250
        when demo.ingrediente_nome like '%filé de peixe%' then 250
        when demo.ingrediente_nome like '%salmão%' then 250
        when demo.ingrediente_nome like '%camarão%' then 180
        when demo.ingrediente_nome like '%queijo%' then 120
        when demo.ingrediente_nome like '%presunto%' then 80
        when demo.ingrediente_nome like '%bacon%' then 70
        when demo.ingrediente_nome like '%arroz%' then 180
        when demo.ingrediente_nome like '%batata%' then 200
        when demo.ingrediente_nome like '%salada%' then 120
        when demo.ingrediente_nome like '%tomate%' then 80
        when demo.ingrediente_nome like '%cebola%' then 50
        when demo.ingrediente_nome like '%pimentão%' then 40
        when demo.ingrediente_nome like '%farinha%' then 60
        else 50 + ((demo.ordem % 5) * 25)
      end
  end,
  observacao = concat_ws(
    ' ',
    nullif(item.observacao, ''),
    '[DEMO] Quantidade ficticia para visualizacao do custo.'
  )
from itens_para_demo demo
where item.id = demo.id;

update public.pratos p
set updated_at = now()
where exists (
  select 1
  from public.itens_ficha_tecnica i
  where i.prato_id = p.id
);
