import { useEffect, useState } from 'react'
import { useSite } from '../context/SiteContext'
import { useInView } from '../hooks/useReveal'
import { prefersReducedMotion } from '../lib/utils'

/** Compteur animé au défilement */
function Counter({ value, suffix = '', label }) {
  const [ref, visible] = useInView()
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!visible) return
    if (prefersReducedMotion()) return setN(value)
    const duration = 1600
    const start = performance.now()
    let raf
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration)
      setN(Math.round(value * (1 - Math.pow(1 - p, 3)))) // easeOutCubic
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visible, value])

  return (
    <div ref={ref} className="text-center">
      <p className="font-serif text-4xl font-semibold tabular-nums sm:text-5xl" aria-hidden="true">
        {new Intl.NumberFormat('fr-FR').format(n)}
        <span className="text-oak">{suffix}</span>
      </p>
      <p className="sr-only">{`${value}${suffix} ${label}`}</p>
      <p className="mt-2 text-sm text-muted sm:text-base" aria-hidden="true">{label}</p>
    </div>
  )
}

/** 2. Chiffres clés */
export default function Stats() {
  const { settings } = useSite()
  const s = settings.stats || {}
  const items = [
    { value: Number(s.projects) || 0, suffix: '+', label: 'projets livrés' },
    { value: Number(settings.yearsExperience) || 0, suffix: ' ans', label: 'd’expérience' },
    { value: Number(s.clients) || 0, suffix: '+', label: 'clients satisfaits' },
    { value: Number(s.onTimeRate) || 0, suffix: ' %', label: 'livrés dans les délais' },
  ].filter((i) => i.value > 0)

  return (
    <section aria-label="Chiffres clés" className="wood-grain border-b border-line bg-sand/60 py-12 sm:py-16">
      <div className="container-site grid grid-cols-2 gap-y-10 md:grid-cols-4">
        {items.map((i) => (
          <Counter key={i.label} {...i} />
        ))}
      </div>
    </section>
  )
}
