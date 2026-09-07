import { useState } from 'react'
import { deletePhoto } from '../../api/photos'

export default function PhotoCard({ photo, onDelete, onClick }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm('Delete this photo?')) return
    setDeleting(true)
    try {
      await deletePhoto(photo.id)
      onDelete(photo.id)
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div
      className="group relative aspect-square bg-gray-900 rounded-xl overflow-hidden cursor-pointer ring-1 ring-gray-800 hover:ring-gray-700 shadow-sm hover:shadow-lg hover:shadow-black/30 transition-all"
      onClick={onClick}
    >
      <img
        src={`/api/uploads/thumbnails/${photo.thumbnail_path}`}
        alt={photo.caption || photo.original_filename}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        {photo.caption && (
          <p className="text-white text-xs truncate mb-2">{photo.caption}</p>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="self-start text-xs font-medium text-white bg-red-600/90 hover:bg-red-500 backdrop-blur px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  )
}
