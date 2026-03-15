import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useTreeStore = defineStore('tree', () => {
  const treeData = ref([])
  const loading = ref(false)
  const expandedKeys = ref([])

  const loadNode = async (path = null, depth = 1) => {
    loading.value = true
    try {
      const { data } = await api.getFiles({ path, depth })
      return data.children || []
    } catch (err) {
      console.error('Failed to load tree node:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const expandNode = (key) => {
    if (!expandedKeys.value.includes(key)) {
      expandedKeys.value.push(key)
    }
  }

  const collapseNode = (key) => {
    expandedKeys.value = expandedKeys.value.filter(k => k !== key)
  }

  return {
    treeData,
    loading,
    expandedKeys,
    loadNode,
    expandNode,
    collapseNode
  }
})
