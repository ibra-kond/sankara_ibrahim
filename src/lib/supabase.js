// Connexion Supabase. Sans ces variables, le site fonctionne en « mode démo »
// (données de démonstration stockées dans le navigateur).
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
export const isSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY)
export const MEDIA_BUCKET = 'media'

let clientPromise
/** Client Supabase chargé à la demande (uniquement dans l'admin) pour alléger le site public. */
export function getClient() {
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true } }),
    )
  }
  return clientPromise
}

/** Lecture publique légère via l'API REST (sans charger la librairie Supabase). */
export async function restGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  })
  if (!res.ok) throw new Error(`Erreur ${res.status}`)
  return res.json()
}
