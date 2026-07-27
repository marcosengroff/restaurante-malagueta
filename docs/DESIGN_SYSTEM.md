# Design System - Restaurante Malaguetta

## 1. Identidade Visual

O sistema usa uma identidade visual inspirada no Restaurante Malaguetta, combinando visual escuro, vermelho institucional e cards claros para leitura operacional.

Paleta principal:

- Preto grafite: `#151515` e tons proximos.
- Vermelho principal: `#C62828`.
- Verde escuro: `#2E7D32`.
- Fundo administrativo: cinza escurecido `#d8dde3`.
- Cards: branco.
- Texto principal: tons de slate.

## 2. Layout Geral

O sistema usa `MainLayout` com:

- menu lateral fixo em desktop;
- menu lateral recolhivel em mobile;
- area central de conteudo;
- fundo geral mais escuro para destacar cards;
- botao `Sair` abaixo dos menus.

O menu lateral mostra:

- marca Malaguetta;
- link para Painel;
- link para Ingredientes;
- categorias de pratos vindas do Supabase;
- link para Configuracoes;
- botao Sair.

## 3. Cards

Cards sao um elemento visual dominante do sistema.

Padrao atual:

- fundo branco;
- borda clara;
- sombra leve;
- detalhe vermelho no canto superior esquerdo via classe `malaguetta-card`;
- fonte interna padronizada para melhor leitura;
- cantos discretamente arredondados.

Uso recomendado:

- indicadores;
- listas resumidas;
- filtros;
- blocos de ficha tecnica;
- secoes de configuracao;
- previews de importacao.

Evitar:

- cards dentro de cards sem necessidade;
- excesso de decoracao;
- fundos com muitas cores competindo com os dados.

## 4. Tipografia

O projeto usa fonte sans-serif do sistema, configurada no `src/index.css`.

Padrao visual:

- titulos de pagina: grandes, com peso semibold.
- subtitulos: texto medio em slate.
- conteudo de cards: tamanho base maior para leitura.
- labels de tabela: uppercase quando necessario.

Observacao:

Alguns arquivos de codigo ainda possuem textos sem acentuacao ou com acentuacao quebrada por historico de codificacao. A documentacao deve ser mantida em Portugues do Brasil legivel.

## 5. Botoes

Botoes principais:

- fundo vermelho `#C62828` ou `red-700`;
- texto branco;
- hover vermelho mais escuro;
- icones Lucide quando aplicavel.

Botoes secundarios:

- borda cinza ou vermelha;
- fundo transparente ou branco;
- hover suave.

Botoes destrutivos:

- no fluxo atual, exclusoes reais sao evitadas;
- preferir desativar/reativar.

## 6. Formularios

Padroes atuais:

- inputs com borda cinza;
- foco em vermelho;
- validacao com mensagens claras;
- formularios em modal para ingredientes, categorias, pratos e itens de ficha tecnica.

Campos monetarios:

- devem usar formato brasileiro.
- exemplo: `R$ 0,00`.

## 7. Responsividade

Desktop:

- menu lateral fixo;
- tabelas para listagens;
- grid de cards.

Mobile:

- menu lateral recolhivel;
- cards substituem ou complementam tabelas;
- botoes devem continuar acessiveis.

## 8. Iconografia

O sistema usa `lucide-react`.

Padroes:

- icone no menu lateral;
- icone em botoes de acao;
- icone em cards de dashboard;
- icone em mensagens e configuracoes.

## 9. Login

A tela de login possui:

- imagem de fundo institucional;
- card de acesso;
- logo de pimenta;
- campos de e-mail e senha;
- lembrar de mim;
- esqueci minha senha;
- botao entrar;
- botao criar conta.

Alteracoes no login devem preservar:

- ausencia de rolagem desnecessaria;
- card visivel dentro da tela;
- boa leitura sobre imagem de fundo;
- identidade vermelha, preta e verde.

