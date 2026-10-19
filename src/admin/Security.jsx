import { useState } from 'react'
import Icon from '../components/Icon'
import { changePassword, passwordIssues, requestPasswordReset, setRecoveredPassword, signOutEverywhere } from '../lib/api'
import { isSupabase } from '../lib/supabase'
import { Confirm, Spinner, useToast } from './ui'

/** Champ mot de passe avec bouton « afficher » */
function PasswordInput({ id, label, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <div className="relative">
        <input id={id} type={show ? 'text' : 'password'} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} className="field pr-14" />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} className="absolute right-1 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center text-muted">
          <Icon name={show ? 'eyeOff' : 'eye'} />
        </button>
      </div>
    </div>
  )
}

/** Nouveau mot de passe + confirmation, avec règles affichées en direct */
function NewPasswordFields({ next, setNext, confirm, setConfirm }) {
  const rules = [
    ['au moins 10 caractères', next.length >= 10],
    ['des majuscules et des minuscules', /[a-z]/.test(next) && /[A-Z]/.test(next)],
    ['au moins un chiffre', /\d/.test(next)],
    ['les deux mots de passe sont identiques', next.length > 0 && next === confirm],
  ]
  return (
    <>
      <PasswordInput id="new-pwd" label="Nouveau mot de passe" value={next} onChange={setNext} autoComplete="new-password" />
      <PasswordInput id="confirm-pwd" label="Confirmez le nouveau mot de passe" value={confirm} onChange={setConfirm} autoComplete="new-password" />
      <ul className="space-y-1.5 text-sm" aria-label="Règles du mot de passe">
        {rules.map(([label, ok]) => (
          <li key={label} className={`flex items-center gap-2 ${ok ? 'font-semibold text-[#1E5B3A] dark:text-[#7CC59B]' : 'text-muted'}`}>
            <Icon name={ok ? 'check' : 'x'} size={16} /> {label}
          </li>
        ))}
      </ul>
    </>
  )
}

const validate = (next, confirm) => {
  const issues = passwordIssues(next)
  if (issues.length) return `Le mot de passe doit contenir ${issues.join(', ')}.`
  if (next !== confirm) return 'Les deux mots de passe ne sont pas identiques.'
  return ''
}

/* ------------------------------------------------------------------ */
/*  Page « Sécurité » (admin connecté)                                  */
/* ------------------------------------------------------------------ */
export function SecurityPage({ user, onLoggedOut }) {
  const toast = useToast()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [askGlobal, setAskGlobal] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const problem = !current ? 'Entrez votre mot de passe actuel.' : validate(next, confirm)
    if (problem) return setError(problem)
    setError('')
    setSaving(true)
    try {
      await changePassword(user.email, current, next)
      setCurrent('')
      setNext('')
      setConfirm('')
      toast('Mot de passe changé !')
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <section className="flex items-center gap-3 rounded-2xl border-2 border-line bg-surface p-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-oak/20"><Icon name="shield" /></span>
        <div className="min-w-0">
          <p className="text-sm text-muted">Connecté avec</p>
          <p className="truncate font-semibold">{user.email}</p>
        </div>
      </section>

      {!isSupabase && (
        <p className="rounded-xl bg-oak/15 p-4 text-sm">Mode démo : ces réglages fonctionneront une fois Supabase branché.</p>
      )}

      <form onSubmit={submit} className="space-y-5 rounded-2xl border-2 border-line bg-surface p-4" noValidate>
        <h2 className="flex items-center gap-2 font-sans text-lg font-bold"><Icon name="lock" /> Changer mon mot de passe</h2>
        <PasswordInput id="cur-pwd" label="Mot de passe actuel" value={current} onChange={setCurrent} autoComplete="current-password" />
        <NewPasswordFields next={next} setNext={setNext} confirm={confirm} setConfirm={setConfirm} />
        {error && <p role="alert" className="font-semibold text-[#B3392B]">{error}</p>}
        <button type="submit" disabled={saving} className="btn min-h-[56px] w-full bg-ink text-bg">
          {saving ? <Spinner /> : <Icon name="check" />} Changer le mot de passe
        </button>
      </form>

      <section className="space-y-3 rounded-2xl border-2 border-line bg-surface p-4">
        <h2 className="flex items-center gap-2 font-sans text-lg font-bold"><Icon name="devices" /> Mes appareils</h2>
        <p className="text-sm text-muted">
          Téléphone perdu, ou mot de passe donné à quelqu’un ? Déconnectez l’espace atelier partout. Il faudra se reconnecter sur chaque appareil.
        </p>
        <button type="button" onClick={() => setAskGlobal(true)} className="btn min-h-[56px] w-full border-2 border-[#B3392B] text-[#B3392B]">
          <Icon name="logout" /> Déconnecter tous les appareils
        </button>
      </section>

      <ul className="space-y-2 rounded-2xl bg-oak/10 p-4 text-sm text-muted">
        <li>🔒 Déconnexion automatique après 30 minutes sans activité.</li>
        <li>🔑 Ne donnez jamais votre mot de passe, même à un proche.</li>
        <li>📱 Sur un téléphone partagé, touchez « Déconnexion » après chaque visite.</li>
      </ul>

      {askGlobal && (
        <Confirm
          title="Déconnecter tous les appareils ?"
          text="Vous serez aussi déconnecté ici."
          confirmLabel="Oui, tout déconnecter"
          onCancel={() => setAskGlobal(false)}
          onConfirm={async () => {
            await signOutEverywhere()
            onLoggedOut()
          }}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  « Mot de passe oublié » (depuis l'écran de connexion)               */
/* ------------------------------------------------------------------ */
export function ForgotPassword({ initialEmail = '', onBack }) {
  const [email, setEmail] = useState(initialEmail)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Entrez une adresse email valide.')
    setError('')
    setLoading(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="mt-6 space-y-4">
        <p className="rounded-xl bg-oak/15 p-4">
          Si cette adresse correspond à un compte, un email vient d’être envoyé. Ouvrez-le <strong>sur ce téléphone</strong> et touchez le lien (valable 1 heure).
        </p>
        <p className="text-sm text-muted">Pensez à regarder dans les spams.</p>
        <button type="button" onClick={onBack} className="btn-ghost min-h-[52px] w-full">Retour à la connexion</button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
      <p className="text-muted">Entrez votre email : vous recevrez un lien pour choisir un nouveau mot de passe.</p>
      <div>
        <label htmlFor="reset-email" className="field-label">Email</label>
        <input id="reset-email" type="email" inputMode="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
      </div>
      {error && <p role="alert" className="font-semibold text-[#B3392B]">{error}</p>}
      <button type="submit" disabled={loading} className="btn min-h-[56px] w-full bg-ink text-bg">
        {loading ? <Spinner /> : 'Recevoir le lien'}
      </button>
      <button type="button" onClick={onBack} className="flex min-h-[44px] w-full items-center justify-center text-sm text-muted underline">
        Retour à la connexion
      </button>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/*  Choix du nouveau mot de passe (après le lien reçu par email)        */
/* ------------------------------------------------------------------ */
export function RecoveryPage({ onDone }) {
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const problem = validate(next, confirm)
    if (problem) return setError(problem)
    setError('')
    setSaving(true)
    try {
      await setRecoveredPassword(next)
      onDone()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <main className="wood-grain grid min-h-[100svh] place-items-center bg-bg p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-3xl bg-surface p-6 shadow-lift sm:p-8" noValidate>
        <div>
          <p className="eyebrow">Espace atelier</p>
          <h1 className="mt-2 text-3xl font-semibold">Nouveau mot de passe</h1>
        </div>
        <NewPasswordFields next={next} setNext={setNext} confirm={confirm} setConfirm={setConfirm} />
        {error && <p role="alert" className="font-semibold text-[#B3392B]">{error}</p>}
        <button type="submit" disabled={saving} className="btn min-h-[56px] w-full bg-ink text-bg">
          {saving ? <Spinner /> : 'Enregistrer et continuer'}
        </button>
      </form>
    </main>
  )
}
