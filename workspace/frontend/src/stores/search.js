import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useSearchStore = defineStore('search', () => {
  const results = ref([])
  const total = ref(0)
  const loading = ref(false)
  const query = ref('')

  const search = async (q, params = {}) => {
    loading.value = true
    query.value = q
    
    try {
      const { data } = await api.search(q, params)
      results.value = data.results
      total.value = data.total
      return data
    } catch (err) {
      console.error('Search failed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clear = () => {
    results.value = []
    total.value = 0
    query.value = ''
  }

  return {
    results,
    total,
    loading,
    query,
    search,
    clear
  }
})
