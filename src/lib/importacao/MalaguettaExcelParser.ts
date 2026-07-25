import * as XLSX from 'xlsx'
import type {
  ImportacaoAbaDiagnostico,
  ImportacaoAcao,
  ImportacaoDiagnostico,
  ImportacaoPlano,
  ImportacaoProblema,
} from '../../types/importacao'
import {
  convertToBaseQuantity,
  getBaseUnit,
  hashFile,
  normalizeComparable,
  normalizeDisplayName,
  normalizeImportedName,
  normalizeUnit,
  parseNumber,
} from './normalizacao'

type ParsedWorkbook = Omit<
  ImportacaoPlano,
  'arquivo' | 'arquivoJaImportado' | 'resumo'
>

type WorksheetInspection = {
  rows: unknown[][]
  cells: InspectedCell[][]
  jsonRows: Record<string, unknown>[]
  diagnostics: ImportacaoAbaDiagnostico
  headerRows: Array<{
    index: number
    headers: string[]
    kind: string
  }>
}

type InspectedCell = {
  value: unknown
  formula?: string
  fromMerge: boolean
  address: string
  row: number
  col: number
}

type DishBlock = {
  title: string
  row: number
  col: number
  address: string
  width: number
  items: Array<{
    name: string
    quantity: number | null
    unit: 'kg' | 'g' | 'l' | 'ml' | 'unidade' | null
    cost: number | null
    row: number
    col: number
    address: string
    messages: string[]
  }>
}

type IngredientCatalogEntry = {
  nome: string
  unidade: 'kg' | 'g' | 'l' | 'ml' | 'unidade'
  categoria: string
  preco: number | null
}

type RecipeHeader = {
  row: number
  ingredientCol: number
  quantityCol: number | null
  unitCol: number | null
  costCol: number | null
}

function createProblem(
  tipo: ImportacaoProblema['tipo'],
  entidade: ImportacaoProblema['entidade'],
  mensagem: string,
  aba?: string,
  linha?: number,
  detalhe?: string,
): ImportacaoProblema {
  return {
    id: `${tipo}-${entidade}-${aba ?? 'arquivo'}-${linha ?? 0}-${mensagem}`,
    tipo,
    entidade,
    mensagem,
    aba,
    linha,
    detalhe,
  }
}

function makeBase(
  aba: string,
  linha: number,
  nome: string,
  acao: ImportacaoAcao = 'criar',
) {
  return {
    id: `${aba}-${linha}-${normalizeComparable(nome)}`,
    aba,
    linha,
    original: nome,
    nome,
    nomeNormalizado: normalizeComparable(nome),
    acao,
    mensagens: [],
  }
}

export class MalaguettaExcelParser {
  async parse(file: File): Promise<ImportacaoPlano> {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, {
      type: 'array',
      cellFormula: true,
      cellDates: true,
      cellNF: true,
      cellText: true,
    })

    console.group('[Importacao] Diagnostico do arquivo Excel')
    console.info('Arquivo:', file.name)
    console.info('Tamanho:', file.size)
    console.info('Abas encontradas:', workbook.SheetNames)

    if (workbook.SheetNames.length === 0) {
      console.groupEnd()
      throw new Error('A planilha nao possui abas validas.')
    }

    const { parsed, diagnostico } = this.parseWorkbook(workbook, file)
    const hash = await hashFile(file)
    const problemas = this.detectDuplicates(parsed)

    const allProblems = [...parsed.problemas, ...problemas]
    const resumo = {
      categoriasIngredientes: parsed.categoriasIngredientes.length,
      ingredientes: parsed.ingredientes.length,
      categoriasPratos: parsed.categoriasPratos.length,
      pratos: parsed.pratos.length,
      itensFichaTecnica: parsed.fichasTecnicas.length,
      ignorados: diagnostico.totais.linhasDescartadas,
      avisos: allProblems.filter((problem) => problem.tipo === 'aviso').length,
      erros: allProblems.filter((problem) => problem.tipo === 'erro').length,
    }

    console.info('Resultado parcial do parser:', resumo)
    console.groupEnd()

    return {
      arquivo: {
        nome: file.name,
        tamanho: file.size,
        hash,
        selecionadoEm: new Date().toISOString(),
      },
      ...parsed,
      problemas: allProblems,
      resumo,
      arquivoJaImportado: false,
      diagnostico,
    }
  }

  private parseWorkbook(
    workbook: XLSX.WorkBook,
    file: File,
  ): { parsed: ParsedWorkbook; diagnostico: ImportacaoDiagnostico } {
    const result: ParsedWorkbook = {
      categoriasIngredientes: [],
      ingredientes: [],
      categoriasPratos: [],
      pratos: [],
      fichasTecnicas: [],
      problemas: [],
    }
    const abas: ImportacaoAbaDiagnostico[] = []

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName]
      const inspection = this.inspectWorksheet(sheetName, sheet)
      abas.push(inspection.diagnostics)

      console.group(`[Importacao] Aba: ${sheetName}`)
      console.info('Nome normalizado:', inspection.diagnostics.nomeNormalizado)
      console.info('Tipo detectado:', inspection.diagnostics.tipoDetectado)
      console.info('Range:', inspection.diagnostics.range)
      console.info('Linhas:', inspection.diagnostics.linhas)
      console.info('Colunas:', inspection.diagnostics.colunas)
      console.info('Celulas preenchidas:', inspection.diagnostics.celulasPreenchidas)
      console.info('Formulas:', inspection.diagnostics.formulas)
      console.info('Mesclagens:', inspection.diagnostics.mesclagens)
      console.info('Primeiras 20 linhas matriz:', inspection.diagnostics.primeirasLinhasMatriz)
      console.info('Primeiras 20 linhas JSON:', inspection.diagnostics.primeirasLinhasJson)
      console.info('Cabecalhos candidatos:', inspection.diagnostics.cabecalhosCandidatos)
      console.info('Linhas descartadas:', inspection.diagnostics.linhasDescartadas)

      if (inspection.diagnostics.celulasPreenchidas === 0 && inspection.diagnostics.formulas === 0) {
        result.problemas.push(
          createProblem('aviso', 'ingredientes', 'Aba vazia ignorada.', sheetName),
        )
        console.info('Resultado parcial da aba: 0 linhas convertidas em registros.')
        console.groupEnd()
        return
      }

      const sheetKind = normalizeComparable(sheetName)
      const detectedKind = inspection.diagnostics.tipoDetectado

      if (detectedKind === 'ingredientes' || sheetKind === 'ingredientes') {
        this.extractIngredientCatalog(sheetName, inspection, result)
        console.info('Resultado parcial ingredientes:', result.ingredientes.length)
        console.groupEnd()
        return
      }

      if (inspection.diagnostics.celulasPreenchidas > 0) {
        this.extractDishCategorySheet(sheetName, inspection, result)
        inspection.diagnostics.blocosDetectados = this.detectDishBlocks(
          sheetName,
          inspection,
        ).map((block) => ({
          titulo: block.title,
          linha: block.row + 1,
          coluna: block.col + 1,
          endereco: block.address,
          itens: block.items.length,
        }))
        console.info('Resultado parcial pratos:', result.pratos.length)
        console.info('Resultado parcial fichas:', result.fichasTecnicas.length)
        console.groupEnd()
        return
      }

      result.problemas.push(
        createProblem(
          'aviso',
          'ingredientes',
          'Aba sem estrutura reconhecida foi ignorada.',
          sheetName,
        ),
      )
      console.info('Aba descartada: sem cabecalho ou contexto reconhecido.')
      console.groupEnd()
    })

    if (
      result.categoriasIngredientes.length === 0 &&
      result.ingredientes.length === 0 &&
      result.categoriasPratos.length === 0 &&
      result.pratos.length === 0 &&
      result.fichasTecnicas.length === 0
    ) {
      result.problemas.push(
        createProblem(
          'aviso',
          'ingredientes',
          'A planilha foi lida, mas a estrutura ainda nao foi reconhecida.',
        ),
      )
    }

    return {
      parsed: result,
      diagnostico: {
        arquivo: {
          nome: file.name,
          tamanho: file.size,
        },
        abas,
        totais: {
          linhas: abas.reduce((total, aba) => total + aba.linhas, 0),
          colunas: Math.max(0, ...abas.map((aba) => aba.colunas)),
          celulasPreenchidas: abas.reduce(
            (total, aba) => total + aba.celulasPreenchidas,
            0,
          ),
          formulas: abas.reduce((total, aba) => total + aba.formulas, 0),
          mesclagens: abas.reduce((total, aba) => total + aba.mesclagens, 0),
          linhasDescartadas: abas.reduce(
            (total, aba) => total + aba.linhasDescartadasTotal,
            0,
          ),
        },
      },
    }
  }

  private inspectWorksheet(
    sheetName: string,
    worksheet: XLSX.WorkSheet,
  ): WorksheetInspection {
    const filledWorksheet = this.fillMergedCells(worksheet)
    const cells = this.buildCellMatrix(filledWorksheet)
    const rows = XLSX.utils.sheet_to_json<unknown[]>(filledWorksheet, {
      header: 1,
      defval: null,
      raw: false,
      blankrows: true,
    })
    const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      filledWorksheet,
      {
        defval: null,
        raw: false,
        blankrows: true,
      },
    )
    const headerRows = this.findHeaderRows(rows)
    const tipoDetectado = this.detectSheetType(sheetName, headerRows)
    const allDiscardedRows = rows
      .map((row, index) => ({
        linha: index + 1,
        motivo: this.getDiscardReason(row, index, headerRows),
        valores: row,
      }))
      .filter((item) => item.motivo)
    const linhasDescartadas = allDiscardedRows
      .slice(0, 100)
      .map((item) => ({
        linha: item.linha,
        motivo: item.motivo,
        valores: item.valores,
      }))

    return {
      rows,
      cells,
      jsonRows,
      headerRows,
      diagnostics: {
        nome: sheetName,
        nomeNormalizado: normalizeComparable(sheetName),
        tipoDetectado,
        range: worksheet['!ref'] ?? 'sem range',
        linhas: rows.length,
        colunas: rows.reduce((max, row) => Math.max(max, row.length), 0),
        celulasPreenchidas: this.countFilledCells(rows),
        formulas: this.countFormulas(worksheet),
        mesclagens: worksheet['!merges']?.length ?? 0,
        primeirasLinhasMatriz: rows.slice(0, 20),
        primeirasLinhasJson: jsonRows.slice(0, 20),
        cabecalhosCandidatos: headerRows.map((row) => row.headers),
        blocosDetectados: [],
        grade: cells
          .flat()
          .filter((cell) => normalizeDisplayName(cell.value) || cell.formula)
          .slice(0, 300)
          .map((cell) => ({
            endereco: cell.address,
            linha: cell.row + 1,
            coluna: cell.col + 1,
            valor: cell.value,
            formula: cell.formula,
            merge: cell.fromMerge,
            tipoDetectado: this.detectCellRole(cell.value),
          })),
        linhasDescartadasTotal: allDiscardedRows.length,
        linhasDescartadas,
      },
    }
  }

  private fillMergedCells(worksheet: XLSX.WorkSheet) {
    const cloned = { ...worksheet }
    worksheet['!merges']?.forEach((merge) => {
      const sourceAddress = XLSX.utils.encode_cell({
        r: merge.s.r,
        c: merge.s.c,
      })
      const source = worksheet[sourceAddress]
      if (!source) {
        return
      }

      for (let row = merge.s.r; row <= merge.e.r; row += 1) {
        for (let col = merge.s.c; col <= merge.e.c; col += 1) {
          const address = XLSX.utils.encode_cell({ r: row, c: col })
          cloned[address] = cloned[address] ?? source
        }
      }
    })

    return cloned
  }

  private buildCellMatrix(worksheet: XLSX.WorkSheet): InspectedCell[][] {
    const range = worksheet['!ref']
      ? XLSX.utils.decode_range(worksheet['!ref'])
      : { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }
    const mergedAddresses = new Set<string>()

    worksheet['!merges']?.forEach((merge) => {
      for (let row = merge.s.r; row <= merge.e.r; row += 1) {
        for (let col = merge.s.c; col <= merge.e.c; col += 1) {
          if (row !== merge.s.r || col !== merge.s.c) {
            mergedAddresses.add(XLSX.utils.encode_cell({ r: row, c: col }))
          }
        }
      }
    })

    const matrix: InspectedCell[][] = []
    for (let row = range.s.r; row <= range.e.r; row += 1) {
      const cells: InspectedCell[] = []
      for (let col = range.s.c; col <= range.e.c; col += 1) {
        const address = XLSX.utils.encode_cell({ r: row, c: col })
        const cell = worksheet[address] as XLSX.CellObject | undefined
        cells.push({
          value: cell?.w ?? cell?.v ?? null,
          formula: cell?.f,
          fromMerge: mergedAddresses.has(address),
          address,
          row,
          col,
        })
      }
      matrix.push(cells)
    }

    return matrix
  }

  private findHeaderRows(rows: unknown[][]) {
    return rows
      .map((row, index) => {
        const headers = row.map(normalizeDisplayName)
        return {
          index,
          headers,
          kind: this.detectHeaderKind(headers),
        }
      })
      .filter((row) => row.kind !== 'desconhecido')
  }

  private detectHeaderKind(headers: string[]) {
    const normalized = headers.map(normalizeComparable)
    const has = (values: string[]) =>
      values.some((value) => normalized.includes(normalizeComparable(value)))

    if (has(['ingrediente', 'insumo', 'produto']) && has(['unidade', 'und', 'un'])) {
      return 'ingredientes'
    }

    if (has(['prato', 'receita']) && has(['categoria', 'rendimento'])) {
      return 'pratos'
    }

    if (has(['prato', 'receita']) && has(['ingrediente', 'insumo']) && has(['quantidade', 'qtd'])) {
      return 'fichasTecnicas'
    }

    return 'desconhecido'
  }

  private detectSheetType(
    sheetName: string,
    headerRows: Array<{ kind: string }>,
  ) {
    const normalizedSheet = normalizeComparable(sheetName)
    const kinds = headerRows.map((row) => row.kind)

    if (kinds.includes('fichasTecnicas')) {
      return 'fichasTecnicas'
    }

    if (normalizedSheet === 'ingredientes' || kinds.includes('ingredientes')) {
      return 'ingredientes'
    }

    if (kinds.includes('pratos') || normalizedSheet.includes('prato')) {
      return 'categoria_pratos'
    }

    return 'categoria_pratos'
  }

  private getDiscardReason(
    row: unknown[],
    index: number,
    headerRows: Array<{ index: number; kind: string }>,
  ) {
    if (this.isEmptyRow(row)) {
      return 'linha totalmente vazia'
    }

    const header = headerRows.find((candidate) => candidate.index === index)
    if (header) {
      return `linha de cabecalho detectada (${header.kind})`
    }

    const firstDataHeader = headerRows[0]
    if (!firstDataHeader || index < firstDataHeader.index) {
      return 'linha antes do primeiro cabecalho reconhecido'
    }

    return ''
  }

  private isEmptyRow(row: unknown[]) {
    return row.every((cell) => !normalizeDisplayName(cell))
  }

  private countFilledCells(rows: unknown[][]) {
    return rows.reduce(
      (total, row) =>
        total + row.filter((cell) => normalizeDisplayName(cell).length > 0).length,
      0,
    )
  }

  private countFormulas(worksheet: XLSX.WorkSheet) {
    return Object.keys(worksheet).filter((key) => {
      if (key.startsWith('!')) {
        return false
      }
      return Boolean((worksheet[key] as XLSX.CellObject | undefined)?.f)
    }).length
  }

  private detectCellRole(value: unknown) {
    const normalized = normalizeComparable(value)
    if (!normalized) {
      return 'vazio'
    }
    if (normalizeUnit(value)) {
      return 'unidade'
    }
    if (parseNumber(value) !== null) {
      return 'numero'
    }
    if (this.isIgnoredLabel(value)) {
      return 'rotulo_ignorado'
    }
    return 'texto'
  }

  private isIgnoredLabel(value: unknown) {
    const normalized = normalizeComparable(value)
    return [
      'total',
      'custo total',
      'ingredientes',
      'ingrediente',
      'quantidade',
      'qtd',
      'valor',
      'preco',
      'preco',
      'unidade',
      'und',
      'un',
      'custo',
      'rendimento',
    ].includes(normalized)
  }

  private isIgnoredCatalogLabel(value: unknown) {
    const normalized = normalizeComparable(value)
    return [
      'ingredientes',
      'ingrediente',
      'un de medida',
      'preco',
      'restaurante malaguetta ficha tecnica',
    ].includes(normalized)
  }

  private isSpreadsheetTitle(value: unknown) {
    return normalizeComparable(value).includes('restaurante malaguetta')
  }

  private isValidNameCandidate(value: unknown) {
    const text = normalizeDisplayName(value)
    if (text.length < 2) {
      return false
    }
    if (normalizeUnit(text) || parseNumber(text) !== null || this.isIgnoredLabel(text)) {
      return false
    }
    return /[a-zA-ZÀ-ÿ]/.test(text)
  }

  private titleCaseFromSheetName(sheetName: string) {
    return normalizeDisplayName(sheetName)
  }

  private extractIngredientCatalog(
    sheetName: string,
    inspection: WorksheetInspection,
    result: ParsedWorkbook,
  ) {
    let currentCategory = ''

    inspection.rows.forEach((row, index) => {
      if (this.isEmptyRow(row)) {
        return
      }

      const name = normalizeImportedName(row[1])
      const unit = normalizeUnit(row[2])
      const price = parseNumber(row[3])

      if (!name || this.isIgnoredCatalogLabel(name) || this.isSpreadsheetTitle(name)) {
        return
      }

      if (normalizeComparable(row[2]).includes('un de medida')) {
        return
      }

      if (!unit) {
        currentCategory = name
        if (
          !result.categoriasIngredientes.some(
            (category) => category.nomeNormalizado === normalizeComparable(name),
          )
        ) {
          result.categoriasIngredientes.push({
            ...makeBase(sheetName, index + 1, name),
          })
        }
        return
      }

      if (!this.isValidNameCandidate(name)) {
        return
      }

      const messages = ['Quantidade da embalagem nao encontrada; revisar antes de importar.']

      if (price === null) {
        messages.push('Preco vazio importado como zero na simulacao.')
        result.problemas.push(
          createProblem(
            'aviso',
            'ingredientes',
            'Preco vazio no catalogo de ingredientes.',
            sheetName,
            index + 1,
            name,
          ),
        )
      }

      result.problemas.push(
        createProblem(
          'aviso',
          'ingredientes',
          'Quantidade da embalagem nao identificada na planilha.',
          sheetName,
          index + 1,
          name,
        ),
      )

      result.ingredientes.push({
        ...makeBase(sheetName, index + 1, name),
        categoria: currentCategory,
        unidadeCompra: unit,
        quantidadeEmbalagem: 1,
        precoEmbalagem: price ?? 0,
        observacoes: '',
        ativo: true,
        mensagens: messages,
      })
    })
  }

  private extractDishCategorySheet(
    sheetName: string,
    inspection: WorksheetInspection,
    result: ParsedWorkbook,
  ) {
    const categoria = this.titleCaseFromSheetName(sheetName)
    const catalog = this.createIngredientCatalog(result)

    result.categoriasPratos.push({
      ...makeBase(sheetName, 1, categoria),
      ordemExibicao: result.categoriasPratos.length,
    })

    const blocks = this.detectDishBlocks(sheetName, inspection)
    blocks.forEach((block) => {
      result.pratos.push({
        ...makeBase(sheetName, block.row + 1, block.title),
        categoria,
        descricao: '',
        rendimento: 1,
        observacoes: '',
        ativo: true,
      })

      block.items.forEach((item, index) => {
        const catalogEntry = catalog.get(normalizeComparable(item.name))
        const unit = item.unit ?? catalogEntry?.unidade ?? null
        const quantity = item.quantity
        const messages = [...item.messages]

        if (!catalogEntry) {
          result.problemas.push(
            createProblem(
              'referencia',
              'fichasTecnicas',
              'Ingrediente da receita nao encontrado no catalogo.',
              sheetName,
              item.row + 1,
              `${block.title} | ${item.address} | ${item.name}`,
            ),
          )
          messages.push('Ingrediente nao localizado no catalogo da aba INGREDIENTES.')
        }

        if (!quantity || quantity <= 0) {
          result.problemas.push(
            createProblem(
              'incompleto',
              'fichasTecnicas',
              'Quantidade nao preenchida na ficha tecnica.',
              sheetName,
              item.row + 1,
              `${block.title} | ${item.address} | ${item.name}`,
            ),
          )
          messages.push('Quantidade nao encontrada na planilha; revisar antes de importar.')
        }

        if (!unit) {
          result.problemas.push(
            createProblem(
              'incompleto',
              'fichasTecnicas',
              'Unidade nao preenchida e ingrediente sem unidade no catalogo.',
              sheetName,
              item.row + 1,
              `${block.title} | ${item.address} | ${item.name}`,
            ),
          )
          messages.push('Unidade nao encontrada; revisar antes de importar.')
        }

        const finalQuantity = quantity && quantity > 0 ? quantity : 0
        const finalUnit = unit ?? 'unidade'

        result.fichasTecnicas.push({
          ...makeBase(
            sheetName,
            item.row + 1,
            `${block.title} - ${item.name}`,
            messages.length > 0 ? 'revisar' : 'criar',
          ),
          prato: block.title,
          ingrediente: item.name,
          quantidade: finalQuantity,
          unidade: finalUnit,
          quantidadeBase: finalQuantity > 0 ? convertToBaseQuantity(finalQuantity, finalUnit) : 0,
          unidadeBase: getBaseUnit(finalUnit),
          observacao: item.cost !== null ? `Custo calculado na planilha: ${item.cost}` : '',
          ordem: index,
          vinculoEncontrado: catalogEntry?.nome,
          mensagens: messages,
        })
      })
    })
  }

  private createIngredientCatalog(result: ParsedWorkbook) {
    const catalog = new Map<string, IngredientCatalogEntry>()
    result.ingredientes.forEach((ingrediente) => {
      catalog.set(ingrediente.nomeNormalizado, {
        nome: ingrediente.nome,
        unidade: ingrediente.unidadeCompra,
        categoria: ingrediente.categoria ?? '',
        preco: ingrediente.precoEmbalagem,
      })
    })
    return catalog
  }

  private detectDishBlocks(
    sheetName: string,
    inspection: WorksheetInspection,
  ): DishBlock[] {
    const seen = new Set<string>()
    const blocks: DishBlock[] = []

    this.findRecipeHeaders(inspection).forEach((header) => {
      const titleCell = this.findTitleForRecipeHeader(header, inspection)
      if (!titleCell) {
        return
      }

      const title = normalizeImportedName(titleCell.value)
      const key = `${header.row}-${header.ingredientCol}-${normalizeComparable(title)}`
      if (seen.has(key)) {
        return
      }
      seen.add(key)

      const items = this.extractItemsForHeader(header, inspection)
      if (items.length === 0) {
        return
      }

      blocks.push({
        title,
        row: titleCell.row,
        col: titleCell.col,
        address: titleCell.address,
        width: (header.costCol ?? header.ingredientCol + 6) - header.ingredientCol + 1,
        items,
      })
    })

    console.info(`[Importacao] Blocos detectados em ${sheetName}:`, blocks)
    return blocks
  }

  private findRecipeHeaders(inspection: WorksheetInspection): RecipeHeader[] {
    const headers: RecipeHeader[] = []

    inspection.cells.forEach((row, rowIndex) => {
      row.forEach((cell) => {
        if (normalizeComparable(cell.value) !== 'ingredientes') {
          return
        }

        const nearRight = row.slice(cell.col + 1, cell.col + 8)
        const findCol = (labels: string[]) =>
          nearRight.find((candidate) =>
            labels.some((label) => normalizeComparable(candidate.value).includes(label)),
          )?.col ?? null

        const quantityCol = findCol(['qtd utilizada', 'qtd', 'quantidade'])
        const unitCol = findCol(['unidade', 'un'])
        const costCol = findCol(['custo'])

        if (costCol === null) {
          return
        }

        headers.push({
          row: rowIndex,
          ingredientCol: cell.col,
          quantityCol,
          unitCol,
          costCol,
        })
      })
    })

    return headers
  }

  private findTitleForRecipeHeader(
    header: RecipeHeader,
    inspection: WorksheetInspection,
  ) {
    for (let rowIndex = header.row - 1; rowIndex >= Math.max(0, header.row - 4); rowIndex -= 1) {
      const row = inspection.cells[rowIndex] ?? []
      const titleCell = row
        .slice(header.ingredientCol, (header.costCol ?? header.ingredientCol + 6) + 1)
        .find((cell) => this.isValidNameCandidate(cell.value))

      if (titleCell && !this.isIgnoredLabel(titleCell.value)) {
        return titleCell
      }
    }

    return null
  }

  private extractItemsForHeader(header: RecipeHeader, inspection: WorksheetInspection) {
    const items: DishBlock['items'] = []
    const startRow = header.row + 1
    const endRow = Math.min(inspection.cells.length - 1, header.row + 35)
    let blankRows = 0

    for (let rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
      const row = inspection.cells[rowIndex] ?? []
      const nameCell = row[header.ingredientCol]
      const name = normalizeImportedName(nameCell?.value)

      if (!name) {
        blankRows += 1
        if (blankRows >= 3) {
          break
        }
        continue
      }

      blankRows = 0

      if (this.isIgnoredLabel(name) || normalizeComparable(name).includes('restaurante malaguetta')) {
        break
      }

      if (!this.isValidNameCandidate(name)) {
        continue
      }

      const nextRow = inspection.cells[rowIndex + 1] ?? []
      if (normalizeComparable(nextRow[header.ingredientCol]?.value) === 'ingredientes') {
        break
      }

      const quantityCell = header.quantityCol !== null ? row[header.quantityCol] : undefined
      const unitCell = header.unitCol !== null ? row[header.unitCol] : undefined
      const costCell = header.costCol !== null ? row[header.costCol] : undefined
      const quantity = parseNumber(quantityCell?.value)
      const unit = normalizeUnit(unitCell?.value)
      const cost = parseNumber(costCell?.value)
      const messages: string[] = []

      if (!quantity || quantity <= 0) {
        messages.push('Quantidade vazia ou zerada no arquivo original.')
      }

      if (!unit) {
        messages.push('Unidade vazia no arquivo original; sera sugerida pelo catalogo quando existir.')
      }

      if (items.some((item) => normalizeComparable(item.name) === normalizeComparable(name))) {
        continue
      }

      items.push({
        name,
        quantity,
        unit,
        cost,
        row: rowIndex,
        col: header.ingredientCol,
        address: nameCell?.address ?? XLSX.utils.encode_cell({ r: rowIndex, c: header.ingredientCol }),
        messages,
      })
    }

    return items
  }

  private detectDuplicates(parsed: ParsedWorkbook) {
    const problems: ImportacaoProblema[] = []
    const collections: Array<{
      entidade: ImportacaoProblema['entidade']
      registros: Array<{ nomeNormalizado: string; nome: string; aba: string; linha: number }>
    }> = [
      { entidade: 'categoriasIngredientes', registros: parsed.categoriasIngredientes },
      { entidade: 'ingredientes', registros: parsed.ingredientes },
      { entidade: 'categoriasPratos', registros: parsed.categoriasPratos },
      { entidade: 'pratos', registros: parsed.pratos },
    ]

    collections.forEach(({ entidade, registros }) => {
      const seen = new Map<string, typeof registros>()
      registros.forEach((registro) => {
        const current = seen.get(registro.nomeNormalizado) ?? []
        current.push(registro)
        seen.set(registro.nomeNormalizado, current)
      })

      seen.forEach((duplicated) => {
        if (duplicated.length > 1) {
          problems.push(
            createProblem(
              'duplicidade',
              entidade,
              `Possivel duplicidade: ${duplicated.map((item) => item.nome).join(', ')}`,
              duplicated[0].aba,
              duplicated[0].linha,
            ),
          )
        }
      })
    })

    return problems
  }
}

