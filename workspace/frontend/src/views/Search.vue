<template>
  <div class="search-page">
    <div class="search-header">
      <h2>🔍 搜索文档</h2>
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="输入关键词搜索..."
          clearable
          size="large"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button @click="handleSearch">
              搜索
            </el-button>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="hasSearched" class="search-results">
      <div class="results-info">
        <span v-if="loading">搜索中...</span>
        <span v-else>
          找到 <strong>{{ total }}</strong> 个结果
          <span v-if="searchQuery">关于 "<mark>{{ searchQuery }}</mark>"</span>
        </span>
      </div>

      <!-- 结果列表 -->
      <div v-if="!loading && results.length > 0" class="results-list">
        <div
          v-for="(item, index) in results"
          :key="item.path"
          class="result-item"
          @click="navigateToDoc(item.path)"
        >
          <div class="result-header">
            <el-icon class="result-icon"><Document /></el-icon>
            <h3 class="result-title">{{ item.title }}</h3>
          </div>
          <div class="result-path">{{ item.path }}</div>
          <div class="result-excerpt" v-html="item.excerpt"></div>
          <div class="result-meta">
            <span class="result-date">{{ formatDate(item.updatedAt) }}</span>
          </div>
        </div>
      </div>

      <!-- 无结果 -->
      <div v-else-if="!loading" class="no-results">
        <el-empty description="未找到相关文档" />
      </div>

      <!-- 分页 -->
      <div v-if="results.length > 0" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @change="handlePageChange"
        />
      </div>
    </div>

    <!-- 初始状态 -->
    <div v-else class="search-initial">
      <el-empty description="输入关键词开始搜索" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search, Document } from '@element-plus/icons-vue'
import api from '@/api'

const router = useRouter()
const route = useRoute()

const searchQuery = ref(route.query.q || '')
const results = ref([])
const total = ref(0)
const loading = ref(false)
const hasSearched = ref(!!route.query.q)
const currentPage = ref(1)
const pageSize = ref(20)

const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  
  hasSearched.value = true
  currentPage.value = 1
  router.push({ query: { q: searchQuery.value } })
  performSearch()
}

const performSearch = async () => {
  const query = route.query.q
  if (!query) return

  loading.value = true
  try {
    const { data } = await api.search(query, {
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value
    })
    
    results.value = data.results || []
    total.value = data.total || 0
  } catch (err) {
    console.error('Search failed:', err)
    results.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handlePageChange = () => {
  performSearch()
}

const navigateToDoc = (path) => {
  router.push({ path: '/document', query: { path } })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 初始化
if (route.query.q) {
  performSearch()
}
</script>

<style scoped>
.search-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-header {
  margin-bottom: 30px;
}

.search-header h2 {
  margin-bottom: 20px;
  color: var(--el-text-color-primary);
}

.search-box {
  max-width: 600px;
}

.search-results {
  margin-top: 20px;
}

.results-info {
  margin-bottom: 20px;
  color: var(--el-text-color-secondary);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item {
  padding: 20px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.result-icon {
  color: var(--el-color-primary);
  font-size: 20px;
}

.result-title {
  margin: 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.result-path {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
  font-family: monospace;
}

.result-excerpt {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin-bottom: 12px;
}

.result-excerpt :deep(mark) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  padding: 2px 4px;
  border-radius: 2px;
}

.result-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.search-initial {
  margin-top: 60px;
}
</style>
