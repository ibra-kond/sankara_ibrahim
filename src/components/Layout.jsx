import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSite } from '../context/SiteContext'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { waGeneral } from '../lib/whatsapp'
import Icon from './Icon'
import { CtaButton, SocialLinks } from './ui'

/* ------------------------------------------------------------------ */
/*  Mode sombre                                                        */
/* ------------------------------------------------------------------ */
function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const toggle = () => {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next ? '#0E0A07' : '#2B1E15')
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      /* ignore */
    }
    setDark(next)
  }
  return [dark, toggle]
}

export function ThemeToggle({ className = '' }) {
  const [dark, toggle] = useTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className={`grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-oak/15 ${className}`}
    >
      <Icon name={dark ? 'sun' : 'moon'} size={20} />
    </button>
  )
}

/** Monogramme de l'atelier */
export function Logo({ light = false }) {
  const { settings } = useSite()
  return (
    <Link to="/" className="flex min-h-[44px] items-center gap-2.5" aria-label={`${settings.businessName}, accueil`}>
      <span className={`grid h-9 w-9 place-items-center rounded-lg font-serif text-lg font-bold ${light ? 'bg-white/15 text-white' : 'bg-walnut text-[#FAF6EF]'}`}>
        {settings.businessName.replace(/^(l['’]|le |la |les )/i, '').charAt(0).toUpperCase()}
      </span>
      <span className="font-serif text-lg font-semibold leading-none">{settings.businessName}</span>
    </Link>
  )
}

const NAV = [
  { href: '/#realisations', label: 'Réalisations' },
  { href: '/#services', label: 'Services' },
  { href: '/#avant-apres', label: 'Avant / Après' },
  { href: '/#avis', label: 'Avis' },
  { href: '/#apropos', label: 'L’atelier' },
]

/* ------------------------------------------------------------------ */
/*  En-tête : transparent sur le hero, opaque après défilement          */
/* ------------------------------------------------------------------ */
export function Header() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,color] duration-300 ${
        scrolled ? 'bg-bg/95 text-ink shadow-soft backdrop-blur' : 'bg-transparent text-white'
      }`}
    >
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Logo light={!scrolled} />
        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="rounded-full px-3 py-2.5 text-sm font-medium transition-colors hover:bg-oak/15">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <SocialLinks className="hidden lg:flex" size={18} />
          <ThemeToggle />
          <CtaButton className="hidden !min-h-[44px] !px-5 !py-2 text-sm md:inline-flex" />
        </div>
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------ */
/*  Barre de navigation inférieure (mobile)                             */
/* ------------------------------------------------------------------ */
const BOTTOM = [
  { id: 'accueil', label: 'Accueil', icon: 'home' },
  { id: 'realisations', label: 'Réalisations', icon: 'grid' },
  { id: 'services', label: 'Services', icon: 'tools' },
  { id: 'contact', label: 'Contact', icon: 'chat' },
]

export function BottomNav() {
  const [active, setActive] = useState('accueil')
  useEffect(() => {
    const sections = BOTTOM.map((b) => document.getElementById(b.id)).filter(Boolean)
    if (!sections.length || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  })

  return (
    <nav aria-label="Navigation mobile" className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 backdrop-blur md:hidden">
      <ul className="grid grid-cols-4">
        {BOTTOM.map((b) => {
          const on = active === b.id
          return (
            <li key={b.id}>
              <a
                href={`/#${b.id}`}
                aria-current={on ? 'true' : undefined}
                className={`flex min-h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${on ? 'text-ink' : 'text-muted'}`}
              >
                <span className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${on ? 'bg-oak/25' : ''}`}>
                  <Icon name={b.icon} size={20} />
                </span>
                {b.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/*  Bouton WhatsApp flottant                                           */
/* ------------------------------------------------------------------ */
export function WhatsAppFab() {
  const { settings } = useSite()
  return (
    <a
      href={waGeneral(settings)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${settings.ctaPrimary} sur WhatsApp`}
      className="pulse-soft fixed bottom-[calc(76px+env(safe-area-inset-bottom))] right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-cta text-white shadow-lift transition-transform duration-200 hover:scale-105 hover:bg-cta-hover md:bottom-6 md:right-6 md:h-16 md:w-16"
    >
      <Icon name="whatsapp" size={30} />
    </a>
  )
}

/* ------------------------------------------------------------------ */
/*  Invitation à installer l'application                               */
/* ------------------------------------------------------------------ */
export function InstallBanner() {
  const { canInstall, isIOS, isStandalone, install } = useInstallPrompt()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isStandalone) return
    let dismissed = false
    try {
      dismissed = Number(localStorage.getItem('install-dismissed') || 0) > Date.now() - 14 * 864e5
    } catch {
      /* ignore */
    }
    if (dismissed) return
    const t = setTimeout(() => setShow(true), 8000)
    return () => clearTimeout(t)
  }, [isStandalone])

  const close = () => {
    setShow(false)
    try {
      localStorage.setItem('install-dismissed', String(Date.now()))
    } catch {
      /* ignore */
    }
  }

  if (!show || (!canInstall && !isIOS)) return null

  return (
    <div
      role="dialog"
      aria-label="Installer l’application"
      className="animate-fade-up fixed inset-x-3 bottom-[calc(144px+env(safe-area-inset-bottom))] z-50 mx-auto max-w-md rounded-2xl border border-line bg-surface p-4 text-ink shadow-lift md:bottom-28 md:right-6 md:left-auto"
    >
      <div className="flex items-start gap-3">
        <img src="/icons/icon-192.png" alt="" width="44" height="44" className="rounded-xl" />
        <div className="flex-1 text-sm">
          <p className="font-semibold">Installer l’application</p>
          {isIOS ? (
            <p className="mt-1 text-muted">
              Touchez <Icon name="share" size={16} className="inline -mt-1" /> <strong>Partager</strong>, puis
              « <strong>Sur l’écran d’accueil</strong> ».
            </p>
          ) : (
            <p className="mt-1 text-muted">Retrouvez nos réalisations en un geste, même hors connexion.</p>
          )}
        </div>
        <button type="button" onClick={close} aria-label="Fermer" className="-m-2 grid h-11 w-11 place-items-center rounded-full hover:bg-oak/15">
          <Icon name="x" size={18} />
        </button>
      </div>
      {!isIOS && (
        <button
          type="button"
          onClick={async () => {
            await install()
            close()
          }}
          className="btn-ghost mt-3 w-full !min-h-[44px] text-sm"
        >
          <Icon name="download" size={18} /> Installer
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Pied de page                                                       */
/* ------------------------------------------------------------------ */
export function Footer() {
  const { settings } = useSite()
  const year = new Date().getFullYear()
  return (
    <footer className="bg-walnut pb-28 pt-14 text-[#E9DCC8] md:pb-10">
      <div className="container-site grid gap-10 md:grid-cols-3">
        <div>
          <div className="text-white">
            <Logo light />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#CDBBA3]">
            Menuiserie artisanale à {settings.city}. {settings.specialties?.slice(0, 3).join(', ')}.
          </p>
          <SocialLinks className="-ml-3 mt-4 text-white" />
        </div>
        <address className="not-italic">
          <h2 className="mb-4 font-sans text-sm font-semibold uppercase tracking-widest text-white">Coordonnées</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <Icon name="phone" size={18} className="mt-0.5 shrink-0 text-oak" />
              <a href={`tel:+${settings.whatsapp}`} className="hover:text-white">{settings.phoneDisplay || `+${settings.whatsapp}`}</a>
            </li>
            <li className="flex gap-3">
              <Icon name="pin" size={18} className="mt-0.5 shrink-0 text-oak" />
              <span>
                {settings.address}
                <br />
                <span className="text-[#CDBBA3]">Zone : {settings.serviceArea}</span>
              </span>
            </li>
            <li className="flex gap-3">
              <Icon name="clock" size={18} className="mt-0.5 shrink-0 text-oak" />
              <span>{settings.hours}</span>
            </li>
          </ul>
        </address>
        <div>
          <h2 className="mb-4 font-sans text-sm font-semibold uppercase tracking-widest text-white">Mentions légales</h2>
          <p className="text-xs leading-relaxed text-[#CDBBA3]">{settings.legal}</p>
          <p className="mt-3 text-xs text-[#CDBBA3]">
            {settings.businessName} — {settings.ownerFirstName} {settings.ownerLastName}, {settings.city}, {settings.country}.
          </p>
        </div>
      </div>
      <div className="container-site mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-[#CDBBA3]">
        <p>© {year} {settings.businessName}. Tous droits réservés.</p>
        <Link to="/admin" className="inline-flex min-h-[44px] items-center hover:text-white">Espace atelier</Link>
      </div>
    </footer>
  )
}
