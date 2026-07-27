# Roadmap - Restaurante Malaguetta

## Status Geral

O projeto esta em fase de consolidacao da base operacional: ingredientes, categorias, pratos, fichas tecnicas, custos e importacao de planilha. A prioridade e manter fidelidade a logica da planilha antes de expandir para modulos maiores.

## Concluido

- Base React, TypeScript e Vite.
- Configuracao Supabase.
- Autenticacao com Supabase Auth.
- Layout administrativo responsivo.
- Menu lateral com categorias de pratos vindas do banco.
- Painel com indicadores.
- CRUD de categorias de ingredientes.
- CRUD de ingredientes.
- CRUD de categorias de pratos.
- CRUD de pratos.
- Codigo automatico de pratos.
- Ficha tecnica por prato.
- Calculo de custo por item e total da receita.
- Importacao de planilha com analise previa e confirmacao.
- Registro de importacoes.
- Configuracoes basicas de usuario logado e reset de senha por e-mail.
- Design visual padronizado com cards e identidade Malaguetta.

## Em Desenvolvimento

- Refinamento do parser da planilha real.
- Validacao da importacao contra todos os formatos de abas da planilha.
- Ajustes de acentuacao em textos internos.
- Tela geral de fichas tecnicas.
- Administracao de usuarios com backend seguro.

## Proximas Etapas Recomendadas

### 1. Administracao de Usuarios

- Criar Supabase Edge Function para listar usuarios.
- Proteger funcao por regra de administrador.
- Permitir:
  - listar usuarios;
  - desativar/remover usuario;
  - enviar reset de senha;
  - definir papeis.
- Nunca expor `service_role` no frontend.

### 2. Fichas Tecnicas

- Criar tela geral de fichas tecnicas.
- Filtrar fichas completas e incompletas.
- Destacar pratos sem quantidade preenchida.
- Melhorar fluxo de edicao em massa de quantidades.

### 3. Precificacao

- Criar campos ou modulo para:
  - margem desejada;
  - preco sugerido;
  - preco praticado;
  - lucro bruto;
  - percentual de custo.

### 4. Estoque

- Criar modelo de estoque baseado em ingredientes.
- Controlar entrada de compras.
- Controlar baixa teorica por ficha tecnica.
- Gerar saldo estimado.
- Alertar ingredientes abaixo do minimo.

### 5. Relatorios

- Relatorio de custo por prato.
- Relatorio de ingredientes mais caros.
- Relatorio de fichas incompletas.
- Relatorio de alteracoes de preco.
- Exportacao para PDF ou Excel.

### 6. Importacao

- Melhorar rastreabilidade por arquivo importado.
- Permitir comparar nova planilha com dados existentes.
- Adicionar relatorio de divergencias.
- Permitir importacao incremental controlada.

### 7. Permissoes

- Definir perfis:
  - administrador;
  - operador;
  - consulta.
- Restringir operacoes destrutivas.
- Auditar quem alterou dados sensiveis.

## Fora do Roadmap Imediato

Os itens abaixo nao devem ser priorizados antes da consolidacao das fichas tecnicas e custos:

- caixa;
- comandas;
- mesas;
- delivery;
- emissao fiscal;
- financeiro completo;
- vendas/POS.

