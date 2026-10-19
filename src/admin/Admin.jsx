import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import Icon from '../components/Icon'
import { useSite } from '../context/SiteContext'
import { DEMO_LOGIN, adminDelete, adminList, adminReorder, adminSave, getUser, resetDemo, signIn, signOut } from '../lib/api'
import { isSupabase, recoveryLink } from '../lib/supabase'
import ItemForm from './ItemForm'
import ItemList from './ItemList'
import { SCHEMAS } from './schemas'
import SettingsForm from './SettingsForm'
import { ForgotPassword, RecoveryPage, SecurityPage } from './Security'
import { Confirm, Spinner, ToastProvider, useToast } from './ui'

/* ------------------------------------------------------------------ */
/*  Connexion                                                          */
/* ------------------------------------------------------------------ */
/*
 * Anti-acharnement : après 5 échecs, la connexion est bloquée 1 min, puis 5, puis 15.
 * (Supabase limite aussi les tentatives côté serveur.)
 */
const LOCK_KEY = 'admin-login-guard'
const readGuard = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCK_KEY)) || { fails: 0, until: 0 }
  } catch {
    return { fails: 0, until: 0 }
  }
}
const writeGuard = (g) => {
  try {
    localStorage.setItem(LOCK_KEY, JSON.stringify(g))
  } catch {
    /* ignore */
  }
}

function Login({ onLogin, notice }) {
  const { settings } = useSite()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState(isSupabase ? '' : DEMO_LOGIN.email)
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [now, setNow] = useState(Date.now())
  const lockedFor = Math.max(0, Math.ceil((readGuard().until - now) / 1000))

  useEffect(() => {
    if (!lockedFor) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [lockedFor])

  const submit = async (e) => {
    e.preventDefault()
    if (lockedFor) return
    setError('')
    setLoading(true)
    try {
      const user = await signIn(email, password)
      writeGuard({ fails: 0, until: 0 })
      onLogin(user)
    } catch (err) {
      const g = readGuard()
      g.fails += 1
      if (g.fails >= 5) g.until = Date.now() + [60, 300, 900][Math.min(2, Math.floor(g.fails / 5) - 1)] * 1000
      writeGuard(g)
      setNow(Date.now())
      setError(g.fails >= 5 ? 'Trop d’essais. Patientez avant de réessayer, ou utilisez « Mot de passe oublié ».' : err.message)
      setPassword('')
      setLoading(false)
    }
  }

  return (
    <main className="wood-grain grid min-h-[100svh] place-items-center bg-bg p-4">
      <div className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-lift sm:p-8">
        <p className="eyebrow">Espace atelier</p>
        <h1 className="mt-2 text-3xl font-semibold">{mode === 'forgot' ? 'Mot de passe oublié' : settings.businessName}</h1>
        {notice && <p role="status" className="mt-4 rounded-xl bg-oak/15 p-3 text-sm font-medium">{notice}</p>}
        {mode === 'forgot' ? (
          <ForgotPassword initialEmail={email} onBack={() => setMode('login')} />
        ) : (
        <form onSubmit={submit}>
        {!isSupabase && (
          <p className="mt-4 rounded-xl bg-oak/15 p-3 text-sm">
            <strong>Mode démo</strong> — mot de passe : <code className="font-bold">{DEMO_LOGIN.password}</code>
          </p>
        )}
        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="email" className="field-label">Email</label>
            <input id="email" type="email" autoComplete="username" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
          </div>
          <div>
            <label htmlFor="pwd" className="field-label">Mot de passe</label>
            <div className="relative">
              <input id="pwd" type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field pr-14" />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} className="absolute right-1 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center text-muted">
                <Icon name={show ? 'eyeOff' : 'eye'} />
              </button>
            </div>
          </div>
        </div>
        {error && <p role="alert" className="mt-4 font-semibold text-[#B3392B]">{error}</p>}
        <button type="submit" disabled={loading || lockedFor > 0} className="btn mt-6 min-h-[56px] w-full bg-ink text-lg text-bg">
          {loading ? <Spinner /> : lockedFor ? `Réessayez dans ${lockedFor} s` : 'Se connecter'}
        </button>
        {isSupabase && (
          <button type="button" onClick={() => { setError(''); setMode('forgot') }} className="mt-3 flex min-h-[44px] w-full items-center justify-center text-sm font-semibold underline">
            Mot de passe oublié ?
          </button>
        )}
        <Link to="/" className="flex min-h-[44px] items-center justify-center text-sm text-muted underline">Retour au site</Link>
        </form>
        )}
      </div>
    </main>
  )
}

/* ------------------------------------------------------------------ */
/*  Hook : charge une liste et expose les actions                       */
/* ------------------------------------------------------------------ */
function useCollection(table) {
  const { reload } = useSite()
  const toast = useToast()
  const [items, setItems] = useState(null)

  const refresh = useCallback(async () => {
    try {
      setItems(await adminList(table))
    } catch {
      setItems([])
      toast('Impossible de charger la liste. Vérifiez la connexion.', 'error')
    }
  }, [table, toast])

  useEffect(() => {
    setItems(null)
    refresh()
  }, [refresh])

  const run = async (fn, okMsg) => {
    try {
      await fn()
      await Promise.all([refresh(), reload()]) // le site public est mis à jour immédiatement
      if (okMsg) toast(okMsg)
    } catch (e) {
      toast(e.message || 'Une erreur est survenue', 'error')
      refresh()
    }
  }

  return { items, setItems, run }
}

/* ------------------------------------------------------------------ */
/*  Page liste                                                         */
/* ------------------------------------------------------------------ */
function CollectionPage() {
  const { table } = useParams()
  const schema = SCHEMAS[table]
  const { items, setItems, run } = useCollection(table)
  if (!schema) return <Navigate to="/admin/creations" replace />

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="font-sans text-2xl font-bold">{schema.label}</h1>
        {items && <span className="text-sm text-muted">{items.length} au total</span>}
      </div>

      <Link to={`/admin/${table}/nouveau`} className="btn mb-6 min-h-[64px] w-full rounded-2xl bg-ink text-lg text-bg">
        <Icon name="plus" size={26} /> Ajouter {schema.singular}
      </Link>

      {items === null ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-line p-8 text-center text-muted">
          <Icon name={schema.icon} size={36} className="mx-auto" />
          <p className="mt-3 font-semibold text-ink">Rien pour le moment.</p>
          <p className="mt-1 text-sm">Touchez « Ajouter » ci-dessus pour commencer.</p>
        </div>
      ) : (
        <>
          <p className="mb-3 flex items-center gap-2 text-sm text-muted">
            <Icon name="grip" size={18} strokeWidth={3} /> Maintenez et glissez pour changer l’ordre sur le site.
          </p>
          <ItemList
            items={items}
            schema={schema}
            table={table}
            onReorder={(next) => {
              setItems(next)
              run(() => adminReorder(table, next.map((i) => i.id)), 'Ordre enregistré')
            }}
            onToggle={(item) =>
              run(() => adminSave(table, { ...item, visible: !item.visible }, items), item.visible ? 'Masqué du site' : 'Affiché sur le site')
            }
            onDelete={(item) => run(() => adminDelete(table, item.id), 'Supprimé')}
          />
        </>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Page ajout / modification                                          */
/* ------------------------------------------------------------------ */
function EditPage() {
  const { table, id } = useParams()
  const schema = SCHEMAS[table]
  const navigate = useNavigate()
  const { reload } = useSite()
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [leave, setLeave] = useState(false)

  useEffect(() => {
    adminList(table).then(setItems).catch(() => setItems([]))
  }, [table])

  if (!schema) return <Navigate to="/admin/creations" replace />
  if (items === null) return <div className="skeleton h-96 rounded-2xl" />

  const isNew = id === 'nouveau'
  const item = isNew ? schema.empty : items.find((i) => String(i.id) === id)
  if (!item) return <Navigate to={`/admin/${table}`} replace />

  return (
    <>
      <div className="mb-6 flex items-center gap-2">
        <button type="button" onClick={() => setLeave(true)} aria-label="Retour" className="-ml-2 grid h-12 w-12 place-items-center rounded-full hover:bg-oak/15">
          <Icon name="chevronLeft" />
        </button>
        <h1 className="font-sans text-2xl font-bold">{isNew ? `Ajouter ${schema.singular}` : 'Modifier'}</h1>
      </div>
      <ItemForm
        schema={schema}
        table={table}
        initial={item}
        onCancel={() => setLeave(true)}
        onSave={async (form) => {
          await adminSave(table, form, items)
          await reload()
          toast(isNew ? 'Publié sur le site !' : 'Modifications enregistrées !')
          navigate(`/admin/${table}`)
        }}
      />
      {leave && (
        <Confirm
          title="Quitter sans enregistrer ?"
          text="Les changements non enregistrés seront perdus."
          confirmLabel="Oui, quitter"
          danger={false}
          onCancel={() => setLeave(false)}
          onConfirm={() => navigate(`/admin/${table}`)}
        />
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Structure de l'admin                                               */
/* ------------------------------------------------------------------ */
const TABS = [
  ...Object.entries(SCHEMAS).map(([table, s]) => ({ to: `/admin/${table}`, label: s.tab, icon: s.icon })),
  { to: '/admin/atelier', label: 'Atelier', icon: 'settings' },
]

function Shell({ user, onLogout, children, hideTabs }) {
  return (
    <div className="min-h-[100svh] bg-bg">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between gap-2 px-4">
          <Link to="/" target="_blank" aria-label="Voir mon site (nouvel onglet)" className="flex min-h-[44px] min-w-[44px] items-center gap-1.5 whitespace-nowrap text-sm font-semibold">
            <Icon name="external" size={18} /> <span className="hidden min-[360px]:inline">Mon site</span>
          </Link>
          <NavLink
            to="/admin/securite"
            className={({ isActive }) => `flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-semibold hover:bg-oak/15 ${isActive ? 'bg-oak/25' : ''}`}
          >
            <Icon name="lock" size={18} /> Sécurité
          </NavLink>
          <button type="button" onClick={() => onLogout()} className="flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-semibold hover:bg-oak/15">
            <Icon name="logout" size={18} /> Déconnexion
          </button>
        </div>
        {!isSupabase && (
          <p className="bg-oak/20 px-4 py-2 text-center text-xs">
            Mode démo : les changements restent sur cet appareil.{' '}
            <button type="button" className="font-bold underline" onClick={() => { resetDemo(); location.reload() }}>Réinitialiser</button>
          </p>
        )}
      </header>

      <main className={`mx-auto max-w-2xl px-4 py-6 ${hideTabs ? '' : 'pb-28'}`}>{children}</main>

      {!hideTabs && (
        <nav aria-label="Menu de l’admin" className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg">
          <ul className="mx-auto grid max-w-2xl grid-cols-5">
            {TABS.map((t) => (
              <li key={t.to}>
                <NavLink
                  to={t.to}
                  className={({ isActive }) =>
                    `flex min-h-[68px] flex-col items-center justify-center gap-1 text-[11px] font-semibold ${isActive ? 'text-ink' : 'text-muted'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`grid h-8 w-12 place-items-center rounded-full ${isActive ? 'bg-oak/25' : ''}`}>
                        <Icon name={t.icon} size={22} />
                      </span>
                      {t.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <span className="sr-only">Connecté : {user?.email}</span>
    </div>
  )
}

/* Déconnexion automatique après 30 min sans activité (même si l'app est rouverte plus tard) */
const IDLE_MS = 30 * 60 * 1000
const ACTIVITY_KEY = 'admin-last-activity'
const markActivity = () => {
  try {
    localStorage.setItem(ACTIVITY_KEY, String(Date.now()))
  } catch {
    /* ignore */
  }
}
const isIdle = () => {
  const last = Number(localStorage.getItem(ACTIVITY_KEY) || 0)
  return last > 0 && Date.now() - last > IDLE_MS
}

/** Affiche un message une seule fois (dans le ToastProvider) */
function Flash({ message }) {
  const toast = useToast()
  useEffect(() => {
    if (message) toast(message)
  }, [message, toast])
  return null
}

export default function Admin() {
  const navigate = useNavigate()
  const [user, setUser] = useState(undefined)
  const [notice, setNotice] = useState(recoveryLink.expired ? 'Ce lien a expiré ou a déjà servi. Refaites une demande « Mot de passe oublié ».' : '')
  const [recovering, setRecovering] = useState(recoveryLink.valid)
  const [flash, setFlash] = useState('')

  const logout = useCallback(async (message = '') => {
    await signOut()
    setUser(null)
    setNotice(message)
  }, [])

  // Suivi d'activité + contrôle d'inactivité tant que l'admin est connecté
  useEffect(() => {
    if (!user) return
    let last = 0
    const onActivity = () => {
      if (Date.now() - last > 15000) {
        last = Date.now()
        markActivity()
      }
    }
    const check = () => isIdle() && logout('Vous avez été déconnecté après 30 minutes sans activité.')
    const onVisible = () => document.visibilityState === 'visible' && check()
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart']
    events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }))
    document.addEventListener('visibilitychange', onVisible)
    const timer = setInterval(check, 30000)
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onActivity))
      document.removeEventListener('visibilitychange', onVisible)
      clearInterval(timer)
    }
  }, [user, logout])

  useEffect(() => {
    getUser().then((u) => {
      if (u && !recoveryLink.valid && isIdle()) return logout('Vous avez été déconnecté après 30 minutes sans activité.')
      if (!u && recoveryLink.valid) {
        setRecovering(false)
        setNotice('Ce lien a expiré ou a déjà servi. Refaites une demande « Mot de passe oublié ».')
      }
      if (u) markActivity()
      setUser(u)
    })
    // L'admin ne doit pas être indexé par Google
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    const prevTitle = document.title
    document.title = 'Espace atelier'
    return () => {
      meta.remove()
      document.title = prevTitle
    }
  }, [])

  if (user === undefined) return <div className="grid min-h-screen place-items-center text-muted"><Spinner /></div>

  const shell = (children, props = {}) => (
    <Shell user={user} onLogout={() => logout()} {...props}>{children}</Shell>
  )

  return (
    <ToastProvider>
      <Flash message={flash} />
      {!user ? (
        <Login
          notice={notice}
          onLogin={(u) => {
            markActivity()
            setNotice('')
            setUser(u)
          }}
        />
      ) : recovering ? (
        <RecoveryPage
          onDone={() => {
            recoveryLink.valid = false
            setRecovering(false)
            markActivity()
            setFlash('Nouveau mot de passe enregistré !')
            navigate('/admin/creations', { replace: true })
          }}
        />
      ) : (
        <Routes>
          <Route index element={<Navigate to="creations" replace />} />
          <Route path="nouveau-mot-de-passe" element={<Navigate to="/admin/creations" replace />} />
          <Route path="atelier" element={shell(<><h1 className="mb-5 font-sans text-2xl font-bold">Mon atelier</h1><SettingsForm /></>)} />
          <Route
            path="securite"
            element={shell(
              <>
                <h1 className="mb-5 font-sans text-2xl font-bold">Sécurité</h1>
                <SecurityPage user={user} onLoggedOut={() => { setUser(null); setNotice('Tous les appareils ont été déconnectés.') }} />
              </>,
            )}
          />
          <Route path=":table" element={shell(<CollectionPage />)} />
          <Route path=":table/:id" element={shell(<EditPage />, { hideTabs: true })} />
        </Routes>
      )}
    </ToastProvider>
  )
}
