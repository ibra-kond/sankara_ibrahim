/**
 * Génère les visuels de substitution et les icônes de l'application.
 *   npm run assets
 *
 * - public/demo/*.svg       : illustrations de démonstration (à remplacer par de vraies photos via l'admin)
 * - public/icons/*.png      : icônes PWA 192, 512, maskable, apple-touch-icon
 * - public/og-image.png     : image d'aperçu WhatsApp / Facebook (1200×630)
 * - public/favicon.svg
 *
 * Relancez ce script après avoir changé le nom de l'atelier dans src/config.js.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import config from '../src/config.js'

const root = new URL('../public/', import.meta.url)
await mkdir(new URL('demo/', root), { recursive: true })
await mkdir(new URL('icons/', root), { recursive: true })

/* ------------------------------------------------------------------ */
/*  Palettes                                                           */
/* ------------------------------------------------------------------ */
const TONES = {
  a: { wall: ['#EFE6D8', '#E2D3BC'], floor: '#B89270', wood: ['#9A5F3C', '#6E3F25'], light: '#FFF6E6' },
  b: { wall: ['#E6E0D6', '#D2C7B6'], floor: '#8C6A4F', wood: ['#C49465', '#9C6E45'], light: '#FFFFFF' },
  worn: { wall: ['#D9D6D0', '#BDB8AE'], floor: '#8E877C', wood: ['#8C8378', '#6E665C'], light: '#EEEEEE' },
  dark: { wall: ['#3A2A1E', '#20160F'], floor: '#4A3424', wood: ['#A8693F', '#6E3F25'], light: '#FFD9A0' },
}

const defs = (t, id = '') => `
<defs>
  <linearGradient id="wall${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.wall[0]}"/><stop offset="1" stop-color="${t.wall[1]}"/></linearGradient>
  <linearGradient id="wood${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.wood[0]}"/><stop offset="1" stop-color="${t.wood[1]}"/></linearGradient>
  <radialGradient id="glow${id}" cx=".3" cy=".25" r=".7"><stop offset="0" stop-color="${t.light}" stop-opacity=".55"/><stop offset="1" stop-color="${t.light}" stop-opacity="0"/></radialGradient>
  <pattern id="grain${id}" width="240" height="60" patternUnits="userSpaceOnUse">
    <path d="M0 12 C60 4 120 20 240 10 M0 30 C80 22 160 40 240 28 M0 48 C70 40 150 56 240 46" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2"/>
  </pattern>
  <filter id="shadow${id}" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#2B1E15" flood-opacity=".28"/></filter>
</defs>`

const W = 1600
const H = 1200
const scene = (t, body, { floorY = 960 } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
${defs(t)}
<rect width="${W}" height="${H}" fill="url(#wall)"/>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
<rect y="${floorY}" width="${W}" height="${H - floorY}" fill="${t.floor}"/>
<rect y="${floorY}" width="${W}" height="${H - floorY}" fill="url(#grain)"/>
${Array.from({ length: 8 }, (_, i) => `<line x1="${i * 220 + 40}" y1="${floorY}" x2="${i * 220 - 60}" y2="${H}" stroke="#000" stroke-opacity=".08" stroke-width="3"/>`).join('')}
<rect y="${floorY - 6}" width="${W}" height="10" fill="#000" opacity=".08"/>
<g filter="url(#shadow)">${body}</g>
</svg>`

// Bloc de bois avec veinage
const wood = (x, y, w, h, r = 8, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#wood)" ${extra}/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#grain)"/>`

/* ------------------------------------------------------------------ */
/*  Meubles                                                            */
/* ------------------------------------------------------------------ */
const FURNITURE = {
  table: () =>
    `${wood(330, 600, 940, 56, 10)}
     <polygon points="400,656 440,656 400,960 360,960" fill="url(#wood)"/>
     <polygon points="1160,656 1200,656 1240,960 1200,960" fill="url(#wood)"/>
     <polygon points="560,656 590,656 610,940 580,940" fill="url(#wood)" opacity=".75"/>
     <polygon points="1010,656 1040,656 1020,940 990,940" fill="url(#wood)" opacity=".75"/>
     <ellipse cx="800" cy="585" rx="110" ry="26" fill="#EFE6D8"/><path d="M700 585 Q800 650 900 585" fill="#D9C7AE"/>
     <circle cx="770" cy="560" r="26" fill="#C9772F"/><circle cx="820" cy="565" r="24" fill="#8DA05A"/>`,
  porte: () =>
    `<rect x="520" y="180" width="560" height="790" rx="6" fill="#5A3A26"/>
     ${wood(550, 210, 245, 760, 4)}${wood(805, 210, 245, 760, 4)}
     ${[260, 520, 760].map((y) => `<rect x="585" y="${y}" width="175" height="${y === 520 ? 190 : 210}" rx="6" fill="none" stroke="#3E2618" stroke-opacity=".5" stroke-width="10"/><rect x="840" y="${y}" width="175" height="${y === 520 ? 190 : 210}" rx="6" fill="none" stroke="#3E2618" stroke-opacity=".5" stroke-width="10"/>`).join('')}
     <rect x="770" y="560" width="14" height="90" rx="7" fill="#D8B46A"/><rect x="816" y="560" width="14" height="90" rx="7" fill="#D8B46A"/>`,
  fenetre: () =>
    `<rect x="470" y="200" width="660" height="660" fill="#BFD3D9"/>
     <rect x="440" y="170" width="720" height="720" rx="8" fill="none" stroke="url(#wood)" stroke-width="60"/>
     <rect x="785" y="200" width="30" height="660" fill="url(#wood)"/>
     ${Array.from({ length: 15 }, (_, i) => `<rect x="${i % 1 === 0 ? 480 : 0}" y="${215 + i * 43}" width="295" height="24" rx="3" fill="url(#wood)" opacity=".95"/><rect x="825" y="${215 + i * 43}" width="295" height="24" rx="3" fill="url(#wood)" opacity=".95"/>`).join('')}
     ${wood(400, 880, 800, 40, 6)}`,
  cuisine: () =>
    `${wood(160, 640, 1280, 320, 6)}
     <rect x="140" y="610" width="1320" height="40" rx="6" fill="#E9E1D4"/>
     ${[0, 1, 2, 3, 4].map((i) => `<rect x="${185 + i * 252}" y="670" width="230" height="270" rx="6" fill="none" stroke="#3E2618" stroke-opacity=".35" stroke-width="6"/><rect x="${270 + i * 252}" y="690" width="60" height="10" rx="5" fill="#2B1E15" opacity=".7"/>`).join('')}
     ${[0, 1, 2, 3].map((i) => `${wood(220 + i * 300, 200, 270, 250, 6)}<rect x="${345 + i * 300}" y="410" width="10" height="26" rx="5" fill="#2B1E15" opacity=".7"/>`).join('')}
     <rect x="640" y="560" width="200" height="50" rx="8" fill="#9AA3A6"/><path d="M760 560 v-60 h40" stroke="#7C8487" stroke-width="12" fill="none"/>`,
  lit: () =>
    `${wood(300, 360, 1000, 330, 24)}
     ${[0, 1, 2, 3].map((i) => `<rect x="${340 + i * 240}" y="400" width="200" height="250" rx="14" fill="#000" opacity=".08"/>`).join('')}
     <rect x="290" y="690" width="1020" height="190" rx="18" fill="url(#wood)"/>
     <rect x="320" y="600" width="960" height="140" rx="40" fill="#F4EEE4"/>
     <rect x="380" y="560" width="300" height="100" rx="40" fill="#FFFFFF"/><rect x="920" y="560" width="300" height="100" rx="40" fill="#FFFFFF"/>
     <rect x="320" y="680" width="960" height="120" rx="30" fill="#D9C4A6"/>
     <rect x="330" y="880" width="40" height="80" fill="url(#wood)"/><rect x="1230" y="880" width="40" height="80" fill="url(#wood)"/>`,
  bureau: () =>
    `${wood(260, 580, 1080, 54, 8)}
     ${wood(990, 634, 320, 326, 6)}
     ${[0, 1, 2].map((i) => `<rect x="1010" y="${650 + i * 104}" width="280" height="90" rx="6" fill="none" stroke="#3E2618" stroke-opacity=".35" stroke-width="6"/><rect x="1120" y="${690 + i * 104}" width="60" height="10" rx="5" fill="#2B1E15" opacity=".7"/>`).join('')}
     <rect x="290" y="634" width="40" height="326" fill="url(#wood)"/>
     <rect x="520" y="430" width="300" height="150" rx="10" fill="#2E2E30"/><rect x="480" y="572" width="380" height="12" rx="6" fill="#4A4A4E"/>
     <rect x="900" y="520" width="44" height="60" rx="6" fill="#8DA05A"/>`,
  armoire: () =>
    `${wood(450, 170, 700, 790, 10)}
     <rect x="480" y="200" width="200" height="740" rx="6" fill="none" stroke="#3E2618" stroke-opacity=".35" stroke-width="6"/>
     <rect x="700" y="200" width="200" height="740" rx="6" fill="#C8D3D6"/><rect x="700" y="200" width="200" height="740" rx="6" fill="url(#glow)"/>
     <rect x="920" y="200" width="200" height="740" rx="6" fill="none" stroke="#3E2618" stroke-opacity=".35" stroke-width="6"/>
     <rect x="660" y="540" width="10" height="70" rx="5" fill="#D8B46A"/><rect x="930" y="540" width="10" height="70" rx="5" fill="#D8B46A"/>
     ${wood(430, 150, 740, 30, 6)}`,
  bibliotheque: () => {
    const colors = ['#7C3F2A', '#2F5D50', '#C9A15E', '#3F4A6B', '#A65B3C', '#E6D7BD', '#5B4636']
    let books = ''
    ;[0, 1, 2, 3].forEach((row) => {
      let x = 470
      let k = row * 3
      while (x < 1080) {
        const w = 28 + ((k * 13) % 30)
        const h = 120 + ((k * 29) % 50)
        books += `<rect x="${x}" y="${165 + (row + 1) * 165 - h}" width="${w}" height="${h}" rx="3" fill="${colors[k % colors.length]}"/>`
        x += w + 4
        k++
        if (k % 6 === 0) x += 60
      }
    })
    return `${wood(440, 160, 720, 800, 8)}<rect x="465" y="185" width="670" height="750" fill="#2B1E15" opacity=".35"/>
      ${books}
      ${[0, 1, 2, 3, 4].map((i) => wood(450, 165 + i * 165, 700, 22, 3)).join('')}`
  },
}

/* Variantes « avant » (usé) */
const WORN = (body) => `${body}
  <g stroke="#3B3530" stroke-opacity=".55" stroke-width="5" fill="none">
    <path d="M520 420 l60 40 -20 50 50 30"/><path d="M980 700 l-40 60 30 40"/><path d="M700 300 l20 80"/>
  </g>
  <g fill="#5E574F" opacity=".35"><circle cx="640" cy="560" r="40"/><circle cx="1010" cy="380" r="28"/><circle cx="820" cy="820" r="34"/></g>`

const BUFFET = () =>
  `${wood(380, 480, 840, 440, 10)}
   ${[0, 1, 2].map((i) => `<rect x="${410 + i * 270}" y="580" width="240" height="310" rx="6" fill="none" stroke="#3E2618" stroke-opacity=".35" stroke-width="6"/><circle cx="${530 + i * 270}" cy="735" r="10" fill="#D8B46A"/>`).join('')}
   <rect x="410" y="505" width="780" height="50" rx="6" fill="none" stroke="#3E2618" stroke-opacity=".35" stroke-width="6"/>
   ${wood(360, 450, 880, 34, 6)}
   <rect x="400" y="920" width="30" height="40" fill="url(#wood)"/><rect x="1170" y="920" width="30" height="40" fill="url(#wood)"/>`

const CHAIR = () =>
  `${wood(640, 230, 300, 60, 14)}${wood(640, 230, 34, 420, 6)}${wood(906, 230, 34, 420, 6)}
   ${[0, 1, 2].map((i) => wood(700 + i * 70, 300, 30, 270, 6)).join('')}
   ${wood(600, 600, 400, 50, 10)}
   <polygon points="620,650 656,650 640,960 604,960" fill="url(#wood)"/><polygon points="944,650 980,650 996,960 960,960" fill="url(#wood)"/>`

/* Scènes d'atelier */
const ATELIER = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1500" preserveAspectRatio="xMidYMid slice">
${defs(t)}
<rect width="1200" height="1500" fill="url(#wall)"/><rect width="1200" height="1500" fill="url(#glow)"/>
<rect x="160" y="160" width="880" height="520" rx="10" fill="#C9B79C"/>
${Array.from({ length: 11 }, (_, r) => Array.from({ length: 17 }, (_, c) => `<circle cx="${200 + c * 50}" cy="${200 + r * 45}" r="5" fill="#8A7559"/>`).join('')).join('')}
<g filter="url(#shadow)">
  <rect x="240" y="260" width="34" height="280" rx="6" fill="#5B3A25"/><rect x="200" y="240" width="114" height="54" rx="10" fill="#6E7477"/>
  <path d="M420 250 h260 l-30 120 h-230 z" fill="#9AA3A6"/><rect x="380" y="240" width="80" height="140" rx="20" fill="#7C3F2A"/>
  <rect x="760" y="250" width="40" height="300" rx="8" fill="#5B3A25"/><rect x="740" y="520" width="80" height="40" rx="8" fill="#9AA3A6"/>
  <rect x="880" y="260" width="24" height="200" rx="10" fill="#C9A15E"/><rect x="930" y="260" width="24" height="230" rx="10" fill="#7C3F2A"/>
</g>
<rect y="1180" width="1200" height="320" fill="${t.floor}"/><rect y="1180" width="1200" height="320" fill="url(#grain)"/>
<g filter="url(#shadow)">
  ${wood(80, 860, 1040, 80, 8)}
  <rect x="140" y="940" width="60" height="300" fill="url(#wood)"/><rect x="1000" y="940" width="60" height="300" fill="url(#wood)"/>
  <rect x="140" y="1100" width="920" height="40" fill="url(#wood)" opacity=".8"/>
  ${wood(300, 800, 520, 60, 6)}
  <path d="M760 800 l120 -60 30 30 -110 60 z" fill="#C9A15E"/>
  ${[0, 1, 2].map((i) => `<rect x="${30 + i * 18}" y="${520 + i * 8}" width="40" height="${660 - i * 8}" rx="6" fill="url(#wood)" transform="rotate(-6 50 860)"/>`).join('')}
</g>
<circle cx="600" cy="790" r="0"/>
</svg>`

const PROCESS = [
  // 1. Mesure : mètre ruban
  (t) => `<rect x="300" y="420" width="1000" height="360" rx="20" fill="#F3D35B"/>${Array.from({ length: 40 }, (_, i) => `<rect x="${330 + i * 24}" y="420" width="4" height="${i % 5 === 0 ? 110 : 60}" fill="#2B1E15"/>`).join('')}<circle cx="300" cy="600" r="250" fill="#C73B2F"/><circle cx="300" cy="600" r="80" fill="#E9DCC8"/>`,
  // 2. Conception : plan
  (t) => `<rect x="320" y="200" width="960" height="760" rx="10" fill="#FBF8F2" transform="rotate(-3 800 580)"/><g stroke="#2F4A6B" stroke-width="6" fill="none" transform="rotate(-3 800 580)"><rect x="440" y="320" width="520" height="300"/><line x1="440" y1="660" x2="960" y2="660"/><line x1="440" y1="650" x2="440" y2="670"/><line x1="960" y1="650" x2="960" y2="670"/><rect x="480" y="360" width="200" height="220"/><rect x="720" y="360" width="200" height="100"/><rect x="720" y="480" width="200" height="100"/></g><rect x="1000" y="700" width="380" height="26" rx="6" fill="#C9A15E" transform="rotate(-35 1190 713)"/>`,
  // 3. Fabrication : scie et planche
  (t) => `${wood(160, 640, 1280, 120, 8)}<path d="M720 640 l340 -380 120 70 -330 400 z" fill="#B9C1C4"/><path d="M720 640 l10 -12 l10 12 l10 -12 l10 12" stroke="#7C8487" stroke-width="4" fill="none"/><rect x="1040" y="160" width="120" height="260" rx="40" fill="#7C3F2A" transform="rotate(30 1100 290)"/><g fill="#E9C99A">${Array.from({ length: 30 }, (_, i) => `<circle cx="${640 + (i * 37) % 200}" cy="${780 + (i * 23) % 140}" r="${4 + (i % 4)}"/>`).join('')}</g>`,
  // 4. Finition : pinceau et vernis
  (t) => `${wood(160, 680, 1280, 100, 8)}<rect x="160" y="680" width="640" height="100" rx="8" fill="#FFFFFF" opacity=".25"/><rect x="980" y="380" width="260" height="300" rx="20" fill="#C9A15E"/><rect x="960" y="360" width="300" height="50" rx="12" fill="#6E3F25"/><rect x="1020" y="480" width="180" height="120" rx="8" fill="#FBF8F2"/><rect x="560" y="300" width="60" height="300" rx="20" fill="#7C3F2A" transform="rotate(-30 590 450)"/><rect x="620" y="520" width="120" height="90" rx="10" fill="#E9C99A" transform="rotate(-30 680 565)"/>`,
  // 5. Livraison : camionnette
  (t) => `<rect x="260" y="420" width="760" height="420" rx="24" fill="#FBF8F2"/><path d="M1020 520 h220 l120 160 v160 h-340 z" fill="#2B1E15"/><rect x="1060" y="560" width="170" height="110" rx="10" fill="#BFD3D9"/><circle cx="460" cy="860" r="80" fill="#2B1E15"/><circle cx="460" cy="860" r="34" fill="#9AA3A6"/><circle cx="1180" cy="860" r="80" fill="#2B1E15"/><circle cx="1180" cy="860" r="34" fill="#9AA3A6"/>${wood(330, 500, 300, 50, 6)}<text x="640" y="680" font-family="Georgia, serif" font-size="70" fill="#6E3F25" text-anchor="middle">Livraison</text>`,
]

const PROCESS_SVG = (t, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1200" preserveAspectRatio="xMidYMid slice">${defs(t)}<rect width="1600" height="1200" fill="url(#wall)"/><rect width="1600" height="1200" fill="url(#glow)"/><g filter="url(#shadow)">${body}</g></svg>`

/* ------------------------------------------------------------------ */
/*  Écriture des fichiers                                              */
/* ------------------------------------------------------------------ */
const files = {}
for (const [name, draw] of Object.entries(FURNITURE)) {
  files[`demo/${name}.svg`] = scene(TONES.a, draw())
  files[`demo/${name}-b.svg`] = scene(TONES.b, draw())
}
files['demo/hero.svg'] = scene(TONES.dark, FURNITURE.table())
files['demo/atelier.svg'] = ATELIER(TONES.a)
PROCESS.forEach((draw, i) => (files[`demo/process-${i + 1}.svg`] = PROCESS_SVG(i % 2 ? TONES.b : TONES.a, draw())))
files['demo/avant-1.svg'] = scene(TONES.worn, WORN(BUFFET()))
files['demo/apres-1.svg'] = scene(TONES.a, BUFFET())
files['demo/avant-2.svg'] = scene(TONES.worn, WORN(FURNITURE.porte()))
files['demo/apres-2.svg'] = scene(TONES.a, FURNITURE.porte())
files['demo/avant-3.svg'] = scene(TONES.worn, WORN(CHAIR()))
files['demo/apres-3.svg'] = scene(TONES.b, CHAIR())

for (const [path, svg] of Object.entries(files)) {
  await writeFile(new URL(path, root), svg.replace(/\n\s*/g, '\n'))
}

/* ---- Icônes : monogramme sur fond noyer ---- */
const letter = config.businessName.replace(/^(l['’]|le |la |les )/i, '').charAt(0).toUpperCase()
const iconSvg = (size, safe = 1) => {
  const r = safe < 1 ? 0 : size * 0.22
  const fs = size * 0.56 * safe
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4A3424"/><stop offset="1" stop-color="#2B1E15"/></linearGradient></defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#g)"/>
  <rect x="${size * (0.5 - 0.3 * safe)}" y="${size * (0.5 + 0.26 * safe)}" width="${size * 0.6 * safe}" height="${size * 0.035}" rx="${size * 0.017}" fill="#C8A27A"/>
  <text x="50%" y="${size * (0.5 + 0.18 * safe)}" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="${fs}" fill="#FAF6EF" text-anchor="middle">${letter}</text>
</svg>`
}

await writeFile(new URL('favicon.svg', root), iconSvg(64))
await sharp(Buffer.from(iconSvg(192))).png().toFile(fileURLToPath(new URL('icons/icon-192.png', root)))
await sharp(Buffer.from(iconSvg(512))).png().toFile(fileURLToPath(new URL('icons/icon-512.png', root)))
await sharp(Buffer.from(iconSvg(512, 0.72))).png().toFile(fileURLToPath(new URL('icons/icon-maskable-512.png', root)))
await sharp(Buffer.from(iconSvg(180, 0.85).replace(/rx="[\d.]+"/, 'rx="0"'))).png().toFile(fileURLToPath(new URL('icons/apple-touch-icon.png', root)))

/* ---- Image de partage Open Graph 1200×630 ---- */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
${defs(TONES.dark)}
<rect width="1200" height="630" fill="#2B1E15"/>
<g transform="translate(560 40) scale(0.48)">${FURNITURE.table()}</g>
<rect width="1200" height="630" fill="url(#grain)" opacity=".6"/>
<rect width="760" height="630" fill="#2B1E15" opacity=".85"/>
<rect x="72" y="96" width="64" height="4" fill="#C8A27A"/>
<text x="72" y="160" font-family="Georgia, serif" font-size="30" fill="#C8A27A">Menuisier à ${esc(config.city)}</text>
<text x="72" y="250" font-family="Georgia, serif" font-weight="700" font-size="68" fill="#FAF6EF">${esc(config.businessName)}</text>
<text x="72" y="340" font-family="Georgia, serif" font-size="40" fill="#E9DCC8">${esc(config.heroTitle)}</text>
<text x="72" y="400" font-family="Arial, sans-serif" font-size="26" fill="#CDBBA3">Meubles, portes, cuisines sur mesure</text>
<rect x="72" y="470" width="420" height="72" rx="36" fill="#1E5B3A"/>
<text x="282" y="516" font-family="Arial, sans-serif" font-weight="700" font-size="26" fill="#FFFFFF" text-anchor="middle">Devis gratuit sur WhatsApp</text>
</svg>`
await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile(fileURLToPath(new URL('og-image.png', root)))

console.log(`✔ ${Object.keys(files).length} images de démo, icônes PWA et og-image.png générées.`)
