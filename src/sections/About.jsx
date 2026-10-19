import { useSite } from '../context/SiteContext'
import { Photo, Reveal } from '../components/ui'

/** 9. À propos */
export default function About() {
  const { settings } = useSite()
  return (
    <section id="apropos" className="section">
      <div className="container-site grid items-center gap-10 md:grid-cols-2 lg:gap-16">
        <Reveal>
          <Photo
            photo={{ src: settings.aboutImage, thumb: settings.aboutImage }}
            alt={`${settings.ownerFirstName} ${settings.ownerLastName} dans son atelier`}
            className="aspect-[4/5] rounded-xl2 shadow-lift"
            sizes="(min-width:768px) 50vw, 100vw"
          />
        </Reveal>
        <Reveal delay={100}>
          <p className="eyebrow mb-3">L’artisan</p>
          <h2 className="h2">{settings.aboutTitle}</h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">{settings.aboutText}</p>
          <p className="mt-6 font-serif text-xl italic">
            — {settings.ownerFirstName} {settings.ownerLastName}
          </p>
          {settings.specialties?.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Spécialités">
              {settings.specialties.map((s) => (
                <li key={s} className="rounded-full border border-line px-3 py-1.5 text-sm">{s}</li>
              ))}
            </ul>
          )}
        </Reveal>
      </div>
    </section>
  )
}
