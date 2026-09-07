import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/common/Button'

export default function RegisterPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', email: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true })
    return null
  }

  const handleChange = (e) => {
    setErrors((prev) => ({ ...prev, [e.target.name]: null }))
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const validate = () => {
    const errs = {}
    if (form.username.length < 3) errs.username = 'Must be at least 3 characters.'
    if (form.password.length < 6) errs.password = 'Must be at least 6 characters.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError(null)
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await register({ ...form, email: form.email || undefined })
      // Auto-login after register
      await login({ username: form.username, password: form.password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setServerError(err.response?.data?.detail ?? 'Registration failed.')
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
          <h1 className="text-xl font-semibold text-white">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Start building your portfolio</p>
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
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
            </div>
            <div>
              <label className="label-field">Password</label>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                required
                className="input-field"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="label-field">
                Email <span className="text-gray-600">(optional)</span>
              </label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            {serverError && <p className="text-red-400 text-sm">{serverError}</p>}
            <Button variant="primary" type="submit" loading={loading} className="w-full py-2.5">
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
