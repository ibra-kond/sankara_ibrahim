/** Prix au format français : 150000 → « 150 000 FCFA » */
export function formatPrice(value, currency) {
  if (value === null || value === undefined || value === '') return 'Sur devis'
  return `${new Intl.NumberFormat('fr-FR').format(Number(value))} ${currency}`
}

/** Prix d'une création, en tenant compte de « Sur devis » */
export function itemPrice(item, currency) {
  return item.on_quote || item.price == null ? 'Sur devis' : formatPrice(item.price, currency)
}

/** « Table à manger 6 places » → « table-a-manger-6-places » */
export function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'creation'
}

export const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`)

/** srcset à partir d'une photo { src, thumb } */
export function photoSrcSet(photo) {
  if (!photo) return undefined
  if (photo.thumb && photo.thumb !== photo.src) return `${photo.thumb} 640w, ${photo.src} 1600w`
  return undefined
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
