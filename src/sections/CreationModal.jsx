import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSite } from '../context/SiteContext'
import Icon from '../components/Icon'
import { Photo } from '../components/ui'
import { waItem } from '../lib/whatsapp'
import { itemPrice } from '../lib/utils'

/** Visionneuse plein écran avec zoom (toucher/clic pour zoomer, glisser pour explorer) */
function ZoomViewer({ photos, start, title, onClose }) {
  const [index, setIndex] = useState(start)
  const [zoom, setZoom] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')
  const touch = useRef(null)
  const photo = photos[index]

  const go = (d) => {
    setZoom(false)
    setIndex((i) => (i + d + photos.length) % photos.length)
  }
  const setOriginFrom = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black/95 text-white" role="dialog" aria-modal="true" aria-label={`Photos : ${title}`}>
      <div className="flex items-center justify-between p-2">
        <p className="px-3 text-sm tabular-nums">{index + 1} / {photos.length}</p>
        <button type="button" onClick={onClose} aria-label="Fermer la visionneuse" className="grid h-12 w-12 place-items-center rounded-full hover:bg-white/10">
          <Icon name="x" />
        </button>
      </div>
      <div
        className="relative flex-1 overflow-hidden"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (zoom || touch.current == null) return
          const dx = e.changedTouches[0].clientX - touch.current
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
          touch.current = null
        }}
      >
        <img
          src={photo.src}
          alt={`${title} — photo ${index + 1}`}
          onClick={(e) => {
            setOriginFrom(e)
            setZoom((z) => !z)
          }}
          onPointerMove={(e) => zoom && e.pointerType === 'mouse' && setOriginFrom(e)}
          onTouchMove={(e) => {
            if (!zoom) return
            const t = e.touches[0]
            const r = e.currentTarget.getBoundingClientRect()
            setOrigin(`${((t.clientX - r.left) / r.width) * 100}% ${((t.clientY - r.top) / r.height) * 100}%`)
          }}
          style={{ transformOrigin: origin, transform: zoom ? 'scale(2.4)' : 'none' }}
          className={`h-full w-full select-none object-contain transition-transform duration-300 ${zoom ? 'cursor-zoom-out touch-none' : 'cursor-zoom-in'}`}
          draggable="false"
        />
        {photos.length > 1 && !zoom && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Photo précédente" className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-black/50 hover:bg-black/70">
              <Icon name="chevronLeft" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Photo suivante" className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-black/50 hover:bg-black/70">
              <Icon name="chevronRight" />
            </button>
          </>
        )}
      </div>
      <p className="p-4 text-center text-xs text-white/70">{zoom ? 'Glissez pour explorer · touchez pour dézoomer' : 'Touchez la photo pour zoomer'}</p>
    </div>
  )
}

/** 4. Fiche détail d'une création (modale avec URL lisible /realisations/:slug) */
export default function CreationModal() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { settings, creations, loading } = useSite()
  const item = creations.find((c) => c.slug === slug)
  const [slide, setSlide] = useState(0)
  const [viewer, setViewer] = useState(null)
  const track = useRef(null)
  const dialog = useRef(null)
  const lastFocus = useRef(document.activeElement)

  const close = () => navigate('/', { preventScrollReset: true })

  // Verrouillage du défilement, focus et touche Échap
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.focus()
    const focusBack = lastFocus.current
    return () => {
      document.body.style.overflow = prevOverflow
      focusBack?.focus?.()
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && viewer === null) close()
      // Piège à focus simple
      if (e.key === 'Tab' && dialog.current && viewer === null) {
        const f = dialog.current.querySelectorAll('a[href],button:not([disabled])')
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Titre de l'onglet
  useEffect(() => {
    if (!item) return
    const prev = document.title
    document.title = `${item.title} – ${itemPrice(item, settings.currency)} | ${settings.businessName}`
    return () => { document.title = prev }
  }, [item, settings])

  const scrollTo = (i) => {
    const el = track.current
    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: 'smooth' })
  }

  const photos = item?.photos || []
  const category = item && settings.categories.find((c) => c.id === item.category)?.label
  const details = item
    ? [
        ['Dimensions', item.dimensions],
        ['Essence de bois', item.wood],
        ['Délai indicatif', item.lead_time],
      ].filter(([, v]) => v)
    : []

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="absolute inset-0 -z-10 animate-[fade-up_.2s_ease-out] bg-[#140E09]/70 backdrop-blur-sm" aria-hidden="true" />
      <div
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="creation-title"
        className="animate-fade-up relative flex max-h-[94svh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-surface shadow-lift outline-none sm:rounded-3xl md:flex-row"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white backdrop-blur hover:bg-black/75"
        >
          <Icon name="x" />
        </button>

        {!item ? (
          <div className="p-10 text-center">
            {loading ? (
              <div className="skeleton mx-auto h-64 w-full max-w-md rounded-xl" />
            ) : (
              <>
                <p id="creation-title" className="font-serif text-2xl font-semibold">Cette réalisation n’est plus en ligne.</p>
                <button type="button" onClick={close} className="btn-ghost mt-6">Voir les autres réalisations</button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Galerie : balayage horizontal */}
            <div className="relative shrink-0 md:w-3/5">
              <div
                ref={track}
                onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
                className="no-scrollbar flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto md:aspect-auto md:h-full"
              >
                {photos.map((ph, i) => (
                  <button
                    key={ph.src + i}
                    type="button"
                    onClick={() => setViewer(i)}
                    className="relative h-full w-full shrink-0 snap-center cursor-zoom-in"
                    aria-label={`Agrandir la photo ${i + 1}`}
                  >
                    <Photo photo={ph} alt={`${item.title} — photo ${i + 1}`} className="h-full w-full" sizes="(min-width: 768px) 60vw, 100vw" eager={i === 0} />
                  </button>
                ))}
              </div>
              <span className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white">
                <Icon name="zoom" size={14} /> Zoom
              </span>
              {photos.length > 1 && (
                <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => scrollTo(i)}
                      aria-label={`Photo ${i + 1}`}
                      aria-current={slide === i}
                      className="grid h-6 w-6 place-items-center"
                    >
                      <span className={`block h-2 rounded-full transition-all duration-300 ${slide === i ? 'w-5 bg-white' : 'w-2 bg-white/60'}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informations */}
            <div className="flex flex-1 flex-col overflow-y-auto p-6 sm:p-8">
              {category && <p className="eyebrow">{category}</p>}
              <h2 id="creation-title" className="mt-2 text-3xl font-semibold leading-tight">{item.title}</h2>
              <p className="mt-3 font-serif text-3xl font-semibold">{itemPrice(item, settings.currency)}</p>
              <p className="mt-4 leading-relaxed text-muted">{item.description}</p>

              {details.length > 0 && (
                <dl className="mt-6 divide-y divide-line border-y border-line">
                  {details.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-3 text-sm">
                      <dt className="text-muted">{k}</dt>
                      <dd className="text-right font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="mt-auto pt-8">
                <a href={waItem(settings, item)} target="_blank" rel="noopener noreferrer" className="btn-cta min-h-[56px] w-full text-lg">
                  <Icon name="whatsapp" size={22} /> Je veux ce meuble
                </a>
                <p className="mt-3 text-center text-xs text-muted">Devis gratuit • Dimensions adaptables</p>
              </div>
            </div>
          </>
        )}
      </div>

      {viewer !== null && <ZoomViewer photos={photos} start={viewer} title={item.title} onClose={() => setViewer(null)} />}
    </div>
  )
}
