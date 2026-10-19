import { useEffect, useRef, useState } from 'react'

/** Renvoie [ref, visible] : visible passe à true quand l'élément entre à l'écran (une seule fois). */
export function useInView(options = { rootMargin: '0px 0px -10% 0px', threshold: 0.15 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) return setVisible(true)
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        io.disconnect()
      }
    }, options)
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return [ref, visible]
}
