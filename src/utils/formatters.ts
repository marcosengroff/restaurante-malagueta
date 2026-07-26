export function formatCurrency(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(value)
}

export function formatCurrencyInput(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

export function parseCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, '')
  return Number(digits || '0') / 100
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value))
}
