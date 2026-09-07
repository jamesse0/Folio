import { useEffect } from 'react'
import useToastStore from '../../store/toastStore'

const ICONS = {
  info: 'ℹ',
  success: '✓',
  error: '✕',
  warning: '!',
}

const ACCENTS = {
  info: 'border-l-indigo-500 text-indigo-400',
  success: 'border-l-green-500 text-green-400',
  error: 'border-l-red-500 text-red-400',
  warning: 'border-l-yellow-500 text-yellow-400',
}

function Toast({ id, message, type }) {
  const removeToast = useToastStore((s) => s.removeToast)

  useEffect(() => {
    const timer = setTimeout(() => removeToast(id), 4500)
    return () => clearTimeout(timer)
  }, [id, removeToast])

  return (
    <div className={`bg-gray-900 border border-gray-800 border-l-4 ${ACCENTS[type]} rounded-xl px-4 py-3 flex items-start gap-3 min-w-64 max-w-sm shadow-2xl shadow-black/40`}>
      <span className="text-sm font-semibold mt-0.5">{ICONS[type]}</span>
      <p className="text-sm text-gray-100 flex-1">{message}</p>
      <button onClick={() => removeToast(id)} className="text-gray-500 hover:text-white transition-colors mt-0.5">✕</button>
    </div>
  )
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => <Toast key={t.id} {...t} />)}
    </div>
  )
}
