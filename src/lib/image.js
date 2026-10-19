/**
 * Compression des photos dans le navigateur, AVANT l'envoi :
 * - redimensionnement (1600 px max pour la grande image, 640 px pour la vignette)
 * - conversion en WebP (JPEG en secours si le navigateur ne sait pas encoder le WebP)
 * Une photo de 5 Mo prise au téléphone passe ainsi à ~150–300 Ko.
 */
async function loadImage(file) {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      /* repli ci-dessous */
    }
  }
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image illisible'))
    img.src = URL.createObjectURL(file)
  })
}

function toBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

async function resize(source, maxWidth, quality) {
  const ratio = Math.min(1, maxWidth / source.width)
  const w = Math.round(source.width * ratio)
  const h = Math.round(source.height * ratio)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, w, h)
  let blob = await toBlob(canvas, 'image/webp', quality)
  // Safari ancien : toBlob renvoie du PNG si le WebP n'est pas supporté
  if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg', quality)
  return blob
}

/** Renvoie { full, thumb } (Blobs compressés) */
export async function compressImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('Ce fichier n’est pas une photo.')
  const source = await loadImage(file)
  const [full, thumb] = await Promise.all([resize(source, 1600, 0.8), resize(source, 640, 0.75)])
  if (source.close) source.close()
  return { full, thumb }
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(blob)
  })
}
