export function normalizeDisplayName(value: unknown) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeImportedName(value: unknown) {
  return normalizeDisplayName(value)
    .replace(/\s+\(/g, ' (')
    .replace(/([a-zA-ZÀ-ÿ])\(/g, '$1 (')
    .replace(/\ba grega\b/gi, 'à Grega')
    .replace(/\ba parmegiana\b/gi, 'à Parmegiana')
    .replace(/\ba portuguesa\b/gi, 'à Portuguesa')
    .replace(/\ba calif[oó]rnia\b/gi, 'à Califórnia')
    .replace(/\ba su[ií]ça\b/gi, 'à Suíça')
    .replace(/\ba malaguetta\b/gi, 'à Malaguetta')
    .replace(/\ba milanesa\b/gi, 'à Milanesa')
}

export function normalizeComparable(value: unknown) {
  return normalizeDisplayName(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

export function parseNumber(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  const rawText = normalizeDisplayName(value)
    .replace(/\s/g, '')
    .replace(/^R\$/i, '')
    .replace(/[^\d,.-]/g, '')
  const lastComma = rawText.lastIndexOf(',')
  const lastDot = rawText.lastIndexOf('.')
  const text =
    lastComma > lastDot
      ? rawText.replace(/\./g, '').replace(',', '.')
      : rawText.replace(/,/g, '')

  if (!text) {
    return null
  }

  const parsed = Number(text)
  return Number.isFinite(parsed) ? parsed : null
}

export function normalizeUnit(value: unknown) {
  const unit = normalizeComparable(value)

  if (['kg', 'quilo', 'quilos', 'quilograma', 'quilogramas'].includes(unit)) {
    return 'kg'
  }

  if (['g', 'gr', 'grama', 'gramas'].includes(unit)) {
    return 'g'
  }

  if (['l', 'lt', 'litro', 'litros'].includes(unit)) {
    return 'l'
  }

  if (['ml', 'mililitro', 'mililitros'].includes(unit)) {
    return 'ml'
  }

  if (['un', 'und', 'unid', 'unidade', 'unidades'].includes(unit)) {
    return 'unidade'
  }

  return null
}

export function getBaseUnit(unit: 'kg' | 'g' | 'l' | 'ml' | 'unidade') {
  if (unit === 'kg' || unit === 'g') {
    return 'g'
  }

  if (unit === 'l' || unit === 'ml') {
    return 'ml'
  }

  return 'unidade'
}

export function convertToBaseQuantity(
  quantity: number,
  unit: 'kg' | 'g' | 'l' | 'ml' | 'unidade',
) {
  if (unit === 'kg' || unit === 'l') {
    return quantity * 1000
  }

  return quantity
}

export async function hashFile(file: File) {
  const buffer = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
