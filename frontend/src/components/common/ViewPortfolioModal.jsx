import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from './Modal'
import Button from './Button'

export default function ViewPortfolioModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [code, setCode] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) return
    setCode('')
    onClose()
    navigate(`/p/${trimmed}`)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="View a portfolio">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-field">Portfolio code</label>
          <input
            type="text"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. A1B2C3D4"
            className="input-field font-mono uppercase tracking-wider"
          />
        </div>
        <Button variant="primary" type="submit" className="w-full py-2.5" disabled={!code.trim()}>
          View portfolio
        </Button>
      </form>
    </Modal>
  )
}
