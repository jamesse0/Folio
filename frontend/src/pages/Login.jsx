import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/common/Button'
import ViewPortfolioModal from '../components/common/ViewPortfolioModal'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [viewPortfolioOpen, setViewPortfolioOpen] = useState(false)

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true })
    return null
  }

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(form)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <span className="h-11 w-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg mb-3 shadow-lg shadow-indigo-950/40">F</span>
          <h1 className="text-xl font-semibold text-white">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Log in to manage your portfolio</p>
        </div>

        <div className="card shadow-2xl shadow-black/30 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field">Username</label>
              <input
                name="username"
                type="text"
                autoComplete="username"
                autoFocus
                value={form.username}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Password</label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button variant="primary" type="submit" loading={loading} className="w-full py-2.5">
              Log in
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          No account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Register
          </Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          <button
            type="button"
            onClick={() => setViewPortfolioOpen(true)}
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View a portfolio
          </button>
        </p>
      </div>
      <ViewPortfolioModal isOpen={viewPortfolioOpen} onClose={() => setViewPortfolioOpen(false)} />
    </div>
  )
}
