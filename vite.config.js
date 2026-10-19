import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import config from './src/config.js'

/**
 * Injecte les informations de config.js dans index.html au build
 * (les robots de WhatsApp/Facebook/Google n'exécutent pas le JavaScript,
 * les balises SEO doivent donc être présentes dans le HTML statique),
 * puis génère sitemap.xml et robots.txt.
 */
function seoPlugin() {
  const title = `Menuisier à ${config.city} – Meubles sur mesure | ${config.businessName}`
  const description = `${config.businessName} : menuiserie artisanale à ${config.city}. Meubles, portes, fenêtres, cuisines et lits sur mesure. ${config.yearsExperience} ans d’expérience. Devis gratuit sur WhatsApp.`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${config.siteUrl}/#atelier`,
    name: config.businessName,
    description,
    url: config.siteUrl,
    image: `${config.siteUrl}/og-image.png`,
    telephone: `+${config.whatsapp}`,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: config.address,
      addressLocality: config.city,
      addressCountry: config.country,
    },
    areaServed: config.serviceArea,
    founder: { '@type': 'Person', name: `${config.ownerFirstName} ${config.ownerLastName}` },
    sameAs: [config.facebook, config.tiktok].filter(Boolean),
    openingHours: 'Mo-Sa 07:30-18:30',
  }
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
  const vars = {
    TITLE: esc(title),
    DESCRIPTION: esc(description),
    SITE_URL: config.siteUrl,
    BUSINESS_NAME: esc(config.businessName),
    JSON_LD: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
  }

  // Manifest PWA généré depuis config.js
  const manifest = JSON.stringify(
    {
      name: `${config.businessName} – Menuisier sur mesure`,
      short_name: config.businessName.replace(/^L['’]/, '').slice(0, 15),
      description: `Meubles, portes, fenêtres et cuisines sur mesure à ${config.city}. Réalisations, prix et devis gratuit sur WhatsApp.`,
      lang: 'fr',
      dir: 'ltr',
      id: '/',
      start_url: '/?source=pwa',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#FAF6EF',
      theme_color: '#2B1E15',
      categories: ['business', 'shopping', 'lifestyle'],
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
      shortcuts: [
        { name: 'Réalisations', url: '/#realisations', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
        { name: 'Espace atelier', url: '/admin', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      ],
    },
    null,
    2,
  )

  return {
    name: 'atelier-seo',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replace(/%(TITLE|DESCRIPTION|SITE_URL|BUSINESS_NAME|JSON_LD)%/g, (_, k) => vars[k]),
    },
    configureServer(server) {
      server.middlewares.use('/manifest.webmanifest', (_req, res) => {
        res.setHeader('Content-Type', 'application/manifest+json')
        res.end(manifest)
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: manifest })
      const today = new Date().toISOString().slice(0, 10)
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${config.siteUrl}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${config.siteUrl}/realisations</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
</urlset>
`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`,
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), seoPlugin()],
  build: {
    target: 'es2019',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          dnd: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        },
      },
    },
  },
})
