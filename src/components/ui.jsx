import { useState } from 'react'
import { useInView } from '../hooks/useReveal'
import { useSite } from '../context/SiteContext'
import { waGeneral } from '../lib/whatsapp'
import { photoSrcSet } from '../lib/utils'
import Icon from './Icon'

/** Apparition douce au défilement */
export function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const [ref, visible] = useInView()
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/** Image responsive : lazy loading, srcset, fond « squelette » pendant le chargement */
export function Photo({ photo, alt, sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw', className = '', imgClassName = '', eager = false }) {
  const [loaded, setLoaded] = useState(false)
  if (!photo) return <div className={`skeleton ${className}`} aria-hidden="true" />
  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      <img
        src={photo.src}
        srcSet={photoSrcSet(photo)}
        sizes={sizes}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchpriority={eager ? 'high' : undefined}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
      />
    </div>
  )
}

/** Le CTA principal unique : « Demander mon devis gratuit » → WhatsApp */
export function CtaButton({ label, className = '', large = false }) {
  const { settings } = useSite()
  return (
    <a
      href={waGeneral(settings)}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-cta ${large ? 'min-h-[60px] px-8 text-lg' : ''} ${className}`}
    >
      <Icon name="whatsapp" size={large ? 24 : 20} />
      {label || settings.ctaPrimary}
    </a>
  )
}

/** CTA répété après une section à forte preuve */
export function SectionCta({ text }) {
  return (
    <Reveal className="mt-12 flex flex-col items-center gap-3 text-center">
      {text && <p className="text-muted">{text}</p>}
      <CtaButton />
    </Reveal>
  )
}

export function SectionHeading({ eyebrow, title, children, center = false }) {
  return (
    <Reveal className={`mb-10 max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="h2">{title}</h2>
      {children && <p className="mt-4 text-lg text-muted">{children}</p>}
    </Reveal>
  )
}

export function Stars({ value = 5, size = 18 }) {
  return (
    <div className="flex gap-0.5 text-oak" role="img" aria-label={`${value} étoiles sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star" size={size} className={i <= value ? '' : 'opacity-25'} />
      ))}
    </div>
  )
}

export function SocialLinks({ className = '', size = 20 }) {
  const { settings } = useSite()
  const links = [
    { name: 'whatsapp', label: 'WhatsApp', href: waGeneral(settings) },
    { name: 'facebook', label: 'Facebook', href: settings.facebook },
    { name: 'tiktok', label: 'TikTok', href: settings.tiktok },
  ].filter((l) => l.href)
  return (
    <ul className={`flex items-center gap-1 ${className}`}>
      {links.map((l) => (
        <li key={l.name}>
          <a
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${l.label} (nouvel onglet)`}
            className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-oak/15 hover:text-oak"
          >
            <Icon name={l.name} size={size} />
          </a>
        </li>
      ))}
    </ul>
  )
}
