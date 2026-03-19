export function normalizeCurrency(currency?: string | null) {
  return (currency || 'USD').toUpperCase()
}

export function formatCurrency(amount: number, currency?: string | null) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: normalizeCurrency(currency)
  }).format(amount)
}
