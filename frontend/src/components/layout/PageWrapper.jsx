import Header from './Header'
import ToastContainer from '../common/Toast'

export default function PageWrapper({ children, onUploadClick, title, description }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Header onUploadClick={onUploadClick} />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {(title || description) && (
          <div className="mb-6">
            {title && <h1 className="text-xl font-semibold text-white">{title}</h1>}
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
        )}
        {children}
      </main>
      <ToastContainer />
    </div>
  )
}
