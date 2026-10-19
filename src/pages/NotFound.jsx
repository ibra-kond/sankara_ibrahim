import { Link } from 'react-router-dom'
import { CtaButton } from '../components/ui'

export default function NotFound() {
  return (
    <main className="wood-grain grid min-h-[100svh] place-items-center bg-bg px-4 text-center">
      <div>
        <p className="font-serif text-7xl font-semibold text-oak">404</p>
        <h1 className="mt-4 text-3xl font-semibold">Cette page n’existe pas (encore).</h1>
        <p className="mt-3 text-muted">Mais le meuble que vous cherchez peut être fabriqué sur mesure.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <CtaButton />
          <Link to="/" className="btn-ghost">Retour à l’accueil</Link>
        </div>
      </div>
    </main>
  )
}
