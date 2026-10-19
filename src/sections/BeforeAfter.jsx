import { useState } from 'react'
import { useSite } from '../context/SiteContext'
import { Reveal, SectionCta, SectionHeading } from '../components/ui'
import Icon from '../components/Icon'

/** Curseur de comparaison accessible (un input range pilote le découpage) */
function Compare({ item }) {
  const [pos, setPos] = useState(50)
  const before = item.before?.[0]
  const after = item.after?.[0]
  if (!before || !after) return null

  return (
    <figure>
      <div className="relative aspect-[4/3] select-none overflow-hidden rounded-xl2 bg-sand shadow-soft">
        <img src={after.src} srcSet={after.thumb !== after.src ? `${after.thumb} 640w, ${after.src} 1600w` : undefined} sizes="(min-width:1024px) 33vw, 100vw" alt={`Après : ${item.title}`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        <img
          src={before.src}
          alt={`Avant : ${item.title}`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        />
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">Avant</span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#2B1E15]">Après</span>
        {/* Poignée */}
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }} aria-hidden="true">
          <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#2B1E15] shadow-lift">
            <Icon name="chevronLeft" size={16} strokeWidth={2.4} className="-mr-1" />
            <Icon name="chevronRight" size={16} strokeWidth={2.4} className="-ml-1" />
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={`Comparer avant et après : ${item.title}`}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="mt-3 text-sm font-medium">{item.title}</figcaption>
    </figure>
  )
}

/** 6. Avant / Après */
export default function BeforeAfter() {
  const { beforeAfter } = useSite()
  if (!beforeAfter.length) return null
  return (
    <section id="avant-apres" className="section">
      <div className="container-site">
        <SectionHeading eyebrow="Avant / Après" title="Faites glisser. Jugez par vous-même." />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {beforeAfter.map((b, i) => (
            <Reveal key={b.id} delay={(i % 3) * 70}>
              <Compare item={b} />
            </Reveal>
          ))}
        </div>
        <SectionCta text="Un meuble abîmé ? Il a peut-être encore de belles années devant lui." />
      </div>
    </section>
  )
}
