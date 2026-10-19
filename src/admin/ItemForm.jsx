import { useState } from 'react'
import Icon from '../components/Icon'
import { useSite } from '../context/SiteContext'
import PhotoInput from './PhotoInput'
import { ICONS } from './schemas'
import { Spinner } from './ui'

/** Un champ du formulaire, selon son type */
function Field({ field, form, set, settings, setBusy, folder }) {
  const value = form[field.name]
  const id = `f-${field.name}`

  switch (field.type) {
    case 'photos':
      return <PhotoInput value={value || []} onChange={(v) => set(field.name, v)} max={field.max} folder={folder} onBusy={setBusy} />

    case 'textarea':
      return (
        <>
          <textarea
            id={id}
            rows={4}
            maxLength={field.max}
            value={value || ''}
            onChange={(e) => set(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="field resize-none leading-relaxed"
          />
          <p className={`mt-1 text-right text-sm ${(value || '').length >= field.max ? 'font-semibold text-[#B3392B]' : 'text-muted'}`}>
            {(value || '').length} / {field.max}
          </p>
        </>
      )

    case 'select':
      return (
        <select id={id} value={value || ''} onChange={(e) => set(field.name, e.target.value)} className="field appearance-none bg-[length:20px] bg-[right_1rem_center] bg-no-repeat pr-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23685242' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")" }}>
          {settings[field.options].map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      )

    case 'price':
      return (
        <div className="space-y-3">
          <div className="relative">
            <input
              id={id}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              disabled={form.on_quote}
              value={form.on_quote ? '' : value ?? ''}
              onChange={(e) => set(field.name, e.target.value === '' ? null : Number(e.target.value))}
              placeholder={form.on_quote ? 'Sur devis' : 'Ex. 150000'}
              className="field pr-20 disabled:opacity-50"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-muted">{settings.currency}</span>
          </div>
          <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border-2 border-line px-4">
            <input type="checkbox" checked={!!form.on_quote} onChange={(e) => set('on_quote', e.target.checked)} className="h-6 w-6 accent-[#2B1E15]" />
            <span className="font-medium">Pas de prix fixe : « Sur devis »</span>
          </label>
        </div>
      )

    case 'number':
      return (
        <div className="relative">
          <input id={id} type="number" inputMode="numeric" min="0" step="500" value={value ?? ''} onChange={(e) => set(field.name, e.target.value === '' ? 0 : Number(e.target.value))} className="field pr-20" />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-muted">{settings.currency}</span>
        </div>
      )

    case 'chips': {
      const opts = ['', ...settings[field.options]]
      return (
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {opts.map((o) => (
            <button
              key={o || 'none'}
              type="button"
              role="radio"
              aria-checked={(value || '') === o}
              onClick={() => set(field.name, o)}
              className={`min-h-[48px] rounded-full border-2 px-5 font-medium ${(value || '') === o ? 'border-ink bg-ink text-bg' : 'border-line'}`}
            >
              {o || 'Aucun'}
            </button>
          ))}
        </div>
      )
    }

    case 'icon':
      return (
        <div className="grid grid-cols-3 gap-2" role="radiogroup">
          {ICONS.map((ic) => (
            <button
              key={ic.id}
              type="button"
              role="radio"
              aria-checked={value === ic.id}
              onClick={() => set(field.name, ic.id)}
              className={`flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-xl border-2 text-xs ${value === ic.id ? 'border-ink bg-oak/20' : 'border-line'}`}
            >
              <Icon name={ic.id} size={24} /> {ic.label}
            </button>
          ))}
        </div>
      )

    case 'rating':
      return (
        <div className="flex gap-1" role="radiogroup">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} étoile${n > 1 ? 's' : ''}`} onClick={() => set(field.name, n)} className="grid h-12 w-12 place-items-center text-oak">
              <Icon name="star" size={34} className={n <= (value || 0) ? '' : 'opacity-25'} />
            </button>
          ))}
        </div>
      )

    case 'toggle':
      return (
        <button
          type="button"
          role="switch"
          aria-checked={!!value}
          onClick={() => set(field.name, !value)}
          className={`flex min-h-[60px] w-full items-center justify-between rounded-2xl border-2 px-4 text-left font-semibold ${value ? 'border-ink' : 'border-line text-muted'}`}
        >
          <span className="flex items-center gap-3">
            <Icon name={value ? 'eye' : 'eyeOff'} />
            {value ? 'Visible sur le site' : 'Caché du site'}
          </span>
          <span className={`relative h-8 w-14 rounded-full transition-colors ${value ? 'bg-ink' : 'bg-line'}`}>
            <span className={`absolute top-1 h-6 w-6 rounded-full bg-bg shadow transition-all duration-200 ${value ? 'left-7' : 'left-1'}`} />
          </span>
        </button>
      )

    default:
      return (
        <input id={id} type="text" maxLength={field.max} value={value || ''} onChange={(e) => set(field.name, e.target.value)} placeholder={field.placeholder} className="field" />
      )
  }
}

/** Formulaire générique (création, service, avis, avant/après) */
export default function ItemForm({ schema, table, initial, onSave, onCancel }) {
  const { settings } = useSite()
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showMore, setShowMore] = useState(() => schema.fields.some((f) => f.advanced && initial[f.name]))

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const submit = async (e) => {
    e.preventDefault()
    // Vérification simple, messages clairs
    for (const f of schema.fields) {
      const v = form[f.name]
      if (f.required && (v == null || v === '' || (Array.isArray(v) && v.length === 0))) {
        setError(f.type === 'photos' ? `Ajoutez au moins une photo (${f.label}).` : `Le champ « ${f.label} » est obligatoire.`)
        document.getElementById(`wrap-${f.name}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
      }
    }
    setError('')
    setSaving(true)
    try {
      await onSave(form)
    } catch (err) {
      setError(err.message || 'Enregistrement impossible. Réessayez.')
      setSaving(false)
    }
  }

  const main = schema.fields.filter((f) => !f.advanced && f.type !== 'toggle')
  const advanced = schema.fields.filter((f) => f.advanced)
  const toggles = schema.fields.filter((f) => f.type === 'toggle')

  const renderField = (f) => (
    <div key={f.name} id={`wrap-${f.name}`}>
      {f.type === 'photos' || f.type === 'chips' || f.type === 'icon' || f.type === 'rating' ? (
        <p className="field-label">{f.label}{f.required && ' *'}</p>
      ) : (
        f.type !== 'toggle' && <label htmlFor={`f-${f.name}`} className="field-label">{f.label}{f.required && ' *'}</label>
      )}
      <Field field={f} form={form} set={set} settings={settings} setBusy={setBusy} folder={table} />
      {f.help && <p className="mt-1.5 text-sm text-muted">{f.help}</p>}
    </div>
  )

  return (
    <form onSubmit={submit} className="space-y-7 pb-36" noValidate>
      {main.map(renderField)}

      {advanced.length > 0 && (
        <div className="rounded-2xl border-2 border-line">
          <button type="button" onClick={() => setShowMore((s) => !s)} aria-expanded={showMore} className="flex min-h-[56px] w-full items-center justify-between px-4 font-semibold">
            Plus de détails (facultatif)
            <Icon name="chevronRight" className={`transition-transform duration-200 ${showMore ? 'rotate-90' : ''}`} />
          </button>
          {showMore && <div className="space-y-6 border-t-2 border-line p-4">{advanced.map(renderField)}</div>}
        </div>
      )}

      {toggles.map(renderField)}

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-[#B3392B]/10 p-4 font-semibold text-[#B3392B]">
          <Icon name="alert" className="shrink-0" /> {error}
        </p>
      )}

      {/* Barre d'action fixée en bas, accessible au pouce */}
      <div className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto grid max-w-2xl grid-cols-[1fr_2fr] gap-3 p-3">
          <button type="button" onClick={onCancel} className="btn-ghost min-h-[56px]">Annuler</button>
          <button type="submit" disabled={busy || saving} className="btn min-h-[56px] bg-ink text-bg">
            {saving ? <Spinner /> : <Icon name="check" />}
            {busy ? 'Photos en cours…' : saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </form>
  )
}
