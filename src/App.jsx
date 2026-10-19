import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SiteProvider } from './context/SiteContext'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import CreationModal from './sections/CreationModal'

// L'espace admin est chargé à part : il n'alourdit pas le site public
const Admin = lazy(() => import('./admin/Admin'))

export default function App() {
  return (
    <SiteProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}>
            <Route path="realisations" element={null} />
            <Route path="realisations/:slug" element={<CreationModal />} />
          </Route>
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<div className="grid min-h-screen place-items-center text-muted">Chargement…</div>}>
                <Admin />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </SiteProvider>
  )
}
