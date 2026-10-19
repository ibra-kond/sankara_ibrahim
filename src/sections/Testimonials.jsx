import { useRef, useState } from 'react'
import { useSite } from '../context/SiteContext'
import { Photo, SectionCta, SectionHeading, Stars } from '../components/ui'
import Icon from '../components/Icon'

/** 8. Témoignages : carrousel à balayage + flèches + points */
export default function Testimonials() {
  const { testimonials } = useSite()
  const track = useRef(null)
  const [active, setActive] = useState(0)
  if (!testimonials.length) return null

  const go = (i) => {
    const el = track.current
    const card = el?.children[i]
    if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: 'smooth' })
  }
  const onScroll = (e) => {
    const el = e.currentTarget
    const w = el.children[0]?.clientWidth || 1
    setActive(Math.min(testimonials.length - 1, Math.round(el.scrollLeft / w)))
  }

  return (
    <section id="avis" className="section wood-grain bg-sand/50" aria-roledescription="carrousel">
      <div className="container-site">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading eyebrow="Avis clients" title="Ils ont franchi le pas." />
          <div className="mb-10 hidden gap-2 sm:flex">
            <button type="button" onClick={() => go(Math.max(0, active - 1))} aria-label="Avis précédent" className="grid h-12 w-12 place-items-center rounded-full border border-line bg-surface hover:border-oak">
              <Icon name="chevronLeft" />
            </button>
            <button type="button" onClick={() => go(Math.min(testimonials.length - 1, active + 1))} aria-label="Avis suivant" className="grid h-12 w-12 place-items-center rounded-full border border-line bg-surface hover:border-oak">
              <Icon name="chevronRight" />
            </button>
          </div>
        </div>

        <ul ref={track} onScroll={onScroll} className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0">
          {testimonials.map((t, i) => (
            <li
              key={t.id}
              aria-roledescription="diapositive"
              aria-label={`${i + 1} sur ${testimonials.length}`}
              className="card flex w-[88%] shrink-0 snap-start flex-col overflow-hidden sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)]"
            >
              {t.photos?.[0] && <Photo photo={t.photos[0]} alt={`Réalisation pour ${t.name}`} className="aspect-[16/9]" sizes="(min-width:1024px) 33vw, 88vw" />}
              <blockquote className="flex flex-1 flex-col p-6">
                <Stars value={t.rating || 5} />
                <p className="mt-3 flex-1 text-lg leading-relaxed">« {t.text} »</p>
                <footer className="mt-5 text-sm">
                  <cite className="not-italic font-semibold">{t.name}</cite>
                  {t.district && <span className="text-muted"> · {t.district}</span>}
                </footer>
              </blockquote>
            </li>
          ))}
        </ul>

        {testimonials.length > 1 && (
          <div className="mt-4 flex justify-center gap-1 lg:hidden">
            {testimonials.map((_, i) => (
              <button key={i} type="button" onClick={() => go(i)} aria-label={`Avis ${i + 1}`} aria-current={active === i} className="grid h-8 w-8 place-items-center">
                <span className={`block h-2 rounded-full transition-all duration-300 ${active === i ? 'w-5 bg-ink' : 'w-2 bg-ink/30'}`} />
              </button>
            ))}
          </div>
        )}

        <SectionCta text="Rejoignez-les : parlez-moi de votre projet." />
      </div>
    </section>
  )
}
