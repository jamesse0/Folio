import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import ViewPortfolioModal from '../common/ViewPortfolioModal'
import Button from '../common/Button'

export default function Header({ onUploadClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [viewPortfolioOpen, setViewPortfolioOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1.5 text-sm rounded-lg transition-colors ${
      isActive ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800/70'
    }`

  return (
    <header className="sticky top-0 z-30 bg-gray-950/85 backdrop-blur border-b border-gray-800 px-6 h-16 flex items-center justify-between shrink-0">
      <Link to="/dashboard" className="flex items-center gap-2.5">
        <span className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">F</span>
        <span className="text-white font-semibold tracking-tight">Folio</span>
      </Link>
      <nav className="flex items-center gap-1">
        {onUploadClick && (
          <Button variant="primary" onClick={onUploadClick} className="mr-2">
            Upload
          </Button>
        )}
        <NavLink to="/dashboard" className={navLinkClass}>
          Photos
        </NavLink>
        <button
          onClick={() => setViewPortfolioOpen(true)}
          className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800/70 rounded-lg transition-colors"
        >
          View portfolio
        </button>
        <NavLink to="/profile" className={navLinkClass}>
          {user?.username ?? 'Profile'}
        </NavLink>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800/70 rounded-lg transition-colors"
        >
          Logout
        </button>
      </nav>
      <ViewPortfolioModal isOpen={viewPortfolioOpen} onClose={() => setViewPortfolioOpen(false)} />
    </header>
  )
}
