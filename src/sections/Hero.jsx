import { useSite } from '../context/SiteContext'
import { CtaButton } from '../components/ui'
import Icon from '../components/Icon'

/** 1. Hero plein écran : la réalisation phare parle d'elle-même */
export default function Hero() {
  const { settings } = useSite()
  return (
    <section id="accueil" className="relative flex min-h-[100svh] items-end overflow-hidden bg-walnut text-white">
      {settings.heroVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={settings.heroVideo}
          poster={settings.heroImage}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      ) : (
        <img
          src={settings.heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          fetchpriority="high"
          decoding="async"
        />
      )}
      {/* Voile sombre pour la lisibilité (contraste AA garanti sur le texte) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#140E09] via-[#140E09]/70 to-[#140E09]/30" aria-hidden="true" />

      <div className="container-site relative pb-28 pt-28 md:pb-24">
        <div className="max-w-3xl">
          <p className="eyebrow animate-fade-up !text-[#E9DCC8]">
            Menuisier à {settings.city} · {settings.yearsExperience} ans de métier
          </p>
          <h1 className="animate-fade-up mt-4 text-[2.6rem] font-semibold leading-[1.05] [animation-delay:80ms] sm:text-6xl lg:text-7xl">
            {settings.heroTitle}
          </h1>
          <p className="animate-fade-up mt-5 max-w-xl text-lg text-[#F1E8DA] [animation-delay:160ms] sm:text-xl">
            {settings.heroSubtitle}
          </p>
          <div className="animate-fade-up mt-8 flex flex-col gap-3 [animation-delay:240ms] sm:flex-row">
            <CtaButton large />
            <a href="#realisations" className="btn-light min-h-[60px] px-8 text-lg">
              Voir les réalisations
              <Icon name="arrowDown" size={20} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
