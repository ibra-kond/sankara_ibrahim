import { useSite } from '../context/SiteContext'
import { Reveal, SectionHeading } from '../components/ui'
import Icon from '../components/Icon'
import { waService } from '../lib/whatsapp'
import { formatPrice } from '../lib/utils'

/** 5. Services avec prix « à partir de » */
export default function Services() {
  const { settings, services } = useSite()
  if (!services.length) return null

  return (
    <section id="services" className="section wood-grain bg-sand/50">
      <div className="container-site">
        <SectionHeading eyebrow="Services" title="Ce que je fais pour vous" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal as="li" key={s.id} delay={(i % 3) * 70} className="card flex flex-col p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-oak/20 text-ink">
                <Icon name={s.icon || 'tools'} size={24} />
              </span>
              <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.description}</p>
              <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
                <p className="text-sm text-muted">
                  {Number(s.price_from) > 0 ? (
                    <>
                      à partir de
                      <span className="block font-serif text-xl font-semibold text-ink">{formatPrice(s.price_from, settings.currency)}</span>
                    </>
                  ) : (
                    <span className="font-serif text-xl font-semibold text-ink">Gratuit</span>
                  )}
                </p>
                <a
                  href={waService(settings, s)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-1 rounded-full px-2 text-sm font-semibold underline decoration-oak decoration-2 underline-offset-4 hover:text-muted"
                >
                  Parlons-en <Icon name="arrowRight" size={16} />
                </a>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
