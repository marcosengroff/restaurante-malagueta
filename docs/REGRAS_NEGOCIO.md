# Regras de Negocio - Restaurante Malaguetta

## 1. Ingredientes

- Todo ingrediente deve possuir nome.
- O nome deve ser normalizado antes de salvar, removendo espacos extras.
- Nao deve existir ingrediente duplicado pelo nome normalizado.
- Ingredientes podem ser ativados, desativados e reativados.
- Ingredientes nao devem ser excluidos fisicamente quando estiverem vinculados a fichas tecnicas.
- A remocao na interface deve ser tratada como desativacao.
- Ingredientes podem ou nao estar vinculados a uma categoria.
- As unidades de compra permitidas sao:
  - kg;
  - g;
  - l;
  - ml;
  - unidade.

## 2. Unidade-Base

A unidade-base do ingrediente e determinada pela unidade de compra:

- kg -> g;
- g -> g;
- l -> ml;
- ml -> ml;
- unidade -> unidade.

## 3. Custo do Ingrediente

- O usuario informa quantidade da embalagem e preco.
- O preco e exibido no formato brasileiro.
- O custo por unidade-base nao deve ser digitado manualmente.
- O banco calcula `custo_unidade_base` por trigger:
  - kg: preco / (quantidade * 1000);
  - g: preco / quantidade;
  - l: preco / (quantidade * 1000);
  - ml: preco / quantidade;
  - unidade: preco / quantidade.
- Quantidade da embalagem deve ser maior que zero.
- Preco da embalagem deve ser maior ou igual a zero.

## 4. Categorias de Ingredientes

- Categoria deve possuir nome.
- Nome de categoria nao pode estar em branco.
- Nome de categoria deve ser unico por normalizacao no banco.
- Categoria pode ser ativada ou desativada.
- Desativar categoria nao deve apagar seus ingredientes.

## 5. Categorias de Pratos

- Categoria de prato deve possuir nome.
- Categoria de prato representa grupos de pratos e tambem abas da planilha importada.
- A ordenacao usa `ordem_exibicao` quando disponivel.
- Categoria pode ser ativada ou desativada.
- Desativar categoria nao deve apagar seus pratos.

## 6. Pratos

- Todo prato deve possuir nome.
- Todo prato deve possuir categoria.
- Nome de prato deve ter no minimo 2 caracteres.
- Nome duplicado nao e permitido.
- O codigo do prato e gerado automaticamente pelo banco.
- O formato do codigo e `PRT0001`, `PRT0002`, etc.
- Codigo nao deve ser reutilizado.
- Pratos podem ser ativados, desativados e reativados.
- Pratos nao devem ser excluidos fisicamente pelo fluxo normal.

## 7. Ficha Tecnica

- Uma ficha tecnica pertence a um prato.
- Cada item da ficha tecnica representa um ingrediente usado no prato.
- Um mesmo ingrediente nao pode ser duplicado na mesma ficha tecnica.
- A quantidade pode ser zero em fichas importadas como rascunho.
- A unidade-base do item deve acompanhar a unidade-base do ingrediente.
- O custo unitario vem sempre do cadastro atual do ingrediente.
- O custo total do item e calculado como quantidade * custo_unidade_base.
- O custo total do prato e a soma dos custos dos itens.
- Ao alterar preco de ingrediente, os custos relacionados devem refletir o novo valor.

## 8. Importacao de Planilha

- A importacao deve passar por analise previa antes de gravar dados.
- Arquivos aceitos: `.xlsx` e `.xls`.
- Tamanho maximo atual: 15 MB.
- O parser deve identificar categorias, ingredientes, pratos e fichas tecnicas.
- Dados devem ser comparados com registros existentes antes de confirmar.
- Referencias nao encontradas devem aparecer como problemas.
- A importacao so deve ocorrer apos confirmacao explicita.
- O registro da importacao deve ser associado ao usuario autenticado.

## 9. Autenticacao e Usuarios

- O sistema exige usuario autenticado para acessar rotas administrativas.
- Login e cadastro usam Supabase Auth.
- Reset de senha por e-mail usa Supabase Auth.
- Operacoes administrativas de listar/excluir todos os usuarios nao podem ser feitas no frontend com `service_role`.
- Administracao completa de usuarios deve ser feita futuramente por backend seguro.

## 10. Estoque, Precificacao e Relatorios

Essas areas fazem parte do objetivo do produto, mas nao estao implementadas como modulos completos no estado atual.

- Estoque planejado: deve controlar entradas, baixas e saldo.
- Precificacao planejada: deve usar custo real, rendimento e margem.
- Relatorios planejados: devem consolidar custos, fichas, ingredientes e pratos.

