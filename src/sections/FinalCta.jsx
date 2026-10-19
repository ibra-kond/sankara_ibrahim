import { useSite } from '../context/SiteContext'
import { CtaButton, Reveal, SocialLinks } from '../components/ui'

/** 10. CTA final plein écran */
export default function FinalCta() {
  const { settings } = useSite()
  return (
    <section id="contact" className="relative flex min-h-[80svh] items-center overflow-hidden bg-walnut text-white">
      <img src={settings.heroImage} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#140E09]/80 to-[#140E09]" aria-hidden="true" />
      <Reveal className="container-site relative py-24 text-center">
        <p className="eyebrow !text-[#E9DCC8]">Lancez votre projet aujourd’hui</p>
        <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">{settings.finalCtaTitle}</h2>
        <div className="mt-10 flex justify-center">
          <CtaButton large className="w-full max-w-md sm:w-auto" />
        </div>
        <p className="mt-5 text-sm text-[#E9DCC8]">{settings.finalCtaReassurance}</p>
        <div className="mt-10 flex flex-col items-center gap-2 text-sm text-[#E9DCC8]">
          <p>Suivez l’atelier</p>
          <SocialLinks className="text-white" size={22} />
        </div>
      </Reveal>
    </section>
  )
}
