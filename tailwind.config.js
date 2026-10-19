/** @type {import('tailwindcss').Config} */
// Les couleurs sont des variables CSS (voir src/index.css) pour gérer le mode sombre.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: v('bg'),
        surface: v('surface'),
        sand: v('sand'),
        ink: v('ink'),
        muted: v('muted'),
        oak: v('oak'),
        line: v('line'),
        walnut: v('walnut'),
        // Accent EXCLUSIVEMENT réservé aux CTA
        cta: v('cta'),
        'cta-hover': v('cta-hover'),
      },
      fontFamily: {
        serif: ['"Fraunces Variable"', 'Georgia', 'serif'],
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(43 30 21 / .06), 0 8px 24px -8px rgb(43 30 21 / .14)',
        lift: '0 2px 4px rgb(43 30 21 / .08), 0 18px 40px -12px rgb(43 30 21 / .28)',
      },
      borderRadius: { xl2: '1.25rem' },
      maxWidth: { site: '76rem' },
    },
  },
  plugins: [],
}
