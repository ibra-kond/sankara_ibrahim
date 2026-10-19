import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav, Footer, Header, InstallBanner, WhatsAppFab } from '../components/Layout'
import Hero from '../sections/Hero'
import Stats from '../sections/Stats'
import Catalog from '../sections/Catalog'
import Services from '../sections/Services'
import BeforeAfter from '../sections/BeforeAfter'
import Process from '../sections/Process'
import Testimonials from '../sections/Testimonials'
import About from '../sections/About'
import FinalCta from '../sections/FinalCta'

/** Page d'accueil : toutes les sections, la fiche détail s'ouvre par-dessus (<Outlet />) */
export default function Home() {
  const { pathname, hash } = useLocation()

  // Ancre à l'arrivée (/#services) et adresse /realisations
  useEffect(() => {
    const id = hash ? hash.slice(1) : pathname === '/realisations' ? 'realisations' : null
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <a href="#realisations" className="sr-only z-[80] rounded-full bg-surface px-4 py-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Aller aux réalisations
      </a>
      <Header />
      <main>
        <Hero />
        <Stats />
        <Catalog />
        <Services />
        <BeforeAfter />
        <Process />
        <Testimonials />
        <About />
        <FinalCta />
      </main>
      <Footer />
      <WhatsAppFab />
      <BottomNav />
      <InstallBanner />
      <Outlet />
    </>
  )
}
