import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

const TOKEN_KEY = 'doc-viewer-token'
const USER_KEY = 'doc-viewer-user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))
  const token = ref(localStorage.getItem(TOKEN_KEY) || null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const canWrite = computed(() => ['admin', 'editor'].includes(user.value?.role))

  const login = async (username, password) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.login(username, password)
      
      token.value = data.token
      user.value = data.user
      
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      
      return data
    } catch (err) {
      error.value = err.response?.data?.error?.message || '登录失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  const fetchUser = async () => {
    if (!token.value) return

    loading.value = true
    try {
      const { data } = await api.getCurrentUser()
      user.value = data.user
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    } catch (err) {
      logout()
    } finally {
      loading.value = false
    }
  }

  const hasPermission = (permission) => {
    if (!user.value) return false
    return user.value.permissions?.includes(permission) || 
           user.value.permissions?.includes('admin')
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    canWrite,
    login,
    logout,
    fetchUser,
    hasPermission
  }
})
