import { useSite } from '../context/SiteContext'
import { Photo, Reveal, SectionHeading } from '../components/ui'

/** 7. Le savoir-faire : le processus en images */
export default function Process() {
  const { settings } = useSite()
  const steps = settings.process || []
  return (
    <section id="processus" className="section bg-walnut text-[#F3EBDD]">
      <div className="container-site">
        <Reveal className="mb-10 max-w-2xl">
          <p className="eyebrow mb-3 !text-[#CDBBA3]">Le savoir-faire</p>
          <h2 className="h2 text-white">De votre idée à votre salon, en 5 étapes.</h2>
        </Reveal>
        <ol className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:scroll-px-0 lg:px-0">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 80} className="w-[72%] shrink-0 snap-start sm:w-[40%] lg:w-auto">
              <Photo photo={{ src: s.image, thumb: s.image }} alt={s.title} className="aspect-[4/5] rounded-xl2" sizes="(min-width:1024px) 20vw, 70vw" />
              <p className="mt-4 font-serif text-sm text-oak">Étape {i + 1}</p>
              <h3 className="mt-1 text-xl font-semibold text-white">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#CDBBA3]">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
