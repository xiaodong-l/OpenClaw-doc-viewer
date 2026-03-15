import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useDocStore = defineStore('doc', () => {
  const currentDoc = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const loadDocument = async (path) => {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await api.getFileContent(path)
      currentDoc.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const clear = () => {
    currentDoc.value = null
    error.value = null
  }

  return {
    currentDoc,
    loading,
    error,
    loadDocument,
    clear
  }
})
