import useAuthStore from '../store/authStore'
import * as authApi from '../api/auth'
import { getProfile } from '../api/profile'

export function useAuth() {
  const { token, user, login: storeLogin, logout: storeLogout, setUser } = useAuthStore()

  const login = async (credentials) => {
    const { data: tokenData } = await authApi.login(credentials)
    // Set token first so the Axios interceptor picks it up for the profile fetch
    storeLogin(tokenData.access_token, null)
    const { data: profile } = await getProfile()
    storeLogin(tokenData.access_token, profile)
    return profile
  }

  const logout = async () => {
    try { await authApi.logout() } catch {}
    storeLogout()
  }

  return {
    token,
    user,
    isAuthenticated: !!token,
    login,
    logout,
    setUser,
  }
}