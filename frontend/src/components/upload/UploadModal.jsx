import { useState, useRef } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { uploadPhoto } from '../../api/photos'

export default function UploadModal({ isOpen, onClose, onUploaded }) {
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef()

  const reset = () => {
    setFile(null)
    setCaption('')
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFileChange = (e) => {
    setError(null)
    setFile(e.target.files[0] ?? null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { setError('Please select a photo.'); return }
    setUploading(true)
    setError(null)
    try {
      const { data } = await uploadPhoto(file, caption)
      onUploaded(data)
      handleClose()
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Photo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className="border-2 border-dashed border-gray-800 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500/60 hover:bg-gray-800/30 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <div className="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center mx-auto mb-3 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14" />
            </svg>
          </div>
          {file ? (
            <p className="text-sm text-white">{file.name}</p>
          ) : (
            <>
              <p className="text-gray-300 text-sm font-medium">Click to select a photo</p>
              <p className="text-gray-600 text-xs mt-1">JPEG, PNG, WebP — max 25 MB</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="input-field"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex justify-end gap-3 pt-1">
          <Button variant="ghost" type="button" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" type="submit" loading={uploading}>
            Upload
          </Button>
        </div>
      </form>
    </Modal>
  )
}
