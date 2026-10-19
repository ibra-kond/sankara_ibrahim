// Données de démonstration (mêmes contenus que supabase/seed.sql).
// Images de substitution dans /public/demo — à remplacer par de vraies photos depuis l'admin.
const p = (name) => ({ src: `/demo/${name}.svg`, thumb: `/demo/${name}.svg` })

export const demoCreations = [
  {
    id: 'c1', slug: 'table-a-manger-iroko-8-places', title: 'Table à manger en iroko, 8 places',
    category: 'meubles', price: 450000, on_quote: false, badge: 'Populaire',
    description: 'Plateau massif de 5 cm, pieds compas, finition huile naturelle. Résiste à l’humidité et aux chocs.',
    dimensions: '220 × 100 × 76 cm', wood: 'Iroko massif', lead_time: '3 semaines',
    photos: [p('table'), p('table-b')], visible: true, position: 0,
  },
  {
    id: 'c2', slug: 'porte-d-entree-sculptee', title: 'Porte d’entrée sculptée',
    category: 'portes-fenetres', price: 380000, on_quote: false, badge: 'Nouveau',
    description: 'Double vantail en bois rouge, motifs gravés à la main, serrure 3 points.',
    dimensions: '140 × 220 cm', wood: 'Caïlcédrat', lead_time: '4 semaines',
    photos: [p('porte'), p('porte-b')], visible: true, position: 1,
  },
  {
    id: 'c3', slug: 'cuisine-equipee-sur-mesure', title: 'Cuisine équipée sur mesure',
    category: 'cuisines', price: null, on_quote: true, badge: '',
    description: 'Caissons, plan de travail et rangements adaptés à votre pièce, au centimètre près.',
    dimensions: 'Selon votre cuisine', wood: 'Samba + contreplaqué marine', lead_time: '5 à 6 semaines',
    photos: [p('cuisine'), p('cuisine-b')], visible: true, position: 2,
  },
  {
    id: 'c4', slug: 'lit-deux-places-tete-de-lit', title: 'Lit 2 places avec tête de lit',
    category: 'chambres', price: 275000, on_quote: false, badge: 'Disponible',
    description: 'Sommier à lattes renforcé, tête de lit capitonnée en option. Livré monté.',
    dimensions: '160 × 200 cm', wood: 'Acajou', lead_time: 'Disponible de suite',
    photos: [p('lit'), p('lit-b')], visible: true, position: 3,
  },
  {
    id: 'c5', slug: 'bureau-direction', title: 'Bureau de direction',
    category: 'bureaux', price: 320000, on_quote: false, badge: '',
    description: 'Grand plateau, caisson 3 tiroirs fermant à clé, passe-câbles intégrés.',
    dimensions: '180 × 85 × 75 cm', wood: 'Noyer d’Afrique', lead_time: '3 semaines',
    photos: [p('bureau'), p('bureau-b')], visible: true, position: 4,
  },
  {
    id: 'c6', slug: 'armoire-3-portes', title: 'Armoire 3 portes avec miroir',
    category: 'chambres', price: 360000, on_quote: false, badge: '',
    description: 'Penderie, étagères et tiroirs. Porte centrale avec miroir pleine hauteur.',
    dimensions: '150 × 60 × 210 cm', wood: 'Samba teinté noyer', lead_time: '3 semaines',
    photos: [p('armoire'), p('armoire-b')], visible: true, position: 5,
  },
  {
    id: 'c7', slug: 'fenetre-persiennes', title: 'Fenêtre à persiennes',
    category: 'portes-fenetres', price: 85000, on_quote: false, badge: '',
    description: 'Lames orientables pour l’air et l’ombre. Cadre traité contre les termites.',
    dimensions: '120 × 140 cm', wood: 'Iroko', lead_time: '2 semaines',
    photos: [p('fenetre'), p('fenetre-b')], visible: true, position: 6,
  },
  {
    id: 'c8', slug: 'bibliotheque-murale', title: 'Bibliothèque murale',
    category: 'meubles', price: 210000, on_quote: false, badge: 'Nouveau',
    description: 'Étagères réglables, fond ajouré, fixation murale invisible.',
    dimensions: '200 × 35 × 220 cm', wood: 'Chêne clair', lead_time: '2 semaines',
    photos: [p('bibliotheque'), p('bibliotheque-b')], visible: true, position: 7,
  },
]

export const demoServices = [
  { id: 's1', title: 'Fabrication sur mesure', icon: 'ruler', price_from: 50000, description: 'Meubles, portes, cuisines : conçus pour vos dimensions et votre usage.', visible: true, position: 0 },
  { id: 's2', title: 'Réparation', icon: 'hammer', price_from: 10000, description: 'Pieds cassés, tiroirs bloqués, charnières : on redonne vie à vos meubles.', visible: true, position: 1 },
  { id: 's3', title: 'Rénovation', icon: 'refresh', price_from: 25000, description: 'Ponçage, teinte et vernis pour un meuble comme neuf.', visible: true, position: 2 },
  { id: 's4', title: 'Installation & pose', icon: 'drill', price_from: 15000, description: 'Pose de portes, fenêtres, plafonds et placards, propre et de niveau.', visible: true, position: 3 },
  { id: 's5', title: 'Conseil', icon: 'chat', price_from: 0, description: 'Choix du bois, plans, budget : un avis honnête avant de vous lancer.', visible: true, position: 4 },
]

export const demoTestimonials = [
  { id: 't1', name: 'Aminata', district: 'Ouaga 2000', rating: 5, text: 'Ma cuisine a été livrée le jour prévu, et les finitions sont parfaites. Trois ans après, rien n’a bougé.', photos: [p('cuisine')], visible: true, position: 0 },
  { id: 't2', name: 'Moussa', district: 'Tampouy', rating: 5, text: 'Porte d’entrée magnifique. Les voisins demandent tous le contact de l’atelier.', photos: [p('porte')], visible: true, position: 1 },
  { id: 't3', name: 'Clarisse', district: 'Pissy', rating: 5, text: 'Lit et armoire faits sur mesure pour une petite chambre. Tout rentre au centimètre près.', photos: [p('lit')], visible: true, position: 2 },
]

export const demoBeforeAfter = [
  { id: 'b1', title: 'Rénovation d’un buffet ancien', before: [p('avant-1')], after: [p('apres-1')], visible: true, position: 0 },
  { id: 'b2', title: 'Remplacement d’une porte abîmée', before: [p('avant-2')], after: [p('apres-2')], visible: true, position: 1 },
  { id: 'b3', title: 'Chaise restaurée et revernie', before: [p('avant-3')], after: [p('apres-3')], visible: true, position: 2 },
]
