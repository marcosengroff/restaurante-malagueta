# SDD - Software Design Document

## 1. Visao Geral da Arquitetura

### Objetivo tecnico do sistema

O Restaurante Malaguetta e uma aplicacao web administrativa para substituir gradualmente a planilha operacional do restaurante. A implementacao atual concentra-se em autenticacao, painel, ingredientes, categorias, pratos, fichas tecnicas por prato, calculo de custos e importacao de planilhas Excel.

O sistema foi desenhado para manter a regra de custo no banco sempre que possivel: ingredientes possuem custo por unidade-base calculado por trigger, itens de ficha tecnica calculam custo a partir do ingrediente, e pratos recebem o custo total recalculado automaticamente.

### Tecnologias utilizadas

- React 19.
- TypeScript.
- Vite 8.
- Tailwind CSS 4.
- React Router 7.
- Supabase JS 2.
- Supabase Auth.
- Supabase PostgreSQL com RLS.
- Supabase Edge Functions.
- React Hook Form.
- Zod.
- Lucide React.
- XLSX.
- Oxlint.
- Vercel para hospedagem do front-end.

### Arquitetura geral

A arquitetura e uma SPA React hospedavel em Vercel, consumindo Supabase diretamente pelo client anonimo configurado em `src/lib/supabase.ts`.

Camadas principais:

- `pages`: telas de rota e orquestracao de estado local.
- `components`: UI reutilizavel, formularios, listas e blocos de dashboard/importacao.
- `layouts`: estrutura administrativa principal.
- `routes`: configuracao do React Router e protecao de rotas.
- `services`: camada de acesso ao Supabase e regras de persistencia.
- `types`: contratos TypeScript usados no front-end.
- `utils`: validacoes Zod, formatadores e regras pequenas.
- `lib/importacao`: parser e normalizacao da planilha Excel.
- `supabase/migrations`: schema versionado do banco.
- `supabase/functions`: backend serverless para operacoes administrativas com `service_role`.

Nao existem contexts React no projeto atual. O gerenciamento de estado e feito com `useState`, `useEffect`, `useMemo` e `useCallback` dentro das paginas e componentes.

## 2. Estrutura do Projeto

```text
restaurante-malagueta/
  docs/
  public/
  src/
    assets/
    components/
      dashboard/
      importacao/
      recipes/
    hooks/
    layouts/
    lib/
      importacao/
    pages/
    routes/
    services/
    types/
    utils/
  supabase/
    functions/
      admin-users/
    migrations/
```

Responsabilidades:

- `docs`: documentacao do produto, regras, design system, roadmap e este SDD.
- `public`: imagens, logos, favicon e assets publicos usados no login/layout.
- `src/assets`: assets empacotados pelo Vite.
- `src/components`: componentes compartilhados e formularios.
- `src/components/dashboard`: blocos do painel, indicadores, busca e acoes rapidas.
- `src/components/importacao`: UI do fluxo de upload, diagnosticos, resumo, problemas e previa.
- `src/components/recipes`: componentes auxiliares para listas/status/acoes de fichas.
- `src/hooks`: hooks reutilizaveis; atualmente contem `useAdminStatus`.
- `src/layouts`: `MainLayout`, com menu lateral, barra mobile, navegacao inferior mobile, conteudo e rodape.
- `src/lib`: cliente Supabase tipado e bibliotecas internas.
- `src/lib/importacao`: parser `MalaguettaExcelParser` e normalizadores.
- `src/pages`: paginas acessadas por rota.
- `src/routes`: definicao de rotas e itens de navegacao.
- `src/services`: comunicacao com Supabase, Edge Functions e regras de persistencia.
- `src/types`: tipos de dominio e tipo `Database`.
- `src/utils`: schemas Zod, formatadores monetarios/data/numero e regras de unidade.
- `supabase/functions`: Edge Function `admin-users`.
- `supabase/migrations`: evolucao versionada do banco.

## 3. Arquitetura Front-end

### Componentes

Os componentes seguem uma separacao pragmatica:

- Componentes de layout e protecao: `MainLayout`, `ProtectedRoute`, `AdminRoute`.
- Componentes de formulario: `IngredienteForm`, `PratoForm`, `FichaTecnicaItemForm`, `CategoriaIngredienteForm`, `CategoriaPratoForm`.
- Componentes de pagina: `PageHeader`.
- Dashboard: `DashboardHeader`, `DashboardStats`, `DashboardSearch`, `QuickActions`, `DashboardFooter`, `DashboardCards`.
- Importacao: `FileDropzone`, `ImportDiagnostics`, `ImportSummary`, `PreviewTable`, `ProblemsList`.
- Recipes: `RecipeList`, `RecipeListItem`, `RecipeStatusBadge`, `RecipeActionsMenu`.

### Layout

`MainLayout` e o layout administrativo usado por todas as rotas protegidas. Ele possui:

- menu lateral fixo no desktop;
- menu lateral recolhivel no mobile;
- barra superior mobile com titulo contextual;
- navegacao inferior mobile para acessos principais;
- carregamento dinamico das categorias de pratos no menu via `listCategoriasPratosMenu`;
- link de `Configuracoes` exibido apenas quando `useAdminStatus` retorna `isAdmin`;
- botao `Sair`, que chama `signOut` e redireciona para `/login`.

### Navegacao

As rotas sao definidas em `src/routes/router.tsx`:

- `/` redireciona para `/painel`.
- `/login` renderiza `LoginPage`.
- Rotas administrativas passam por `ProtectedRoute`.
- Dentro de `MainLayout` existem `/painel`, `/ingredientes`, `/categorias`, `/pratos`, `/pratos/:id/ficha-tecnica`, `/fichas-tecnicas` e `/importacao`.
- `/configuracoes` passa tambem por `AdminRoute`.

`ProtectedRoute` usa `getCurrentSession` para permitir ou redirecionar usuarios anonimos para `/login`. `AdminRoute` usa `useAdminStatus` e redireciona nao administradores para `/painel`.

### Gerenciamento de estado

Nao ha store global nem contextos. O estado e local:

- paginas usam `useState` para filtros, carregamento, mensagens, formularios abertos e entidades em edicao;
- `useEffect` carrega dados iniciais;
- `useMemo` calcula listas filtradas/agrupadas;
- `useCallback` estabiliza funcoes de recarregamento.

Exemplos reais:

- `IngredientesPage` agrupa ingredientes por categoria com `useMemo`.
- `PainelPage` carrega `getDashboardData` no mount.
- `ConfiguracoesPage` carrega usuario atual e usuarios administrativos via Edge Function.
- `MainLayout` busca categorias de pratos para montar a navegacao lateral.

### Hooks

- `useAdminStatus`: chama `isCurrentUserAdmin`, controla `isAdmin` e `isLoadingAdmin`, e evita setState apos unmount com flag `isMounted`.

## 4. Arquitetura Back-end

### Supabase

O Supabase e usado como backend principal:

- Auth para login, cadastro, sessao, logout e reset de senha.
- PostgreSQL para entidades de dominio.
- RPCs para verificacao administrativa e registro de importacao.
- Edge Function para operacoes administrativas de usuarios.

O cliente e criado em `src/lib/supabase.ts` com:

- `VITE_SUPABASE_URL`;
- `VITE_SUPABASE_ANON_KEY`;
- normalizacao da URL quando termina com `/rest/v1`.

### Edge Functions

Existe uma Edge Function em `supabase/functions/admin-users/index.ts`.

Ela aceita `POST` com:

- `{ action: 'list' }`: lista ate 200 usuarios do Supabase Auth.
- `{ action: 'delete', userId }`: exclui usuario pelo Admin API.

Seguranca da funcao:

- le `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` do ambiente da funcao;
- exige header `Authorization`;
- cria um client com anon key e JWT do usuario;
- chama RPC `is_admin`;
- somente apos confirmar admin cria client com `service_role`.

### Storage

Nao ha uso implementado de Supabase Storage no codigo atual. A importacao le arquivos Excel no navegador e grava dados no banco, mas nao armazena o arquivo original em bucket.

### Autenticacao

`authService.ts` encapsula:

- `getCurrentSession`;
- `getCurrentUser`;
- `signInWithPassword`;
- `signUpWithPassword`;
- `sendPasswordResetEmail`;
- `signOut`.

### Banco

O banco e definido por migrations SQL. As principais responsabilidades no banco sao:

- unicidade por nome normalizado;
- geracao de codigos amigaveis para categorias e pratos;
- calculo de custo por unidade-base;
- calculo de custo de item de ficha;
- recalculo do custo total do prato;
- RLS para usuarios autenticados;
- perfis administrativos.

## 5. Banco de Dados

### Tabelas

#### `categorias_ingredientes`

Principais colunas:

- `id`;
- `codigo`;
- `nome`;
- `ordem_exibicao`;
- `ativo`;
- `created_at`;
- `updated_at`.

Regras:

- nome obrigatorio e nao vazio;
- indice unico por nome normalizado;
- codigo gerado por trigger;
- RLS habilitado.

#### `ingredientes`

Principais colunas:

- `id`;
- `nome`;
- `categoria_id`;
- `unidade_compra`;
- `quantidade_embalagem`;
- `preco_embalagem`;
- `unidade_base`;
- `custo_unidade_base`;
- `observacoes`;
- `ativo`;
- `created_at`;
- `updated_at`.

Relacionamento:

- `categoria_id` referencia `categorias_ingredientes(id)` com `on delete set null`.

Regras:

- unidades permitidas: `kg`, `g`, `l`, `ml`, `unidade`;
- unidades-base permitidas: `g`, `ml`, `unidade`;
- quantidade da embalagem maior que zero;
- preco nao negativo;
- custo por unidade-base calculado por trigger `calcular_custo_unidade_base`.

#### `categorias_pratos`

Principais colunas:

- `id`;
- `codigo`;
- `nome`;
- `ordem_exibicao`;
- `ativo`;
- `created_at`;
- `updated_at`.

Regras:

- nome obrigatorio;
- codigo gerado por trigger;
- ordenacao por `ordem_exibicao` e `nome`.

#### `pratos`

Principais colunas:

- `id`;
- `codigo`;
- `nome`;
- `categoria_id`;
- `descricao`;
- `rendimento`;
- `peso_final`;
- `tempo_preparo`;
- `observacoes`;
- `custo_total`;
- `ativo`;
- `created_at`;
- `updated_at`.

Relacionamento:

- `categoria_id` referencia `categorias_pratos(id)` com `on delete restrict`.

Regras:

- codigo automatico no formato `PRT0001`;
- nome unico por normalizacao;
- rendimento maior que zero;
- peso final e tempo de preparo, quando informados, devem ser positivos;
- `custo_total` e recalculado a partir dos itens.

#### `itens_ficha_tecnica`

Principais colunas:

- `id`;
- `prato_id`;
- `ingrediente_id`;
- `quantidade`;
- `unidade_base`;
- `observacao`;
- `ordem`;
- `quantidade_utilizada`;
- `unidade_utilizada`;
- `custo_calculado`;
- `created_at`;
- `updated_at`.

Relacionamentos:

- `prato_id` referencia `pratos(id)` com `on delete cascade`.
- `ingrediente_id` referencia `ingredientes(id)` com `on delete restrict`.

Regras:

- combinacao `prato_id + ingrediente_id` e unica;
- `quantidade` e `quantidade_utilizada` podem ser zero para suportar importacao em rascunho;
- trigger define unidade-base conforme ingrediente;
- trigger calcula `custo_calculado`;
- trigger recalcula `pratos.custo_total`.

#### `importacoes`

Principais colunas:

- `id`;
- `nome_arquivo`;
- `hash_arquivo`;
- `tamanho_arquivo`;
- `status`;
- `resumo`;
- `erros`;
- `usuario_id`;
- `created_at`;
- `finalizada_em`.

Relacionamento:

- `usuario_id` referencia `auth.users(id)` com `on delete set null`.

Regras:

- RLS por usuario autenticado dono da importacao;
- RPC `registrar_importacao_planilha` cria registro concluido associado a `auth.uid()`.

#### `perfis_usuarios`

Principais colunas:

- `id`;
- `user_id`;
- `email`;
- `role`;
- `created_at`;
- `updated_at`.

Regras:

- `role` aceita `admin` ou `usuario`;
- `user_id` referencia `auth.users(id)`;
- RPC `is_admin` verifica role por `user_id` ou e-mail do JWT;
- RLS permite usuario ver o proprio perfil e admin gerenciar perfis.

### Relacionamentos principais

- Uma categoria de ingrediente possui muitos ingredientes.
- Um ingrediente pode estar em muitos itens de ficha tecnica.
- Uma categoria de prato possui muitos pratos.
- Um prato possui muitos itens de ficha tecnica.
- Uma ficha tecnica e representada pelos itens vinculados ao prato.
- Uma importacao pertence ao usuario autenticado que confirmou a importacao.
- Um perfil administrativo pode estar vinculado a um usuario Auth por `user_id` ou por e-mail.

## 6. Fluxos do Sistema

### Login

`LoginPage` usa `signInWithPassword` para autenticar com e-mail e senha. Apos sucesso, navega para a rota protegida. Tambem existe cadastro via `signUpWithPassword` e reset de senha por e-mail.

`ProtectedRoute` impede acesso anonimo as rotas administrativas.

### Cadastro

O cadastro de conta e feito pelo Supabase Auth via `signUpWithPassword`. O projeto atual nao possui tela administrativa para criar usuarios manualmente; a tela de configuracoes lista/remova usuarios via Edge Function quando disponivel e permite envio de reset por e-mail.

### Estoque

Nao existe modulo de estoque implementado. O sistema controla ingredientes e custos, mas nao registra entradas, baixas ou saldo de estoque.

### Ingredientes

Fluxo atual:

- usuario acessa `/ingredientes`;
- pagina carrega categorias ativas e ingredientes;
- busca por nome e filtro por status;
- listagem inicial agrupada por categoria;
- ao selecionar categoria, ingredientes sao exibidos em tabela no desktop e cartoes no mobile;
- `IngredienteForm` cria ou edita;
- desativacao/reativacao altera `ativo`;
- ao desativar, a pagina consulta vinculos em `itens_ficha_tecnica`.

Persistencia:

- `saveIngrediente` normaliza nome, valida duplicidade no front, define `unidade_base` via `getUnidadeBase` e grava em `ingredientes`.

### Ficha Tecnica

Fluxo atual:

- usuario acessa `/pratos/:id/ficha-tecnica`;
- `getFichaTecnica` busca prato, categoria e itens;
- `listIngredientesParaFicha` fornece ingredientes ativos;
- `FichaTecnicaItemForm` adiciona/edita item;
- `saveItemFichaTecnica` grava `quantidade`, `ingrediente_id`, unidade-base e observacao;
- `deleteItemFichaTecnica` remove o item;
- banco recalcula custo do item e custo total do prato.

A rota `/fichas-tecnicas` existe, mas atualmente e uma area reservada.

### Pratos

Fluxo atual:

- usuario acessa `/pratos`;
- pode listar com busca, categoria, status, ordenacao e paginacao;
- categorias ativas sao carregadas para formulario/filtros;
- `PratoForm` cria ou edita pratos;
- codigo e gerado pelo banco;
- pratos podem ser desativados/reativados;
- ha acao para abrir ficha tecnica do prato;
- quando `categoria` vem na query string, a pagina pode exibir a visao por aba de planilha com itens e edicao rapida de quantidade.

### Relatorios

Nao existe modulo formal de relatorios. O painel exibe indicadores e listas resumidas:

- total de pratos;
- total de ingredientes;
- fichas completas/incompletas;
- custo medio dos pratos;
- pratos mais caros;
- categorias;
- atualizacoes recentes;
- busca geral.

## 7. Servicos

- `supabaseClient.ts`: reexporta o client Supabase de `src/lib/supabase.ts`.
- `authService.ts`: sessao, usuario atual, login, cadastro, reset de senha e logout.
- `adminService.ts`: RPC `is_admin`, invocacao da Edge Function `admin-users` para listar e excluir usuarios.
- `categoriasIngredientesService.ts`: listagem CRUD paginada, contagem de ingredientes ativos por categoria, salvar categoria e ativar/desativar.
- `categoriasPratosService.ts`: listagem CRUD paginada, contagem de pratos ativos por categoria, salvar categoria, ativar/desativar e listar categorias para menu.
- `ingredientesService.ts`: listar ingredientes, listar categorias ativas, filtros, busca, salvar ingrediente, ativar/desativar e contar vinculos com fichas.
- `pratosService.ts`: listar categorias ativas, listar pratos com filtros, salvar prato, ativar/desativar, listar pratos por aba da planilha e atualizar quantidade de item na visao de aba.
- `fichaTecnicaService.ts`: buscar ficha por prato, listar ingredientes ativos para ficha, salvar item e excluir item.
- `dashboardService.ts`: compoe dados do painel a partir de pratos, ingredientes, categorias e itens.
- `importacaoService.ts`: enriquece previa da importacao, detecta duplicidades/reutilizacoes, valida referencias, confirma importacao e registra RPC.
- `testSupabaseConnection.ts`: utilitario de teste de conexao com Supabase.

## 8. Componentes reutilizaveis

- `PageHeader`: usado em paginas para titulo e descricao.
- `ProtectedRoute`: protege rotas autenticadas.
- `AdminRoute`: protege rotas administrativas.
- `IngredienteForm`: modal/formulario de ingredientes.
- `PratoForm`: modal/formulario de pratos.
- `FichaTecnicaItemForm`: formulario de itens de ficha tecnica.
- `CategoriaIngredienteForm`: formulario de categorias de ingredientes.
- `CategoriaPratoForm`: formulario de categorias de pratos.
- `CategoriasIngredientesTab`: aba CRUD de categorias de ingredientes em `CategoriasPage`.
- `CategoriasPratosTab`: aba CRUD de categorias de pratos em `CategoriasPage`.
- `DashboardStats`: cards de indicadores do painel.
- `DashboardSearch`: busca geral do painel.
- `QuickActions`: atalhos do painel.
- `DashboardFooter`: resumo inferior do painel.
- `FileDropzone`: selecao de arquivo Excel na importacao.
- `ImportDiagnostics`: diagnosticos da previa.
- `ImportSummary`: resumo da importacao.
- `ProblemsList`: lista de avisos/erros da importacao.
- `PreviewTable`: tabela de previa por entidade.
- `RecipeStatusBadge`, `RecipeList`, `RecipeListItem`, `RecipeActionsMenu`: auxiliares para representacao de fichas/receitas.

## 9. Seguranca

### Autenticacao

Toda area administrativa passa por Supabase Auth. `ProtectedRoute` valida sessao antes de renderizar `MainLayout`.

### RLS

RLS esta habilitado para:

- `categorias_ingredientes`;
- `ingredientes`;
- `categorias_pratos`;
- `pratos`;
- `itens_ficha_tecnica`;
- `importacoes`;
- `perfis_usuarios`.

As tabelas operacionais principais possuem policies amplas para usuarios autenticados realizarem select, insert, update e delete. Na pratica da UI, exclusoes fisicas sao evitadas para ingredientes/pratos/categorias, usando `ativo`.

`importacoes` restringe select/insert/update ao usuario dono (`auth.uid() = usuario_id`).

`perfis_usuarios` permite leitura do proprio perfil e permite admins gerenciarem perfis.

### Permissoes

Existe o papel `admin` na tabela `perfis_usuarios`. A funcao `is_admin` retorna booleano e e usada por:

- `useAdminStatus`;
- `AdminRoute`;
- `MainLayout` para mostrar `Configuracoes`;
- Edge Function `admin-users`.

Usuarios sem admin sao redirecionados de `/configuracoes` para `/painel`.

### Papéis dos usuarios

O banco define `role` como `admin` ou `usuario`. A implementacao atual usa explicitamente apenas a checagem de admin para configuracoes e usuarios. Nao ha matriz fina de permissoes por modulo.

## 10. Padroes de Desenvolvimento

### Convencoes utilizadas

- TypeScript em todo o front-end.
- Componentes React funcionais.
- Services assíncronos por dominio.
- Tipos de dominio em `src/types`.
- Schemas Zod em `src/utils/*Validation.ts`.
- Formatadores centralizados em `src/utils/formatters.ts`.
- Nome normalizado via `normalizeNome`.
- Unidades centralizadas em `src/utils/ingredientes.ts`.
- Erros amigaveis tratados nos services.

### Organizacao do codigo

As paginas concentram fluxo de UI e estado local. Os services concentram acesso ao Supabase. Validacoes e tipos ficam fora dos componentes. Regras criticas de custo ficam no banco.

### Tipagem

`src/types/database.ts` define o tipo `Database` usado no client Supabase. Tipos de dominio existem para ingredientes, pratos, categorias, dashboard, ficha tecnica, importacao e navegacao.

Observacao: a tabela `importacoes` existe nas migrations e e usada por `importacaoService.ts`, mas nao aparece em `src/types/database.ts`.

### Validacoes

Schemas existentes:

- `ingredienteSchema`;
- `pratoSchema`;
- `fichaTecnicaItemSchema`;
- `categoriaIngredienteSchema`;
- `categoriaPratoSchema`.

Regras adicionais sao reforcadas pelo banco por constraints e triggers.

## 11. Dependencias externas

Bibliotecas principais:

- `@supabase/supabase-js`: Auth, banco, RPCs e Edge Functions.
- `react`, `react-dom`: UI.
- `react-router-dom`: rotas SPA.
- `react-hook-form`: formularios.
- `zod` e `@hookform/resolvers`: validacao.
- `xlsx`: leitura de planilhas Excel.
- `lucide-react`: icones.
- `tailwindcss` e `@tailwindcss/vite`: CSS utilitario.
- `vite` e `@vitejs/plugin-react`: build/dev server.
- `typescript`: tipagem e build.
- `oxlint`: lint.

APIs e integracoes:

- Supabase Auth.
- Supabase PostgreSQL.
- Supabase RPC.
- Supabase Edge Function `admin-users`.
- Vercel para deploy do front-end.

## 12. Fluxo de Deploy

### GitHub

O repositorio remoto configurado e `origin` em:

```text
https://github.com/marcosengroff/restaurante-malagueta.git
```

O fluxo atual usa Git para versionamento e push para GitHub.

### Vercel

O projeto possui `vercel.json` com rewrite para SPA:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Variaveis necessarias no ambiente:

- `VITE_SUPABASE_URL`;
- `VITE_SUPABASE_ANON_KEY`.

### Supabase

O banco evolui por migrations em `supabase/migrations`. A Edge Function administrativa esta em `supabase/functions/admin-users` e requer variaveis de ambiente no Supabase:

- `SUPABASE_URL`;
- `SUPABASE_ANON_KEY`;
- `SUPABASE_SERVICE_ROLE_KEY`.

O deploy completo depende de:

- migrations aplicadas no Supabase;
- Edge Function publicada quando configuracoes administrativas completas forem usadas;
- variaveis Vercel configuradas;
- build Vite executado com `npm run build`.

## 13. Melhorias Futuras

Pontos tecnicos identificados:

- Atualizar `src/types/database.ts` para incluir a tabela `importacoes`, alinhando tipagem e migrations.
- Corrigir textos com acentuacao quebrada em alguns arquivos `.tsx`, mantendo Portugues do Brasil legivel.
- Consolidar a tela `/fichas-tecnicas`, hoje reservada, com filtros de fichas completas/incompletas.
- Evoluir permissoes alem de `admin` e `usuario`, caso sejam criados perfis como operador e consulta.
- Revisar policies amplas das tabelas operacionais se o sistema passar a ter papeis com permissoes diferentes.
- Avaliar code splitting no Vite, pois o build emitiu aviso de chunk acima de 500 kB.
- Criar modulo real de estoque antes de tratar relatórios de saldo ou baixa teorica.
- Criar modulo de precificacao separado para margem, preco sugerido e lucro.
- Adicionar rastreabilidade de alteracoes de preco e alteracoes sensiveis.
- Considerar Storage para arquivar planilhas importadas, caso seja necessario preservar o arquivo original.

## Diferencas entre o PRD e a implementacao

- O PRD lista "Administracao completa de usuarios via backend seguro" como planejado/parcial. A implementacao atual ja possui Edge Function `admin-users` para listar e excluir usuarios, mas depende de publicacao/configuracao da funcao e ainda nao implementa definicao de papeis pela interface.
- O PRD indica reset administrativo direto como nao implementado. A implementacao atual envia link de redefinicao por e-mail usando Supabase Auth, nao altera senha diretamente.
- A rota `/fichas-tecnicas` existe, mas e apenas uma area reservada; a ficha tecnica funcional esta em `/pratos/:id/ficha-tecnica`.
- Estoque, precificacao e relatorios seguem planejados; o painel possui indicadores, mas nao substitui um modulo formal de relatorios.
- Supabase Storage nao esta implementado, embora a importacao processe arquivos Excel.
- `src/types/database.ts` nao inclui `importacoes`, apesar da tabela existir nas migrations e ser usada em `importacaoService.ts`.
- Alguns textos no codigo apresentam acentuacao quebrada por historico de codificacao; a documentacao do projeto orienta manter a documentacao em Portugues do Brasil legivel.
