import { createContext, useCallback, useContext, useState } from 'react'
import Icon from '../components/Icon'

/* ---------------- Notifications (« Enregistré ! ») ---------------- */
const ToastContext = createContext(() => {})
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const show = useCallback((message, type = 'ok') => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast((t) => (t && Date.now() - t.id >= 3000 ? null : t)), 3200)
  }, [])
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 top-4 z-[90] flex justify-center">
        {toast && (
          <p
            key={toast.id}
            className={`animate-fade-up flex items-center gap-2 rounded-2xl px-5 py-4 text-base font-semibold text-white shadow-lift ${
              toast.type === 'error' ? 'bg-[#9B2C1F]' : 'bg-[#2B1E15]'
            }`}
          >
            <Icon name={toast.type === 'error' ? 'alert' : 'check'} size={22} />
            {toast.message}
          </p>
        )}
      </div>
    </ToastContext.Provider>
  )
}

/* ---------------- Fenêtre de confirmation ---------------- */
export function Confirm({ title, text, confirmLabel = 'Oui, supprimer', onConfirm, onCancel, danger = true }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-4 sm:items-center" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="animate-fade-up w-full max-w-sm rounded-3xl bg-surface p-6 shadow-lift">
        <h2 id="confirm-title" className="font-sans text-xl font-bold">{title}</h2>
        {text && <p className="mt-2 text-muted">{text}</p>}
        <div className="mt-6 grid gap-3">
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className={`btn min-h-[56px] text-white ${danger ? 'bg-[#9B2C1F] hover:bg-[#82241A]' : 'bg-ink'}`}
          >
            {confirmLabel}
          </button>
          <button type="button" onClick={onCancel} className="btn-ghost min-h-[56px]">Annuler</button>
        </div>
      </div>
    </div>
  )
}

export function Spinner({ className = '' }) {
  return <span className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} aria-hidden="true" />
}
