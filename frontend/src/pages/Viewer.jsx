import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPortfolio } from '../api/portfolio'
import Spinner from '../components/common/Spinner'
import PhotoDetail from '../components/photos/PhotoDetail'
import ToastContainer from '../components/common/Toast'

export default function PortfolioPage() {
  const { code } = useParams()
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  useEffect(() => {
    getPortfolio(code)
      .then(({ data }) => setPortfolio(data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [code])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (notFound || !portfolio) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center card p-8">
          <p className="text-gray-300 text-sm font-medium">Portfolio not found</p>
          <p className="text-gray-600 text-xs mt-1">Check the link and try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="px-6 py-10 text-center border-b border-gray-800 relative overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <h1 className="relative text-2xl font-semibold text-white">
          {portfolio.photographer_name ?? 'Portfolio'}
        </h1>
        <span className="relative inline-block mt-3 text-xs text-gray-400 bg-gray-900 border border-gray-800 rounded-full px-3 py-1">
          {portfolio.photos.length} photo{portfolio.photos.length === 1 ? '' : 's'}
        </span>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {portfolio.photos.length === 0 ? (
          <p className="text-center text-gray-600 text-sm py-16">No photos yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {portfolio.photos.map((photo) => (
              <div
                key={photo.id}
                className="aspect-square bg-gray-900 rounded-xl overflow-hidden cursor-pointer group ring-1 ring-gray-800 hover:ring-gray-700 shadow-sm hover:shadow-lg hover:shadow-black/30 transition-all"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={`/api/uploads/thumbnails/${photo.thumbnail_path}`}
                  alt={photo.caption || ''}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedPhoto && (
        <PhotoDetail
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      <ToastContainer />
    </div>
  )
}
