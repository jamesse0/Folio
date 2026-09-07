import client from './client'

export const getPhotos = (skip = 0, limit = 100) =>
  client.get('/photos', { params: { skip, limit } })

export const uploadPhoto = (file, caption = '') => {
  const form = new FormData()
  form.append('file', file)
  form.append('caption', caption)
  return client.post('/photos', form)
}

export const updateCaption = (id, caption) =>
  client.patch(`/photos/${id}`, { caption })

export const deletePhoto = (id) => client.delete(`/photos/${id}`)