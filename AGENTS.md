# AGENTS.md - Orientacoes para Agentes

## Projeto

Sistema web do Restaurante Malaguetta para controle de ingredientes, pratos, fichas tecnicas, custos e importacao de planilhas.

## Stack

- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- Supabase.
- React Router.
- React Hook Form.
- Zod.
- Lucide React.
- XLSX.

## Comandos

```powershell
npm run dev
npm run lint
npm run build
```

Endereco local padrao:

```text
http://localhost:5173
```

## Estrutura Principal

- `src/pages`: paginas de rotas.
- `src/components`: componentes reutilizaveis.
- `src/components/dashboard`: componentes do painel.
- `src/components/importacao`: componentes do fluxo de importacao.
- `src/components/recipes`: componentes auxiliares de pratos/fichas.
- `src/services`: comunicacao com Supabase e regras de persistencia.
- `src/types`: tipos TypeScript.
- `src/utils`: validacoes, formatadores e utilitarios.
- `src/lib/importacao`: parser e normalizacao da planilha.
- `supabase/migrations`: definicao versionada do banco.
- `docs`: documentacao oficial do projeto.

## Regras de Trabalho

- Antes de alterar codigo, analisar estrutura existente.
- Reutilizar componentes, servicos, tipos e padroes existentes.
- Nao criar funcoes fora do objetivo da planilha sem aprovacao.
- Nao alterar banco sem migration versionada.
- Nao usar `service_role` no frontend.
- Nao gravar chaves diretamente no codigo.
- Preservar RLS do Supabase.
- Rodar `npm run lint` e `npm run build` apos alteracoes de codigo.
- Nao executar `git add`, `git commit` ou `git push` sem pedido explicito do usuario.

## Escopo Atual

Ja existem:

- login e autenticacao;
- painel;
- ingredientes;
- categorias;
- pratos;
- ficha tecnica por prato;
- importacao;
- configuracoes basicas.

Planejado:

- estoque;
- precificacao;
- relatorios;
- administracao completa de usuarios via backend seguro.

Nao implementar sem pedido explicito:

- caixa;
- comandas;
- mesas;
- delivery;
- emissao fiscal;
- financeiro completo;
- vendas/POS.

## Cuidados de Seguranca

- Supabase anon key pode ser usada no frontend.
- Supabase service role nunca deve ser usada no frontend.
- Listar, excluir ou alterar usuarios do Supabase Auth exige backend seguro.
- Operacoes administrativas devem passar por Edge Function ou servidor protegido.

## Padroes Visuais

- Preservar identidade Malaguetta.
- Cards com classe `malaguetta-card`.
- Fundo administrativo escuro/cinza para destacar cards brancos.
- Vermelho principal `#C62828`.
- Verde de apoio `#2E7D32`.
- Menu lateral escuro.
- Usar icones `lucide-react`.

