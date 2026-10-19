import { itemPrice } from './utils'

/** Lien WhatsApp avec message pré-rempli encodé */
export function waLink(number, text) {
  const n = String(number || '').replace(/\D/g, '')
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`
}

/** Message général (devis) */
export function waGeneral(settings) {
  return waLink(
    settings.whatsapp,
    `Bonjour ${settings.ownerFirstName}, j'ai vu votre portfolio et j'aimerais un devis.`,
  )
}

/** Message pour une création précise */
export function waItem(settings, item) {
  const price = itemPrice(item, settings.currency)
  const pricePart = price === 'Sur devis' ? '(prix sur devis)' : `à ${price}`
  return waLink(
    settings.whatsapp,
    `Bonjour, je suis intéressé(e) par "${item.title}" ${pricePart}. Est-il disponible ?`,
  )
}

/** Message pour un service */
export function waService(settings, service) {
  return waLink(
    settings.whatsapp,
    `Bonjour ${settings.ownerFirstName}, j'aimerais un devis pour : ${service.title}.`,
  )
}
