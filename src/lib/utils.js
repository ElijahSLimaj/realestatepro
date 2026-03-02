export function formatPrice(price, opts = {}) {
  const { perMonth = false } = opts
  const formatted = new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price)
  return perMonth ? `${formatted}/maand` : formatted
}

export function formatDate(dateStr, lang = 'nl') {
  const localeMap = { nl: 'nl-BE', fr: 'fr-FR', en: 'en-US' }
  return new Date(dateStr).toLocaleDateString(localeMap[lang] || 'nl-BE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getLocalized(obj, lang) {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj[lang] || obj.nl || obj.en || ''
}

export function getLocalizedField(row, field, lang) {
  return row?.[`${field}_${lang}`] || row?.[`${field}_nl`] || row?.[`${field}_en`] || ''
}
