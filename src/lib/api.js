/**
 * Couche d'accès aux données.
 * - Avec Supabase : lecture publique via REST, écriture via le client Supabase (admin connecté).
 * - Sans Supabase : « mode démo » dans le localStorage du navigateur, pour tester le site et l'admin.
 */
import config from '../config'
import { isSupabase, getClient, restGet, MEDIA_BUCKET } from './supabase'
import { demoCreations, demoServices, demoTestimonials, demoBeforeAfter } from './demoData'
import { blobToDataUrl, compressImage } from './image'
import { slugify, uid } from './utils'

export const TABLES = ['creations', 'services', 'testimonials', 'before_after']

/* ------------------------------------------------------------------ */
/*  Mode démo                                                          */
/* ------------------------------------------------------------------ */
const DEMO_KEY = 'atelier-demo-v1'
export const DEMO_LOGIN = { email: 'admin@demo.fr', password: 'demo1234' }

function demoRead() {
  try {
    const raw = localStorage.getItem(DEMO_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* stockage indisponible */
  }
  return {
    settings: {},
    creations: demoCreations,
    services: demoServices,
    testimonials: demoTestimonials,
    before_after: demoBeforeAfter,
  }
}

function demoWrite(db) {
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify(db))
  } catch {
    throw new Error('Mémoire du navigateur pleine (mode démo). Supprimez quelques photos.')
  }
}

const byPosition = (a, b) => (a.position ?? 0) - (b.position ?? 0)

/* ------------------------------------------------------------------ */
/*  Lecture publique                                                   */
/* ------------------------------------------------------------------ */
export async function fetchSettings() {
  if (!isSupabase) return { ...config, ...demoRead().settings }
  const rows = await restGet('settings?id=eq.1&select=data')
  return { ...config, ...(rows[0]?.data || {}) }
}

export async function fetchPublic(table) {
  if (!isSupabase) return demoRead()[table].filter((r) => r.visible).sort(byPosition)
  return restGet(`${table}?select=*&visible=eq.true&order=position.asc,created_at.desc`)
}

/* ------------------------------------------------------------------ */
/*  Authentification                                                   */
/* ------------------------------------------------------------------ */
export async function signIn(email, password) {
  if (!isSupabase) {
    if (email.trim().toLowerCase() === DEMO_LOGIN.email && password === DEMO_LOGIN.password) {
      sessionStorage.setItem('demo-session', '1')
      return { email }
    }
    throw new Error('Email ou mot de passe incorrect.')
  }
  const sb = await getClient()
  const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
  if (error) {
    // Messages précis selon la cause (sans révéler si un email existe ou non)
    const messages = {
      email_not_confirmed: 'Ce compte n’est pas encore confirmé. Dans Supabase > Authentication > Users, confirmez l’utilisateur.',
      over_request_rate_limit: 'Trop de tentatives. Patientez quelques minutes avant de réessayer.',
      user_banned: 'Ce compte est bloqué. Vérifiez-le dans Supabase > Authentication > Users.',
    }
    if (messages[error.code]) throw new Error(messages[error.code])
    if (error.status === 0 || /fetch|network/i.test(error.message)) throw new Error('Pas de connexion internet. Réessayez.')
    throw new Error('Email ou mot de passe incorrect. En cas de doute, utilisez « Mot de passe oublié ? ».')
  }
  return data.user
}

export async function signOut() {
  if (!isSupabase) return sessionStorage.removeItem('demo-session')
  const sb = await getClient()
  await sb.auth.signOut()
}

/* ---- Sécurité du compte ---- */
const DEMO_UNAVAILABLE = 'Indisponible en mode démo : branchez Supabase pour utiliser cette fonction.'

/** Règles d'un mot de passe solide. Renvoie la liste des règles non respectées. */
export function passwordIssues(pwd = '') {
  const issues = []
  if (pwd.length < 10) issues.push('au moins 10 caractères')
  if (!/[a-z]/.test(pwd) || !/[A-Z]/.test(pwd)) issues.push('des majuscules et des minuscules')
  if (!/\d/.test(pwd)) issues.push('au moins un chiffre')
  return issues
}

/** Change le mot de passe après avoir revérifié l'actuel (protège une session laissée ouverte). */
export async function changePassword(email, current, next) {
  if (!isSupabase) throw new Error(DEMO_UNAVAILABLE)
  const sb = await getClient()
  const check = await sb.auth.signInWithPassword({ email, password: current })
  if (check.error) throw new Error('Le mot de passe actuel est incorrect.')
  const { error } = await sb.auth.updateUser({ password: next })
  if (error) throw new Error(error.message.includes('different') ? 'Le nouveau mot de passe doit être différent de l’ancien.' : 'Changement impossible. Réessayez.')
}

/** Envoie l'email « mot de passe oublié ». Réponse identique que l'email existe ou non. */
export async function requestPasswordReset(email) {
  if (!isSupabase) throw new Error(DEMO_UNAVAILABLE)
  const sb = await getClient()
  const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${location.origin}/admin/nouveau-mot-de-passe`,
  })
  if (error && error.status === 429) throw new Error('Trop de demandes. Patientez quelques minutes.')
}

/** Définit le nouveau mot de passe depuis le lien reçu par email (session de récupération). */
export async function setRecoveredPassword(next) {
  const sb = await getClient()
  const { error } = await sb.auth.updateUser({ password: next })
  if (error) throw new Error('Le lien a expiré. Refaites une demande « Mot de passe oublié ».')
}

/** Ferme la session sur tous les appareils (téléphone perdu, mot de passe partagé…). */
export async function signOutEverywhere() {
  if (!isSupabase) return signOut()
  const sb = await getClient()
  await sb.auth.signOut({ scope: 'global' })
}

export async function getUser() {
  if (!isSupabase) return sessionStorage.getItem('demo-session') ? { email: DEMO_LOGIN.email } : null
  const sb = await getClient()
  const { data } = await sb.auth.getSession()
  return data.session?.user || null
}

/** Traduit les erreurs de la base en messages compréhensibles */
function friendlyDbError(error) {
  if (error.code === '42501' || /row-level security|permission denied/i.test(error.message || '')) {
    return new Error('Votre compte n’a pas les droits d’administrateur. Ajoutez votre email dans la table « admins » de Supabase.')
  }
  if (/JWT|expired/i.test(error.message || '')) return new Error('Votre session a expiré. Déconnectez-vous puis reconnectez-vous.')
  if (/fetch|network/i.test(error.message || '')) return new Error('Pas de connexion internet. Réessayez.')
  return new Error(error.message || 'Une erreur est survenue.')
}

/* ------------------------------------------------------------------ */
/*  Administration                                                     */
/* ------------------------------------------------------------------ */
export async function adminList(table) {
  if (!isSupabase) return [...demoRead()[table]].sort(byPosition)
  const sb = await getClient()
  const { data, error } = await sb.from(table).select('*').order('position').order('created_at', { ascending: false })
  if (error) throw friendlyDbError(error)
  return data
}

/** Crée ou met à jour un élément. Renvoie l'élément enregistré. */
export async function adminSave(table, item, existing = []) {
  const record = { ...item }
  if (table === 'creations') {
    // Adresse lisible et unique : /realisations/table-en-iroko
    let base = slugify(record.title)
    let slug = base
    let i = 2
    while (existing.some((e) => e.slug === slug && e.id !== record.id)) slug = `${base}-${i++}`
    record.slug = slug
  }
  if (!record.id) record.position = existing.length ? Math.max(...existing.map((e) => e.position ?? 0)) + 1 : 0

  if (!isSupabase) {
    const db = demoRead()
    if (record.id) db[table] = db[table].map((r) => (r.id === record.id ? record : r))
    else db[table] = [...db[table], { ...record, id: uid(), created_at: new Date().toISOString() }]
    demoWrite(db)
    return record
  }

  const sb = await getClient()
  const { id, created_at, ...fields } = record
  const query = id ? sb.from(table).update(fields).eq('id', id) : sb.from(table).insert(fields)
  const { data, error } = await query.select().single()
  if (error) throw friendlyDbError(error)
  return data
}

export async function adminDelete(table, id) {
  if (!isSupabase) {
    const db = demoRead()
    db[table] = db[table].filter((r) => r.id !== id)
    return demoWrite(db)
  }
  const sb = await getClient()
  const { error } = await sb.from(table).delete().eq('id', id)
  if (error) throw friendlyDbError(error)
}

/** Enregistre le nouvel ordre (liste d'identifiants) */
export async function adminReorder(table, ids) {
  if (!isSupabase) {
    const db = demoRead()
    db[table] = db[table].map((r) => ({ ...r, position: ids.indexOf(r.id) }))
    return demoWrite(db)
  }
  const sb = await getClient()
  await Promise.all(ids.map((id, position) => sb.from(table).update({ position }).eq('id', id)))
}

export async function adminSaveSettings(data) {
  if (!isSupabase) {
    const db = demoRead()
    db.settings = data
    return demoWrite(db)
  }
  const sb = await getClient()
  const { error } = await sb.from('settings').upsert({ id: 1, data, updated_at: new Date().toISOString() })
  if (error) throw friendlyDbError(error)
}

/** Compresse puis envoie une photo. Renvoie { src, thumb }. */
export async function uploadPhoto(file, folder = 'divers') {
  const { full, thumb } = await compressImage(file)
  if (!isSupabase) {
    return { src: await blobToDataUrl(full), thumb: await blobToDataUrl(thumb) }
  }
  const sb = await getClient()
  const ext = full.type === 'image/webp' ? 'webp' : 'jpg'
  const name = `${folder}/${Date.now()}-${uid().slice(0, 8)}`
  const opts = { contentType: full.type, cacheControl: '31536000', upsert: false }
  const [a, b] = await Promise.all([
    sb.storage.from(MEDIA_BUCKET).upload(`${name}.${ext}`, full, opts),
    sb.storage.from(MEDIA_BUCKET).upload(`${name}-640.${ext}`, thumb, opts),
  ])
  const upErr = a.error || b.error
  if (upErr) {
    if (/security|unauthorized|403/i.test(`${upErr.message} ${upErr.statusCode || ''}`)) throw friendlyDbError({ code: '42501' })
    throw new Error('Envoi de la photo impossible. Vérifiez votre connexion.')
  }
  const url = (path) => sb.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
  return { src: url(`${name}.${ext}`), thumb: url(`${name}-640.${ext}`) }
}

/** Réinitialise les données de démonstration */
export function resetDemo() {
  localStorage.removeItem(DEMO_KEY)
}
