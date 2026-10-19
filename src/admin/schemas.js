/**
 * Description des formulaires de l'admin.
 * Un même composant (ItemForm) affiche n'importe quelle liste à partir de ces schémas.
 *
 * Types de champs : photos, text, textarea, select, price, number, chips, icon, rating, toggle
 * `advanced: true` → rangé dans « Plus de détails (facultatif) »
 */
import { formatPrice } from '../lib/utils'

export const ICONS = [
  { id: 'ruler', label: 'Mesure' },
  { id: 'hammer', label: 'Marteau' },
  { id: 'refresh', label: 'Rénovation' },
  { id: 'drill', label: 'Perceuse' },
  { id: 'chat', label: 'Conseil' },
  { id: 'tools', label: 'Outils' },
]

export const SCHEMAS = {
  creations: {
    label: 'Créations',
    singular: 'une création',
    tab: 'Créations',
    icon: 'grid',
    fields: [
      { name: 'photos', type: 'photos', label: 'Photos', max: 8, required: true, help: 'La 1re photo est celle qui s’affiche sur le site.' },
      { name: 'title', type: 'text', label: 'Titre', required: true, max: 80, placeholder: 'Ex. Table en iroko 6 places' },
      { name: 'category', type: 'select', label: 'Catégorie', options: 'categories', required: true },
      { name: 'price', type: 'price', label: 'Prix' },
      { name: 'description', type: 'textarea', label: 'Description courte', max: 200, placeholder: 'Ce qui rend ce meuble solide et beau…' },
      { name: 'badge', type: 'chips', label: 'Badge (facultatif)', options: 'badges' },
      { name: 'dimensions', type: 'text', label: 'Dimensions', advanced: true, placeholder: 'Ex. 180 × 90 × 76 cm' },
      { name: 'wood', type: 'text', label: 'Essence de bois', advanced: true, placeholder: 'Ex. Iroko massif' },
      { name: 'lead_time', type: 'text', label: 'Délai indicatif', advanced: true, placeholder: 'Ex. 3 semaines' },
      { name: 'visible', type: 'toggle', label: 'Afficher sur le site' },
    ],
    empty: { photos: [], title: '', category: 'meubles', price: null, on_quote: false, description: '', badge: '', dimensions: '', wood: '', lead_time: '', visible: true },
    thumb: (i) => i.photos?.[0],
    title: (i) => i.title,
    subtitle: (i, s) => (i.on_quote || i.price == null ? 'Sur devis' : formatPrice(i.price, s.currency)),
  },
  services: {
    label: 'Services',
    singular: 'un service',
    tab: 'Services',
    icon: 'tools',
    fields: [
      { name: 'title', type: 'text', label: 'Nom du service', required: true, max: 60, placeholder: 'Ex. Réparation' },
      { name: 'icon', type: 'icon', label: 'Icône' },
      { name: 'price_from', type: 'number', label: 'Prix « à partir de »', help: 'Mettez 0 si c’est gratuit.' },
      { name: 'description', type: 'textarea', label: 'Description courte', max: 200 },
      { name: 'visible', type: 'toggle', label: 'Afficher sur le site' },
    ],
    empty: { title: '', icon: 'ruler', price_from: 0, description: '', visible: true },
    iconOf: (i) => i.icon,
    title: (i) => i.title,
    subtitle: (i, s) => (Number(i.price_from) > 0 ? `dès ${formatPrice(i.price_from, s.currency)}` : 'Gratuit'),
  },
  testimonials: {
    label: 'Avis clients',
    singular: 'un avis',
    tab: 'Avis',
    icon: 'star',
    fields: [
      { name: 'name', type: 'text', label: 'Prénom du client', required: true, max: 40 },
      { name: 'district', type: 'text', label: 'Quartier', max: 40, placeholder: 'Ex. Ouaga 2000' },
      { name: 'rating', type: 'rating', label: 'Note' },
      { name: 'text', type: 'textarea', label: 'Ce que le client a dit', max: 300, required: true },
      { name: 'photos', type: 'photos', label: 'Photo du meuble concerné', max: 1 },
      { name: 'visible', type: 'toggle', label: 'Afficher sur le site' },
    ],
    empty: { name: '', district: '', rating: 5, text: '', photos: [], visible: true },
    thumb: (i) => i.photos?.[0],
    title: (i) => i.name,
    subtitle: (i) => `${'★'.repeat(i.rating || 5)} ${i.district || ''}`,
  },
  before_after: {
    label: 'Avant / Après',
    singular: 'un avant / après',
    tab: 'Avant/Après',
    icon: 'refresh',
    fields: [
      { name: 'title', type: 'text', label: 'Titre', required: true, max: 80, placeholder: 'Ex. Rénovation d’un buffet' },
      { name: 'before', type: 'photos', label: 'Photo AVANT', max: 1, required: true },
      { name: 'after', type: 'photos', label: 'Photo APRÈS', max: 1, required: true },
      { name: 'visible', type: 'toggle', label: 'Afficher sur le site' },
    ],
    empty: { title: '', before: [], after: [], visible: true },
    thumb: (i) => i.after?.[0],
    title: (i) => i.title,
    subtitle: () => 'Comparaison',
  },
}
