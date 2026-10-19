import { useState } from 'react'
import Icon from '../components/Icon'
import { useSite } from '../context/SiteContext'
import { adminSaveSettings } from '../lib/api'
import PhotoInput from './PhotoInput'
import { Spinner, useToast } from './ui'

/** Champs modifiables par le menuisier, regroupés par thème */
const GROUPS = [
  {
    title: 'Mon atelier',
    icon: 'home',
    fields: [
      { name: 'businessName', label: 'Nom de l’atelier' },
      { name: 'ownerFirstName', label: 'Prénom' },
      { name: 'ownerLastName', label: 'Nom' },
      { name: 'yearsExperience', label: 'Années d’expérience', type: 'number' },
      { name: 'specialties', label: 'Spécialités (séparées par des virgules)', type: 'list' },
    ],
  },
  {
    title: 'Contact et réseaux',
    icon: 'phone',
    fields: [
      { name: 'whatsapp', label: 'Numéro WhatsApp', help: 'Avec l’indicatif, sans + ni espaces. Ex. 22670123456', inputMode: 'tel' },
      { name: 'phoneDisplay', label: 'Numéro affiché', help: 'Ex. +226 70 12 34 56' },
      { name: 'facebook', label: 'Lien de la page Facebook', inputMode: 'url' },
      { name: 'tiktok', label: 'Lien du compte TikTok', inputMode: 'url' },
    ],
  },
  {
    title: 'Adresse et horaires',
    icon: 'pin',
    fields: [
      { name: 'city', label: 'Ville' },
      { name: 'country', label: 'Pays' },
      { name: 'address', label: 'Adresse / quartier' },
      { name: 'serviceArea', label: 'Zone d’intervention' },
      { name: 'hours', label: 'Horaires' },
      { name: 'currency', label: 'Devise des prix', help: 'Ex. FCFA' },
    ],
  },
  {
    title: 'Chiffres clés',
    icon: 'grid',
    fields: [
      { name: 'stats.projects', label: 'Projets livrés', type: 'number' },
      { name: 'stats.clients', label: 'Clients satisfaits', type: 'number' },
      { name: 'stats.onTimeRate', label: '% livrés dans les délais', type: 'number' },
    ],
  },
  {
    title: 'Textes et photos',
    icon: 'image',
    fields: [
      { name: 'heroImage', label: 'Grande photo d’accueil', type: 'photo' },
      { name: 'heroTitle', label: 'Phrase d’accroche' },
      { name: 'heroSubtitle', label: 'Sous-titre' },
      { name: 'aboutImage', label: 'Votre photo à l’atelier', type: 'photo' },
      { name: 'aboutTitle', label: 'Titre « À propos »' },
      { name: 'aboutText', label: 'Votre parcours (3–4 lignes)', type: 'textarea' },
      { name: 'finalCtaTitle', label: 'Phrase finale' },
    ],
  },
]

const get = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj)
const setIn = (obj, path, value) => {
  const [k, ...rest] = path.split('.')
  return { ...obj, [k]: rest.length ? setIn(obj[k] || {}, rest.join('.'), value) : value }
}

export default function SettingsForm() {
  const { settings, reload } = useSite()
  const toast = useToast()
  const [form, setForm] = useState(settings)
  const [open, setOpen] = useState(0)
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      // On n'enregistre que les champs modifiables
      const data = {}
      GROUPS.flatMap((g) => g.fields).forEach((f) => {
        const [root] = f.name.split('.')
        data[root] = form[root]
      })
      data.whatsapp = String(data.whatsapp || '').replace(/\D/g, '')
      data.specialties = (data.specialties || []).map((s) => s.trim()).filter(Boolean)
      await adminSaveSettings(data)
      await reload()
      toast('Informations enregistrées !')
    } catch (e) {
      toast(e.message || 'Enregistrement impossible', 'error')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-3 pb-48">
      {GROUPS.map((g, gi) => (
        <section key={g.title} className="overflow-hidden rounded-2xl border-2 border-line bg-surface">
          <h2 className="font-sans">
            <button type="button" onClick={() => setOpen(open === gi ? -1 : gi)} aria-expanded={open === gi} className="flex min-h-[64px] w-full items-center gap-3 px-4 text-left text-lg font-bold">
              <Icon name={g.icon} /> <span className="flex-1">{g.title}</span>
              <Icon name="chevronRight" className={`transition-transform duration-200 ${open === gi ? 'rotate-90' : ''}`} />
            </button>
          </h2>
          {open === gi && (
            <div className="space-y-6 border-t-2 border-line p-4">
              {g.fields.map((f) => {
                const id = `s-${f.name}`
                const value = get(form, f.name)
                const update = (v) => setForm((s) => setIn(s, f.name, v))
                return (
                  <div key={f.name}>
                    {f.type === 'photo' ? <p className="field-label">{f.label}</p> : <label htmlFor={id} className="field-label">{f.label}</label>}
                    {f.type === 'photo' ? (
                      <PhotoInput value={value ? [{ src: value, thumb: value }] : []} onChange={(v) => update(v[0]?.src || '')} max={1} folder="atelier" onBusy={setBusy} />
                    ) : f.type === 'textarea' ? (
                      <textarea id={id} rows={5} maxLength={500} value={value || ''} onChange={(e) => update(e.target.value)} className="field resize-none leading-relaxed" />
                    ) : f.type === 'list' ? (
                      <input id={id} type="text" value={(value || []).join(', ')} onChange={(e) => update(e.target.value.split(',').map((s) => s.trimStart()).filter((s, i, a) => s || i === a.length - 1))} className="field" />
                    ) : (
                      <input id={id} type={f.type === 'number' ? 'number' : 'text'} inputMode={f.type === 'number' ? 'numeric' : f.inputMode} value={value ?? ''} onChange={(e) => update(f.type === 'number' ? Number(e.target.value) : e.target.value)} className="field" />
                    )}
                    {f.help && <p className="mt-1.5 text-sm text-muted">{f.help}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      ))}

      <div className="pb-safe fixed inset-x-0 bottom-[68px] z-30 border-t border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto max-w-2xl p-3">
          <button type="button" onClick={save} disabled={busy || saving} className="btn min-h-[56px] w-full bg-ink text-bg">
            {saving ? <Spinner /> : <Icon name="check" />} {busy ? 'Photo en cours…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
