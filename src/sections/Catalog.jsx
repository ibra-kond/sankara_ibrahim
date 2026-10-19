import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSite } from '../context/SiteContext'
import { Photo, Reveal, SectionCta, SectionHeading } from '../components/ui'
import Icon from '../components/Icon'
import { waItem } from '../lib/whatsapp'
import { itemPrice } from '../lib/utils'

const BADGE_STYLE = {
  Nouveau: 'bg-[#FAF6EF] text-[#2B1E15]',
  Populaire: 'bg-[#2B1E15] text-[#FAF6EF]',
  Disponible: 'bg-[#E9DCC8] text-[#2B1E15]',
}

/** Carte d'une création */
function CreationCard({ item, index }) {
  const { settings } = useSite()
  const category = settings.categories.find((c) => c.id === item.category)?.label
  return (
    <Reveal as="li" delay={(index % 3) * 70} className="group card flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lift">
      <Link to={`/realisations/${item.slug}`} className="relative block" aria-label={`Voir ${item.title}`}>
        <Photo
          photo={item.photos?.[0]}
          alt={item.title}
          className="aspect-[4/3]"
          imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
        {item.badge && (
          <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-soft ${BADGE_STYLE[item.badge] || BADGE_STYLE.Nouveau}`}>
            {item.badge}
          </span>
        )}
        {item.photos?.length > 1 && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
            <Icon name="image" size={14} /> {item.photos.length}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {category && <p className="eyebrow mb-1.5 !tracking-[0.14em]">{category}</p>}
        <h3 className="text-xl font-semibold leading-snug">
          <Link to={`/realisations/${item.slug}`} className="hover:underline decoration-oak decoration-2 underline-offset-4">
            {item.title}
          </Link>
        </h3>
        <p className="line-clamp-2 mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
        <p className="mt-4 font-serif text-2xl font-semibold">{itemPrice(item, settings.currency)}</p>
        <a
          href={waItem(settings, item)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cta mt-4 w-full"
          aria-label={`Commander « ${item.title} » sur WhatsApp`}
        >
          <Icon name="whatsapp" size={20} /> Je veux ce meuble
        </a>
      </div>
    </Reveal>
  )
}

function SkeletonCard() {
  return (
    <li className="card overflow-hidden" aria-hidden="true">
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-12 w-full rounded-full" />
      </div>
    </li>
  )
}

/** 3. Réalisations / Catalogue filtrable */
export default function Catalog() {
  const { settings, creations, loading, error, reload } = useSite()
  const [cat, setCat] = useState('all')
  const [query, setQuery] = useState('')

  // Seules les catégories qui contiennent au moins une création sont proposées (loi de Hick)
  const cats = useMemo(
    () => settings.categories.filter((c) => creations.some((i) => i.category === c.id)),
    [settings.categories, creations],
  )

  const list = useMemo(() => {
    const q = query.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    return creations.filter((i) => {
      if (cat !== 'all' && i.category !== cat) return false
      if (!q) return true
      const hay = `${i.title} ${i.description} ${i.wood || ''}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      return hay.includes(q)
    })
  }, [creations, cat, query])

  return (
    <section id="realisations" className="section">
      <div className="container-site">
        <SectionHeading eyebrow="Réalisations" title="Des pièces livrées, pas des promesses.">
          Chaque meuble ci-dessous est sorti de l’atelier. Touchez une photo pour voir les détails.
        </SectionHeading>

        {/* Filtres + recherche */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Filtrer par catégorie" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
            {[{ id: 'all', label: 'Tout' }, ...cats].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.id)}
                aria-pressed={cat === c.id}
                className={`min-h-[44px] shrink-0 rounded-full border px-4 text-sm font-medium transition-colors duration-200 ${
                  cat === c.id ? 'border-ink bg-ink text-bg' : 'border-line bg-surface hover:border-oak'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <label className="relative block lg:w-72">
            <span className="sr-only">Rechercher une réalisation</span>
            <Icon name="search" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher : table, porte…"
              className="h-12 w-full rounded-full border border-line bg-surface pl-11 pr-4 text-base placeholder:text-muted/80 focus:border-oak focus:outline-none"
            />
          </label>
        </div>

        {/* Grille */}
        {loading ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Chargement des réalisations">
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </ul>
        ) : error ? (
          <div className="card mx-auto max-w-md p-8 text-center">
            <Icon name="wifiOff" size={32} className="mx-auto text-muted" />
            <p className="mt-3 font-semibold">{error}</p>
            <p className="mt-1 text-sm text-muted">Vérifiez votre connexion internet.</p>
            <button type="button" onClick={reload} className="btn-ghost mt-5">Réessayer</button>
          </div>
        ) : list.length === 0 ? (
          <div className="card mx-auto max-w-md p-8 text-center">
            <Icon name="search" size={32} className="mx-auto text-muted" />
            <p className="mt-3 font-semibold">Aucune réalisation ne correspond.</p>
            <p className="mt-1 text-sm text-muted">Ce que vous cherchez n’est pas encore ici ? Je le fabrique sur mesure.</p>
            <button type="button" onClick={() => { setCat('all'); setQuery('') }} className="btn-ghost mt-5">
              Voir toutes les réalisations
            </button>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((item, i) => <CreationCard key={item.id} item={item} index={i} />)}
          </ul>
        )}

        <SectionCta text="Un modèle vous plaît, mais en d’autres dimensions ?" />
      </div>
    </section>
  )
}
