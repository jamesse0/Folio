import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import PhotoGrid from '../components/photos/PhotoGrid'
import PhotoDetail from '../components/photos/PhotoDetail'
import UploadModal from '../components/upload/UploadModal'
import { usePhotos } from '../hooks/usePhotos'

export default function DashboardPage() {
  const { photos, loading, error, fetchPhotos, addPhoto, removePhoto } = usePhotos()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  useEffect(() => { fetchPhotos() }, [fetchPhotos])

  const handleUploaded = (photo) => {
    addPhoto(photo)
  }

  const handleCaptionUpdate = (id, caption) => {
    // Update in local state so the grid reflects the change immediately
    setSelectedPhoto((prev) => prev ? { ...prev, caption } : prev)
  }

  return (
    <PageWrapper
      onUploadClick={() => setUploadOpen(true)}
      title="Photos"
      description={!loading && !error ? `${photos.length} photo${photos.length === 1 ? '' : 's'}` : undefined}
    >
      <PhotoGrid
        photos={photos}
        loading={loading}
        error={error}
        onDelete={removePhoto}
        onPhotoClick={setSelectedPhoto}
      />

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={handleUploaded}
      />

      {selectedPhoto && (
        <PhotoDetail
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onCaptionUpdate={handleCaptionUpdate}
        />
      )}
    </PageWrapper>
  )
}