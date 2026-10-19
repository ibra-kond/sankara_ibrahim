import { useRef, useState } from 'react'
import Icon from '../components/Icon'
import { uploadPhoto } from '../lib/api'
import { Spinner } from './ui'

/**
 * Ajout de photos depuis le téléphone :
 * - « Prendre une photo » ouvre directement l'appareil photo
 * - « Galerie » permet d'en choisir plusieurs
 * Chaque photo est compressée (WebP, 1600 px max) puis envoyée.
 */
export default function PhotoInput({ value = [], onChange, max = 8, folder, onBusy }) {
  const cameraRef = useRef(null)
  const galleryRef = useRef(null)
  const [pending, setPending] = useState(0)
  const [error, setError] = useState('')
  const remaining = max - value.length

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []).slice(0, remaining)
    if (!files.length) return
    setError('')
    setPending(files.length)
    onBusy?.(true)
    let current = value
    for (const file of files) {
      try {
        const photo = await uploadPhoto(file, folder)
        current = [...current, photo]
        onChange(current)
      } catch (e) {
        setError(e.message || 'Une photo n’a pas pu être ajoutée.')
      }
      setPending((n) => n - 1)
    }
    onBusy?.(false)
  }

  const remove = (i) => onChange(value.filter((_, idx) => idx !== i))
  const makeMain = (i) => onChange([value[i], ...value.filter((_, idx) => idx !== i)])

  return (
    <div>
      {(value.length > 0 || pending > 0) && (
        <ul className="mb-3 grid grid-cols-3 gap-2">
          {value.map((p, i) => (
            <li key={p.src + i} className="relative aspect-square overflow-hidden rounded-xl bg-sand">
              <img src={p.thumb || p.src} alt="" className="h-full w-full object-cover" />
              {i === 0 && max > 1 && (
                <span className="absolute inset-x-0 bottom-0 bg-black/65 py-1 text-center text-xs font-semibold text-white">Principale</span>
              )}
              {i > 0 && (
                <button type="button" onClick={() => makeMain(i)} className="absolute inset-x-0 bottom-0 min-h-[32px] bg-black/50 text-xs font-semibold text-white">
                  Mettre en 1er
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Retirer la photo ${i + 1}`}
                className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-full bg-black/65 text-white"
              >
                <Icon name="x" size={18} />
              </button>
            </li>
          ))}
          {Array.from({ length: pending }).map((_, i) => (
            <li key={`p${i}`} className="skeleton grid aspect-square place-items-center rounded-xl text-muted">
              <Spinner />
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => cameraRef.current?.click()} disabled={pending > 0} className="btn min-h-[64px] flex-col gap-1 rounded-2xl border-2 border-dashed border-oak bg-oak/10 text-sm">
            <Icon name="camera" size={26} /> Prendre une photo
          </button>
          <button type="button" onClick={() => galleryRef.current?.click()} disabled={pending > 0} className="btn min-h-[64px] flex-col gap-1 rounded-2xl border-2 border-dashed border-line text-sm">
            <Icon name="image" size={26} /> Galerie
          </button>
        </div>
      )}
      {max > 1 && <p className="mt-2 text-sm text-muted">{value.length} / {max} photos</p>}
      {error && <p role="alert" className="mt-2 text-sm font-semibold text-[#B3392B]">{error}</p>}

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }} />
      <input ref={galleryRef} type="file" accept="image/*" multiple={max > 1} className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }} />
    </div>
  )
}
