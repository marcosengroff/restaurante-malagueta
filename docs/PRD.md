# PRD - Sistema Restaurante Malaguetta

## 1. Visao Geral

O sistema Restaurante Malaguetta e uma aplicacao web para substituir gradualmente a planilha operacional usada no controle de ingredientes, pratos, fichas tecnicas e custos. O produto tem como objetivo central permitir que o restaurante saiba o custo real de cada prato a partir dos insumos cadastrados, das quantidades utilizadas e dos precos de compra.

O sistema foi iniciado com React, TypeScript, Vite, Tailwind CSS e Supabase. A aplicacao possui autenticacao, rotas protegidas, layout administrativo, CRUDs principais e integracao com banco Supabase.

## 2. Objetivos do Produto

- Controlar ingredientes e seus custos de compra.
- Organizar ingredientes por categorias.
- Controlar categorias de pratos equivalentes as abas da planilha.
- Cadastrar pratos com codigo automatico.
- Montar fichas tecnicas por prato.
- Calcular o custo da receita a partir dos ingredientes.
- Importar dados da planilha Excel do restaurante.
- Preparar base para controle de estoque, precificacao e relatorios.
- Controlar acesso por autenticacao de usuarios.

## 3. Publico-Alvo

- Proprietario ou gestor do Restaurante Malaguetta.
- Equipe administrativa responsavel por custos e cardapio.
- Pessoas responsaveis por atualizar ingredientes, fichas tecnicas e precos.

## 4. Tecnologias

- React 19.
- TypeScript.
- Vite.
- Tailwind CSS.
- Supabase JS.
- React Router.
- React Hook Form.
- Zod.
- Lucide React.
- XLSX para leitura de planilhas.
- Supabase Auth e banco PostgreSQL com RLS.

## 5. Modulos Ja Implementados

### Autenticacao

- Tela de login personalizada.
- Criacao de conta via Supabase Auth.
- Login com e-mail e senha.
- Logout.
- Rotas protegidas.
- Saudacao no painel usando o primeiro nome do usuario logado.
- Reset de senha por e-mail na tela de Configuracoes.

### Painel

- Cards com indicadores principais:
  - pratos cadastrados;
  - ingredientes;
  - fichas completas;
  - fichas incompletas;
  - custo medio dos pratos;
  - ultima atualizacao.
- Busca geral por prato, ingrediente ou categoria.
- Acoes rapidas para ingredientes, pratos, ficha tecnica e importacao.

### Ingredientes

- Listagem agrupada por categoria.
- Cadastro e edicao de ingredientes.
- Ativacao, desativacao e reativacao.
- Busca por nome.
- Filtro por status.
- Categoria de ingrediente.
- Unidade de compra.
- Quantidade da embalagem.
- Preco formatado como moeda brasileira.
- Custo por unidade-base calculado pelo banco.
- Unidade-base derivada da unidade de compra:
  - kg -> g;
  - g -> g;
  - l -> ml;
  - ml -> ml;
  - unidade -> unidade.

### Categorias

- Tela com abas para categorias de ingredientes e categorias de pratos.
- CRUD de categorias.
- Codigo amigavel para categorias.
- Status ativo/inativo.
- Contagem de vinculos.
- Paginacao e filtros.

### Pratos

- Cadastro e edicao de pratos.
- Codigo automatico no formato `PRT0001`.
- Relacionamento com categorias de pratos.
- Listagem geral.
- Visualizacao por categorias vindas da planilha.
- Busca, filtros, ordenacao e paginacao.
- Desativacao e reativacao sem exclusao fisica.
- Acao para abrir ficha tecnica do prato.

### Ficha Tecnica

- Tela por prato em `/pratos/:id/ficha-tecnica`.
- Exibicao de dados do prato.
- Inclusao, edicao e remocao de ingredientes da receita.
- Quantidade por ingrediente.
- Unidade-base automatica.
- Custo unitario vindo do cadastro do ingrediente.
- Custo total do ingrediente calculado automaticamente.
- Total da receita calculado pela soma dos itens.
- Recalculo baseado nos dados atuais do ingrediente.

### Importacao

- Tela de importacao de planilha Excel.
- Upload de arquivo `.xlsx` ou `.xls`.
- Analise previa antes de gravar dados.
- Parser especifico `MalaguettaExcelParser`.
- Diagnosticos, resumo, problemas e tabelas de previa.
- Confirmacao final antes da importacao.
- Registro da importacao na tabela `importacoes`.
- Importacao de categorias, ingredientes, categorias de pratos, pratos e itens de ficha tecnica.

### Configuracoes

- Menu `Configuracoes`.
- Visualizacao do usuario logado.
- Envio de e-mail de redefinicao de senha.
- Aviso tecnico informando que listagem completa, exclusao e administracao de usuarios exigem backend seguro ou Supabase Edge Function com `service_role`.

## 6. Funcionalidades Em Desenvolvimento ou Parciais

- Tela geral de Fichas Tecnicas em `/fichas-tecnicas` ainda e uma area reservada.
- Modulo Configuracoes ainda nao lista todos os usuarios do Auth.
- Exclusao administrativa de usuarios ainda nao foi implementada.
- Reset administrativo direto de senha ainda nao foi implementado; existe envio de link por e-mail.
- Importacao existe, mas deve continuar sendo validada contra a planilha real conforme mudancas de estrutura.
- Existem dados demonstrativos de custos em migration para melhorar visualizacao.

## 7. Funcionalidades Planejadas

- Controle de estoque.
- Precificacao com margem, rendimento e sugestao de venda.
- Relatorios gerenciais.
- Dashboard financeiro de custos.
- Administracao completa de usuarios por backend seguro.
- Permissoes por papel, como administrador e operador.
- Historico de alteracoes de preco.
- Importacao recorrente ou assistida de novas planilhas.

## 8. Fora do Escopo Atual

No estado atual do projeto, nao existem modulos implementados para:

- caixa;
- comandas;
- controle de mesas;
- delivery;
- emissao fiscal;
- financeiro completo;
- vendas;
- estoque completo.

## 9. Requisitos Nao Funcionais

- Interface responsiva para desktop e mobile.
- Uso de RLS no Supabase.
- Proibido uso de `service_role` no frontend.
- Variaveis de ambiente para chaves publicas do Supabase.
- Build compativel com Vercel.
- Codigo organizado por paginas, componentes, servicos, tipos e utilitarios.

