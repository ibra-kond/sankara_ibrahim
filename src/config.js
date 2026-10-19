/**
 * ============================================================
 *  CONFIGURATION CENTRALE DU SITE
 * ============================================================
 *  Ces valeurs servent de valeurs PAR DÉFAUT.
 *  Une fois Supabase branché, le menuisier peut les modifier
 *  depuis /admin > « Mon atelier » sans toucher au code.
 *
 *  Les valeurs marquées [BUILD] sont aussi injectées dans
 *  index.html au moment du build (SEO, aperçu WhatsApp/Facebook) :
 *  pensez à les remplir ici avant le déploiement.
 * ============================================================
 */
const config = {
  // [BUILD] Adresse publique du site (sans / final), utilisée pour le sitemap et l'aperçu de partage
  siteUrl: 'https://sankaraibrahim.vercel.app',

  // ---- Identité ----
  businessName: "L'Atelier du Bois", // [BUILD]
  ownerFirstName: 'Issouf',
  ownerLastName: 'Sankara',
  city: 'Ouagadougou', // [BUILD]
  country: 'Burkina Faso', // [BUILD]
  serviceArea: 'Ouagadougou et environs (jusqu’à 50 km)',
  yearsExperience: 15,
  specialties: [
    'Meubles sur mesure',
    'Portes & fenêtres',
    'Cuisines',
    'Lits et chambres',
    'Plafonds',
    'Aménagement de bureaux',
  ],

  // ---- Contact ----
  // Format international, sans « + » ni espaces. Ex. Burkina : 226 + numéro
  whatsapp: '22670000000',
  phoneDisplay: '+226 70 00 00 00',
  email: '',
  address: 'Secteur 15, Ouagadougou',
  hours: 'Lun – Sam : 7 h 30 – 18 h 30',
  facebook: 'https://www.facebook.com/',
  tiktok: 'https://www.tiktok.com/',

  // ---- Prix ----
  currency: 'FCFA',

  // ---- Chiffres clés ----
  stats: {
    projects: 420,
    clients: 350,
    // les années d'expérience viennent de yearsExperience
    onTimeRate: 98, // % de chantiers livrés dans les délais
  },

  // ---- Textes clés ----
  heroTitle: 'Le bois, façonné pour durer.',
  heroSubtitle: 'Meubles, portes et cuisines sur mesure, fabriqués à la main.',
  heroImage: '/demo/hero.svg',
  heroVideo: '', // URL d'une courte vidéo .mp4 (optionnel)
  aboutTitle: 'Un métier appris à l’établi',
  aboutText:
    'Formé auprès de mon père dès l’âge de 14 ans, j’ai ouvert mon atelier pour proposer des meubles solides, pensés pour le climat et pour la vie de famille. Je choisis chaque planche moi-même, je travaille des essences locales et je livre ce que je promets, à la date promise.',
  aboutImage: '/demo/atelier.svg',
  finalCtaTitle: 'Votre meuble idéal commence par un message.',
  finalCtaReassurance: 'Devis gratuit • Réponse rapide • Sans engagement',

  // ---- Libellés de CTA (un seul CTA principal sur tout le site) ----
  ctaPrimary: 'Demander mon devis gratuit',

  // ---- Catégories du catalogue (identifiant: libellé) ----
  categories: [
    { id: 'meubles', label: 'Meubles' },
    { id: 'portes-fenetres', label: 'Portes & fenêtres' },
    { id: 'cuisines', label: 'Cuisines' },
    { id: 'chambres', label: 'Chambres' },
    { id: 'bureaux', label: 'Bureaux' },
    { id: 'autres', label: 'Autres' },
  ],

  // ---- Badges disponibles ----
  badges: ['Nouveau', 'Populaire', 'Disponible'],

  // ---- Étapes du savoir-faire ----
  process: [
    { title: 'Prise de mesures', text: 'Je viens chez vous, je mesure et j’écoute vos besoins.', image: '/demo/process-1.svg' },
    { title: 'Conception', text: 'Croquis, choix du bois et devis clair, sans surprise.', image: '/demo/process-2.svg' },
    { title: 'Fabrication', text: 'Assemblages solides, à l’atelier, pièce par pièce.', image: '/demo/process-3.svg' },
    { title: 'Finition', text: 'Ponçage, teinte et vernis pour un rendu durable.', image: '/demo/process-4.svg' },
    { title: 'Livraison & pose', text: 'Livré et installé chez vous, à la date convenue.', image: '/demo/process-5.svg' },
  ],

  legal:
    'Site édité par l’atelier. Les photos présentées sont des réalisations de l’atelier. Les prix sont indicatifs et peuvent varier selon les dimensions et l’essence de bois choisie.',
}

export default config
