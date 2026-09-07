import { useState, useEffect } from 'react'
import { updateCaption } from '../../api/photos'

export default function PhotoDetail({ photo, onClose, onCaptionUpdate }) {
  const [caption, setCaption] = useState(photo?.caption ?? '')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setCaption(photo?.caption ?? '')
    setEditing(false)
  }, [photo])

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!photo) return null

  const handleSaveCaption = async () => {
    setSaving(true)
    try {
      await updateCaption(photo.id, caption)
      onCaptionUpdate?.(photo.id, caption)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-w-5xl max-h-screen w-full flex flex-col items-center p-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 h-9 w-9 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          ✕
        </button>
        <img
          src={`/api/uploads/originals/${photo.file_path}`}
          alt={photo.caption || photo.original_filename}
          className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl shadow-black/50"
        />
        <div className="mt-4 w-full max-w-lg">
          {editing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="input-field"
                autoFocus
              />
              <button onClick={handleSaveCaption} disabled={saving} className="text-sm text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 rounded-lg disabled:opacity-50 transition-colors shrink-0">
                {saving ? '…' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)} className="text-sm text-gray-400 px-3 py-2 rounded-lg hover:text-white shrink-0">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="group w-full text-center text-gray-400 hover:text-white text-sm transition-colors">
              {caption || <span className="italic text-gray-600">Add caption…</span>}
              <span className="ml-2 text-xs text-gray-600 group-hover:text-indigo-400">Edit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
