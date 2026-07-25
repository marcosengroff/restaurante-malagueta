import { supabase } from './supabaseClient'
import type {
  ImportacaoAcao,
  ImportacaoCategoriaIngrediente,
  ImportacaoCategoriaPrato,
  ImportacaoIngrediente,
  ImportacaoItemFichaTecnica,
  ImportacaoPlano,
  ImportacaoPrato,
  ImportacaoProblema,
  ImportacaoResultado,
} from '../types/importacao'
import { getBaseUnit, normalizeComparable } from '../lib/importacao/normalizacao'

type NamedRecord = {
  id: string
  nome: string
}

type CategoryMap = Map<string, string>

function uniqueByNormalizedName<T extends { nomeNormalizado: string }>(items: T[]) {
  const seen = new Set<string>()

  return items.filter((item) => {
    if (seen.has(item.nomeNormalizado)) {
      return false
    }

    seen.add(item.nomeNormalizado)
    return true
  })
}

function getFriendlyError(message: string) {
  if (message.includes('permission denied') || message.includes('row-level security')) {
    return 'Usuario sem permissao para realizar a importacao.'
  }

  if (message.includes('Failed to fetch')) {
    return 'Falha de conexao com o Supabase.'
  }

  return message
}

function isDuplicateKeyError(message: string) {
  return message.includes('duplicate key value violates unique constraint')
}

async function insertRowsIgnoringDuplicates<T extends Record<string, unknown>>(
  table:
    | 'categorias_ingredientes'
    | 'ingredientes'
    | 'categorias_pratos'
    | 'pratos'
    | 'itens_ficha_tecnica',
  rows: T[],
) {
  const insertClient = supabase as unknown as {
    from: (tableName: string) => {
      insert: (row: Record<string, unknown>) => Promise<{
        error: { message: string } | null
      }>
    }
  }

  for (const row of rows) {
    const { error } = await insertClient.from(table).insert(row)

    if (error && !isDuplicateKeyError(error.message)) {
      throw new Error(getFriendlyError(error.message))
    }
  }
}

function updateAction<T extends { nomeNormalizado: string; acao: ImportacaoAcao; vinculoEncontrado?: string }>(
  registros: T[],
  existentes: Array<{ id: string; nome: string }>,
) {
  const map = new Map(
    existentes.map((registro) => [normalizeComparable(registro.nome), registro.id]),
  )

  return registros.map((registro) => {
    const match = map.get(registro.nomeNormalizado)
    return match
      ? {
          ...registro,
          acao: 'reutilizar' as ImportacaoAcao,
          vinculoEncontrado: match,
        }
      : registro
  })
}

export async function enrichImportacaoPlano(plan: ImportacaoPlano) {
  const [
    categoriasIngredientes,
    ingredientes,
    categoriasPratos,
    pratos,
    importacoes,
  ] = await Promise.all([
    supabase.from('categorias_ingredientes').select('id, nome'),
    supabase.from('ingredientes').select('id, nome'),
    supabase.from('categorias_pratos').select('id, nome'),
    supabase.from('pratos').select('id, nome'),
    supabase
      .from('importacoes')
      .select('id')
      .eq('hash_arquivo', plan.arquivo.hash)
      .limit(1),
  ])

  const responses = [categoriasIngredientes, ingredientes, categoriasPratos, pratos, importacoes]
  const failed = responses.find((response) => response.error)

  if (failed?.error) {
    throw new Error(getFriendlyError(failed.error.message))
  }

  const enriched: ImportacaoPlano = {
    ...plan,
    categoriasIngredientes: updateAction(
      plan.categoriasIngredientes,
      categoriasIngredientes.data ?? [],
    ),
    ingredientes: updateAction(plan.ingredientes, ingredientes.data ?? []),
    categoriasPratos: updateAction(plan.categoriasPratos, categoriasPratos.data ?? []),
    pratos: updateAction(plan.pratos, pratos.data ?? []),
    arquivoJaImportado: (importacoes.data ?? []).length > 0,
  }

  return validateReferences(enriched)
}

function validateReferences(plan: ImportacaoPlano) {
  const problemas: ImportacaoProblema[] = [...plan.problemas]
  const ingredientes = new Set(plan.ingredientes.map((item) => item.nomeNormalizado))
  const pratos = new Set(plan.pratos.map((item) => item.nomeNormalizado))

  plan.fichasTecnicas.forEach((item) => {
    if (!pratos.has(normalizeComparable(item.prato))) {
      problemas.push({
        id: `referencia-prato-${item.id}`,
        tipo: 'referencia',
        entidade: 'fichasTecnicas',
        mensagem: 'Prato da ficha tecnica nao encontrado na previa.',
        aba: item.aba,
        linha: item.linha,
        detalhe: item.prato,
      })
    }

    if (!ingredientes.has(normalizeComparable(item.ingrediente))) {
      problemas.push({
        id: `referencia-ingrediente-${item.id}`,
        tipo: 'referencia',
        entidade: 'fichasTecnicas',
        mensagem: 'Ingrediente da ficha tecnica nao encontrado na previa.',
        aba: item.aba,
        linha: item.linha,
        detalhe: item.ingrediente,
      })
    }

    if (item.unidadeBase !== getBaseUnit(item.unidade)) {
      problemas.push({
        id: `unidade-${item.id}`,
        tipo: 'erro',
        entidade: 'fichasTecnicas',
        mensagem: 'Conversao de unidade incompativel.',
        aba: item.aba,
        linha: item.linha,
      })
    }
  })

  return {
    ...plan,
    problemas,
    resumo: {
      ...plan.resumo,
      avisos: problemas.filter((problem) => problem.tipo === 'aviso').length,
      erros: problemas.filter((problem) => problem.tipo === 'erro').length,
    },
  }
}

export function hasBlockingErrors(plan: ImportacaoPlano) {
  return plan.problemas.some((problem) => problem.tipo === 'erro')
}

export async function confirmarImportacao(
  plan: ImportacaoPlano,
  onProgress: (message: string, current: number, total: number) => void,
): Promise<ImportacaoResultado> {
  const start = performance.now()
  const totalSteps = 6

  if (hasBlockingErrors(plan)) {
    throw new Error('Corrija os erros impeditivos antes de confirmar a importacao.')
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error('Sessao expirada. Entre novamente para importar.')
  }

  onProgress('Importando categorias de ingredientes', 1, totalSteps)
  const categoriasIngredientesMap = await importarCategoriasIngredientes(
    plan.categoriasIngredientes,
  )

  onProgress('Importando ingredientes', 2, totalSteps)
  const ingredientesMap = await importarIngredientes(
    plan.ingredientes,
    categoriasIngredientesMap,
  )

  onProgress('Importando categorias de pratos', 3, totalSteps)
  const categoriasPratosMap = await importarCategoriasPratos(plan.categoriasPratos)

  onProgress('Importando pratos', 4, totalSteps)
  const pratosMap = await importarPratos(plan.pratos, categoriasPratosMap)

  onProgress('Importando fichas tecnicas em rascunho', 5, totalSteps)
  const fichasTecnicasImportadas = await importarFichasTecnicas(
    plan.fichasTecnicas,
    pratosMap,
    ingredientesMap,
  )

  onProgress('Registrando importacao', 6, totalSteps)
  const { error: rpcError } = await supabase.rpc('registrar_importacao_planilha', {
    nome_arquivo: plan.arquivo.nome,
    hash_arquivo: plan.arquivo.hash,
    tamanho_arquivo: plan.arquivo.tamanho,
    resumo: plan.resumo,
    erros: plan.problemas,
  })

  if (rpcError) {
    throw new Error(getFriendlyError(rpcError.message))
  }

  onProgress('Importacao concluida', totalSteps, totalSteps)

  return {
    finalizadaEm: new Date().toISOString(),
    duracaoMs: Math.round(performance.now() - start),
    resumo: {
      categoriasIngredientes: plan.categoriasIngredientes.filter((item) => item.acao === 'criar').length,
      ingredientes: plan.ingredientes.filter((item) => item.acao === 'criar').length,
      categoriasPratos: plan.categoriasPratos.filter((item) => item.acao === 'criar').length,
      pratos: plan.pratos.filter((item) => item.acao === 'criar').length,
      fichasTecnicas: fichasTecnicasImportadas,
      reutilizados:
        plan.categoriasIngredientes.filter((item) => item.acao === 'reutilizar').length +
        plan.ingredientes.filter((item) => item.acao === 'reutilizar').length +
        plan.categoriasPratos.filter((item) => item.acao === 'reutilizar').length +
        plan.pratos.filter((item) => item.acao === 'reutilizar').length,
    },
    avisos: plan.resumo.avisos,
    erros: plan.resumo.erros,
  }
}

async function importarCategoriasIngredientes(
  categorias: ImportacaoCategoriaIngrediente[],
) {
  const existentes = await carregarMapa('categorias_ingredientes')
  const novos = uniqueByNormalizedName(
    categorias.filter(
      (item) => item.acao === 'criar' && !existentes.has(item.nomeNormalizado),
    ),
  )

  if (novos.length > 0) {
    await insertRowsIgnoringDuplicates(
      'categorias_ingredientes',
      novos.map((categoria) => ({
        nome: categoria.nome,
        ativo: true,
      })),
    )
  }

  return carregarMapa('categorias_ingredientes')
}

async function importarIngredientes(
  ingredientes: ImportacaoIngrediente[],
  categoriasMap: CategoryMap,
) {
  const existentes = await carregarMapa('ingredientes')
  const novos = uniqueByNormalizedName(
    ingredientes.filter(
      (item) => item.acao === 'criar' && !existentes.has(item.nomeNormalizado),
    ),
  )

  if (novos.length > 0) {
    await insertRowsIgnoringDuplicates(
      'ingredientes',
      novos.map((ingrediente) => ({
        nome: ingrediente.nome,
        categoria_id: ingrediente.categoria
          ? categoriasMap.get(normalizeComparable(ingrediente.categoria)) ?? null
          : null,
        unidade_compra: ingrediente.unidadeCompra,
        quantidade_embalagem: ingrediente.quantidadeEmbalagem,
        preco_embalagem: ingrediente.precoEmbalagem,
        unidade_base: getBaseUnit(ingrediente.unidadeCompra),
        observacoes: ingrediente.mensagens.join(' '),
        ativo: true,
      })),
    )
  }

  return carregarMapa('ingredientes')
}

async function importarCategoriasPratos(categorias: ImportacaoCategoriaPrato[]) {
  const existentes = await carregarMapa('categorias_pratos')
  const novos = uniqueByNormalizedName(
    categorias.filter(
      (item) => item.acao === 'criar' && !existentes.has(item.nomeNormalizado),
    ),
  )
  const existentesParaAtualizar = categorias.filter((item) =>
    existentes.has(item.nomeNormalizado),
  )

  if (novos.length > 0) {
    await insertRowsIgnoringDuplicates(
      'categorias_pratos',
      novos.map((categoria) => ({
        nome: categoria.nome,
        ordem_exibicao: categoria.ordemExibicao,
        ativo: true,
      })),
    )
  }

  await atualizarNomesCategoriasPratosExistentes(existentesParaAtualizar, existentes)

  return carregarMapa('categorias_pratos')
}

async function atualizarNomesCategoriasPratosExistentes(
  categorias: ImportacaoCategoriaPrato[],
  existentes: CategoryMap,
) {
  await Promise.all(
    uniqueByNormalizedName(categorias).map(async (categoria) => {
      const id = existentes.get(categoria.nomeNormalizado)

      if (!id) {
        return
      }

      const { error } = await supabase
        .from('categorias_pratos')
        .update({
          nome: categoria.nome,
          ordem_exibicao: categoria.ordemExibicao,
        })
        .eq('id', id)

      if (error && !isDuplicateKeyError(error.message)) {
        throw new Error(getFriendlyError(error.message))
      }
    }),
  )
}

async function importarPratos(pratos: ImportacaoPrato[], categoriasMap: CategoryMap) {
  const existentes = await carregarMapa('pratos')
  const novos = uniqueByNormalizedName(
    pratos.filter(
      (item) => item.acao === 'criar' && !existentes.has(item.nomeNormalizado),
    ),
  )

  if (novos.length > 0) {
    const payload = novos
      .map((prato) => {
        const categoriaId = categoriasMap.get(normalizeComparable(prato.categoria))
        if (!categoriaId) {
          return null
        }

        return {
          nome: prato.nome,
          categoria_id: categoriaId,
          descricao: prato.descricao ?? null,
          rendimento: prato.rendimento,
          peso_final: prato.pesoFinal ?? null,
          tempo_preparo: prato.tempoPreparo ?? null,
          observacoes: prato.observacoes ?? null,
          ativo: true,
        }
      })
      .filter((prato): prato is NonNullable<typeof prato> => prato !== null)

    if (payload.length > 0) {
      await insertRowsIgnoringDuplicates('pratos', payload)
    }
  }

  return carregarMapa('pratos')
}

async function importarFichasTecnicas(
  itens: ImportacaoItemFichaTecnica[],
  pratosMap: CategoryMap,
  ingredientesMap: CategoryMap,
) {
  const itensExistentes = await carregarItensFichaTecnicaExistentes()
  const payload = itens
    .map((item) => {
      const pratoId = pratosMap.get(normalizeComparable(item.prato))
      const ingredienteId = ingredientesMap.get(normalizeComparable(item.ingrediente))
      const quantidade = item.quantidadeBase ?? 0
      const unidadeBase = item.unidadeBase ?? getBaseUnit(item.unidade)

      if (
        !pratoId ||
        !ingredienteId ||
        itensExistentes.has(`${pratoId}-${ingredienteId}`)
      ) {
        return null
      }

      return {
        prato_id: pratoId,
        ingrediente_id: ingredienteId,
        quantidade,
        unidade_base: unidadeBase,
        quantidade_utilizada: quantidade,
        unidade_utilizada: unidadeBase,
        observacao: item.observacao ?? null,
        ordem: item.ordem,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  if (payload.length === 0) {
    return 0
  }

  await insertRowsIgnoringDuplicates('itens_ficha_tecnica', payload)

  return payload.length
}

async function carregarItensFichaTecnicaExistentes() {
  const { data, error } = await supabase
    .from('itens_ficha_tecnica')
    .select('prato_id, ingrediente_id')

  if (error) {
    throw new Error(getFriendlyError(error.message))
  }

  return new Set(
    (data ?? []).map((item) => `${item.prato_id}-${item.ingrediente_id}`),
  )
}

async function carregarMapa(
  table: 'categorias_ingredientes' | 'ingredientes' | 'categorias_pratos' | 'pratos',
) {
  const { data, error } = await supabase.from(table).select('id, nome')

  if (error) {
    throw new Error(getFriendlyError(error.message))
  }

  return new Map(
    ((data ?? []) as NamedRecord[]).map((record) => [
      normalizeComparable(record.nome),
      record.id,
    ]),
  )
}
