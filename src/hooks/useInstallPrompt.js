import { useEffect, useState } from 'react'

/**
 * Gère l'invitation à installer l'application.
 * - Android / Chrome : capture l'événement beforeinstallprompt.
 * - iPhone / iPad : pas d'événement, on affiche des instructions manuelles.
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true)
  const isIOS =
    typeof navigator !== 'undefined' &&
    (/iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferred(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!deferred) return false
    deferred.prompt()
    const { outcome } = await deferred.userChoice
    setDeferred(null)
    return outcome === 'accepted'
  }

  return { canInstall: Boolean(deferred), isIOS, isStandalone, install }
}
