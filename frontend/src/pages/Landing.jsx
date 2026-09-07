import { Navigate } from 'react-router-dom'

// No separate landing — send everyone to dashboard (redirects to /login if unauthenticated)
export default function LandingPage() {
  return <Navigate to="/dashboard" replace />
}