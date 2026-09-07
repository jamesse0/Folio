import PhotoCard from './PhotoCard'
import Spinner from '../common/Spinner'

export default function PhotoGrid({ photos, loading, error, onDelete, onPhotoClick }) {
  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-24 text-gray-500">{error}</div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-24 border border-dashed border-gray-800 rounded-2xl">
        <div className="h-12 w-12 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto mb-4 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.5" />
            <path d="M21 16l-5.5-5.5a2 2 0 0 0-2.83 0L3 20" />
          </svg>
        </div>
        <p className="text-gray-400 text-sm font-medium">No photos yet</p>
        <p className="text-gray-600 text-xs mt-1">Click Upload to add your first photo.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          onDelete={onDelete}
          onClick={() => onPhotoClick?.(photo)}
        />
      ))}
    </div>
  )
}
