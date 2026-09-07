import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/common/Button'
import Spinner from '../components/common/Spinner'
import { useAuth } from '../hooks/useAuth'
import { getProfile, updateProfile, deleteAccount } from '../api/profile'
import { getCode, regenerateCode } from '../api/portfolio'

export default function ProfilePage() {
  const { logout, setUser } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [portfolioCode, setPortfolioCode] = useState(null)
  const [form, setForm] = useState({ name: '', bio: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    Promise.all([getProfile(), getCode()]).then(([{ data: p }, { data: c }]) => {
      setProfile(p)
      setPortfolioCode(c.code)
      setForm({ name: p.name ?? '', bio: p.bio ?? '', email: p.email ?? '' })
    })
  }, [])

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveMsg(null)
    try {
      const { data } = await updateProfile({
        name: form.name || null,
        bio: form.bio || null,
        email: form.email || null,
      })
      setProfile(data)
      setUser(data)
      setSaveMsg('Saved.')
      setTimeout(() => setSaveMsg(null), 2500)
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const { data } = await regenerateCode()
      setPortfolioCode(data.code)
    } finally {
      setRegenerating(false)
    }
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/p/${portfolioCode}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeleteAccount = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    try {
      await deleteAccount()
      await logout()
      navigate('/login', { replace: true })
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (!profile) {
    return (
      <PageWrapper>
        <div className="flex justify-center py-24"><Spinner /></div>
      </PageWrapper>
    )
  }

  const portfolioUrl = portfolioCode ? `${window.location.origin}/p/${portfolioCode}` : ''

  return (
    <PageWrapper title="Settings" description="Manage your profile and portfolio access">
      <div className="max-w-lg space-y-8">

        {/* Profile form */}
        <section className="card p-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">Profile</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label-field">Username</label>
              <p className="text-sm text-gray-400 bg-gray-950 border border-gray-800 rounded-lg px-3.5 py-2.5">
                {profile.username}
              </p>
            </div>
            <div>
              <label className="label-field">Display name</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={3}
                placeholder="A short bio"
                className="input-field resize-none"
              />
            </div>
            <div>
              <label className="label-field">Email <span className="text-gray-600">(optional)</span></label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>
            <div className="flex items-center gap-4 pt-1">
              <Button variant="primary" type="submit" loading={saving}>Save changes</Button>
              {saveMsg && <span className="text-sm text-green-400">{saveMsg}</span>}
            </div>
          </form>
        </section>

        {/* Portfolio code */}
        <section className="card p-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">Portfolio link</h2>
          <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-gray-300 font-mono truncate">{portfolioUrl}</code>
              <button
                onClick={handleCopyLink}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors shrink-0"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-gray-800">
              <span className="text-xs text-gray-500">Code: <span className="font-mono text-gray-300">{portfolioCode}</span></span>
              <Button variant="ghost" onClick={handleRegenerate} loading={regenerating} className="text-xs ml-auto">
                Regenerate
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Regenerating creates a new code — old links will stop working.
          </p>
        </section>

        {/* Danger zone */}
        <section className="card border-red-900/60 p-6">
          <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-5">Danger zone</h2>
          <p className="text-sm text-gray-400 mb-4">
            Deletes your account and all photos permanently. This cannot be undone.
          </p>
          {confirmDelete && (
            <p className="text-sm text-red-400 mb-3">Are you sure? Click again to confirm.</p>
          )}
          <div className="flex items-center gap-3">
            <Button variant="danger" onClick={handleDeleteAccount} loading={deleting}>
              {confirmDelete ? 'Yes, delete my account' : 'Delete account'}
            </Button>
            {confirmDelete && (
              <button onClick={() => setConfirmDelete(false)} className="text-sm text-gray-500 hover:text-gray-300">
                Cancel
              </button>
            )}
          </div>
        </section>

      </div>
    </PageWrapper>
  )
}