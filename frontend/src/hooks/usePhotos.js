import { useState, useCallback } from 'react'
import { getPhotos } from '../api/photos'

export function usePhotos() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPhotos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await getPhotos()
      setPhotos(data)
    } catch {
      setError('Failed to load photos')
    } finally {
      setLoading(false)
    }
  }, [])

  const addPhoto = useCallback((photo) => {
    setPhotos((prev) => [photo, ...prev])
  }, [])

  const removePhoto = useCallback((id) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return { photos, loading, error, fetchPhotos, addPhoto, removePhoto }
}