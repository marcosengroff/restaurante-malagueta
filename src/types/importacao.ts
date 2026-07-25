export type ImportacaoEntidade =
  | 'categoriasIngredientes'
  | 'ingredientes'
  | 'categoriasPratos'
  | 'pratos'
  | 'fichasTecnicas'

export type ImportacaoAcao =
  | 'criar'
  | 'reutilizar'
  | 'atualizar'
  | 'ignorar'
  | 'revisar'
  | 'erro'

export type ImportacaoProblemaTipo =
  | 'erro'
  | 'aviso'
  | 'duplicidade'
  | 'incompleto'
  | 'referencia'

export type ImportacaoProblema = {
  id: string
  tipo: ImportacaoProblemaTipo
  entidade: ImportacaoEntidade
  mensagem: string
  aba?: string
  linha?: number
  detalhe?: string
}

export type ImportacaoRegistroBase = {
  id: string
  aba: string
  linha: number
  original: string
  nome: string
  nomeNormalizado: string
  acao: ImportacaoAcao
  vinculoEncontrado?: string
  mensagens: string[]
}

export type ImportacaoCategoriaIngrediente = ImportacaoRegistroBase

export type ImportacaoIngrediente = ImportacaoRegistroBase & {
  categoria?: string
  unidadeCompra: 'kg' | 'g' | 'l' | 'ml' | 'unidade'
  quantidadeEmbalagem: number
  precoEmbalagem: number
  observacoes?: string
  ativo: boolean
}

export type ImportacaoCategoriaPrato = ImportacaoRegistroBase & {
  ordemExibicao: number
}

export type ImportacaoPrato = ImportacaoRegistroBase & {
  categoria: string
  descricao?: string
  rendimento: number
  pesoFinal?: number
  tempoPreparo?: number
  observacoes?: string
  ativo: boolean
}

export type ImportacaoItemFichaTecnica = ImportacaoRegistroBase & {
  prato: string
  ingrediente: string
  quantidade: number
  unidade: 'kg' | 'g' | 'l' | 'ml' | 'unidade'
  quantidadeBase?: number
  unidadeBase?: 'g' | 'ml' | 'unidade'
  observacao?: string
  ordem: number
}

export type ImportacaoResumo = {
  categoriasIngredientes: number
  ingredientes: number
  categoriasPratos: number
  pratos: number
  itensFichaTecnica: number
  ignorados: number
  avisos: number
  erros: number
}

export type ImportacaoAbaDiagnostico = {
  nome: string
  nomeNormalizado: string
  tipoDetectado: string
  range: string
  linhas: number
  colunas: number
  celulasPreenchidas: number
  formulas: number
  mesclagens: number
  primeirasLinhasMatriz: unknown[][]
  primeirasLinhasJson: Record<string, unknown>[]
  cabecalhosCandidatos: string[][]
  blocosDetectados: Array<{
    titulo: string
    linha: number
    coluna: number
    endereco: string
    itens: number
  }>
  grade: Array<{
    endereco: string
    linha: number
    coluna: number
    valor: unknown
    formula?: string
    merge: boolean
    tipoDetectado: string
  }>
  linhasDescartadasTotal: number
  linhasDescartadas: Array<{
    linha: number
    motivo: string
    valores: unknown[]
  }>
}

export type ImportacaoDiagnostico = {
  arquivo: {
    nome: string
    tamanho: number
  }
  abas: ImportacaoAbaDiagnostico[]
  totais: {
    linhas: number
    colunas: number
    celulasPreenchidas: number
    formulas: number
    mesclagens: number
    linhasDescartadas: number
  }
}

export type ImportacaoPlano = {
  arquivo: {
    nome: string
    tamanho: number
    hash: string
    selecionadoEm: string
  }
  resumo: ImportacaoResumo
  categoriasIngredientes: ImportacaoCategoriaIngrediente[]
  ingredientes: ImportacaoIngrediente[]
  categoriasPratos: ImportacaoCategoriaPrato[]
  pratos: ImportacaoPrato[]
  fichasTecnicas: ImportacaoItemFichaTecnica[]
  problemas: ImportacaoProblema[]
  arquivoJaImportado: boolean
  diagnostico?: ImportacaoDiagnostico
}

export type ImportacaoResultado = {
  finalizadaEm: string
  duracaoMs: number
  resumo: Record<string, number>
  avisos: number
  erros: number
}
