# Portfolio menuisier — PWA

Site vitrine installable sur téléphone pour un artisan menuisier : réalisations filtrables, fiche détail avec zoom, comparaisons avant/après, avis clients et contact WhatsApp.
Un espace `/admin` permet au menuisier de publier ses créations depuis son téléphone.

**Stack :** React 18 + Vite 5, Tailwind CSS 3, Supabase (base de données, authentification, stockage), service worker écrit à la main.

## Démarrage rapide

```bash
npm install
npm run dev        # http://localhost:5173 (mode démo si .env absent)
npm run build      # build de production dans dist/
npm run preview    # tester le build (service worker actif)
npm run assets     # régénérer les icônes, l'image de partage et les images de démo
```

En **mode démo**, sans fichier `.env`, tout fonctionne avec des données stockées dans le navigateur.
Accès admin : `admin@demo.fr` / `demo1234`.

## Personnalisation

| Quoi | Où |
|---|---|
| Nom, WhatsApp, réseaux, devise, textes, catégories, étapes | `src/config.js` (valeurs par défaut, également modifiables dans l'admin) |
| Couleurs | `src/index.css` (variables `--bg`, `--cta`…) |
| Polices | `src/main.jsx` + `tailwind.config.js` |
| SEO, Open Graph, Schema.org, sitemap, robots, manifest | générés au build depuis `config.js` (`vite.config.js`) |

## Arborescence

```
├── index.html                 # Méta SEO/OG + JSON-LD (injectés depuis config.js)
├── vite.config.js             # Plugin SEO : sitemap.xml, robots.txt, manifest.webmanifest
├── public/
│   ├── sw.js                  # Service worker (cache d'abord / réseau d'abord)
│   ├── offline.html           # Page hors ligne
│   ├── icons/                 # 192, 512, maskable, apple-touch-icon
│   ├── demo/                  # Images de substitution (SVG)
│   └── og-image.png           # Aperçu de partage 1200×630
├── src/
│   ├── config.js              # ⭐ Configuration centrale
│   ├── lib/
│   │   ├── api.js             # Accès aux données (Supabase ou mode démo)
│   │   ├── image.js           # Compression WebP, 1600 px + vignette 640 px
│   │   ├── whatsapp.js        # Liens wa.me avec messages pré-remplis
│   │   └── demoData.js        # Données de démonstration
│   ├── context/SiteContext.jsx  # Données publiques + cache pour l'affichage progressif
│   ├── components/            # Layout (en-tête, nav mobile, pied de page, FAB, bannière d'installation), UI, icônes
│   ├── sections/              # Hero, Stats, Catalog, CreationModal, Services, BeforeAfter, Process, Testimonials, About, FinalCta
│   ├── pages/                 # Home, NotFound
│   └── admin/                 # Connexion, listes triables, formulaire générique, réglages
├── supabase/
│   ├── schema.sql             # Tables + RLS + bucket de stockage
│   └── seed.sql               # Données de démo
└── docs/
    ├── DEPLOIEMENT.md         # Guide de déploiement pas à pas
    └── GUIDE-ADMIN.md         # Mode d'emploi pour le menuisier
```

## Choix techniques

- **Site public léger :** les lectures passent par l'API REST de Supabase avec `fetch`. Le SDK Supabase (~60 Ko gzip) et dnd-kit ne sont chargés que dans l'admin.
  JS public : environ 74 Ko gzip, CSS : environ 8 Ko.
- **Affichage progressif :** la dernière version des données est gardée dans le navigateur. Les visites suivantes s'affichent instantanément, même hors ligne.
- **Accent réservé aux CTA :** la couleur vert forêt `--cta` n'est utilisée que sur les boutons d'action WhatsApp. L'admin utilise le noyer.
- **URLs lisibles :** `/realisations/table-en-iroko` ouvre la fiche détail par-dessus l'accueil. L'adresse est partageable.
- **Sécurité :** RLS, lecture publique limitée à `visible = true`, écriture réservée aux emails listés dans la table `admins`.

Déploiement : voir [docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md).
