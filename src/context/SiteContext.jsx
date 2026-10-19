import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import config from '../config'
import { fetchPublic, fetchSettings } from '../lib/api'

/**
 * Données publiques du site (réglages + contenus).
 * Affichage progressif : on montre d'abord la dernière version mise en cache
 * dans le navigateur, puis on rafraîchit depuis le réseau.
 */
const CACHE_KEY = 'atelier-cache-v1'
const SiteContext = createContext(null)

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || null
  } catch {
    return null
  }
}

export function SiteProvider({ children }) {
  const cached = readCache()
  const [state, setState] = useState({
    settings: { ...config, ...(cached?.settings || {}) },
    creations: cached?.creations || [],
    services: cached?.services || [],
    testimonials: cached?.testimonials || [],
    beforeAfter: cached?.beforeAfter || [],
    loading: !cached,
    error: null,
  })

  const load = useCallback(async () => {
    try {
      const [settings, creations, services, testimonials, beforeAfter] = await Promise.all([
        fetchSettings(),
        fetchPublic('creations'),
        fetchPublic('services'),
        fetchPublic('testimonials'),
        fetchPublic('before_after'),
      ])
      const data = { settings, creations, services, testimonials, beforeAfter }
      setState({ ...data, loading: false, error: null })
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data))
      } catch {
        /* cache plein : sans gravité */
      }
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: s.creations.length ? null : 'Impossible de charger les réalisations.' }))
    }
  }, [])

  useEffect(() => {
    load()
    // Rafraîchit quand on revient sur l'onglet (ex. après une publication depuis l'admin)
    const onVisible = () => document.visibilityState === 'visible' && load()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [load])

  return <SiteContext.Provider value={{ ...state, reload: load }}>{children}</SiteContext.Provider>
}

export const useSite = () => useContext(SiteContext)
