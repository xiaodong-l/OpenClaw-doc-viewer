<template>
  <div class="reading-history">
    <div class="history-header">
      <h3>📜 阅读历史</h3>
      <div class="header-actions">
        <el-button 
          v-if="history.length > 0" 
          text 
          type="danger" 
          size="small"
          @click="clearHistory"
        >
          <el-icon><Delete /></el-icon>
          清空历史
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="history.length === 0" class="empty">
      <el-empty description="暂无阅读历史" />
    </div>

    <div v-else class="history-list">
      <div
        v-for="(item, index) in history"
        :key="item.path + index"
        class="history-item"
        @click="navigateToDoc(item.path)"
      >
        <el-icon class="item-icon"><Document /></el-icon>
        <div class="item-info">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-path">{{ item.path }}</div>
          <div class="item-time">
            <el-icon><Clock /></el-icon>
            {{ formatTime(item.readAt) }}
          </div>
        </div>
        <el-button
          text
          type="info"
          size="small"
          @click.stop="removeHistory(item.path)"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Clock, Delete, Close } from '@element-plus/icons-vue'
import api from '@/api'

const router = useRouter()

const loading = ref(false)
const history = ref([])

const loadHistory = async () => {
  loading.value = true
  try {
    const { data } = await api.getReadingHistory()
    history.value = data
  } catch (err) {
    ElMessage.error('加载历史失败')
  } finally {
    loading.value = false
  }
}

const clearHistory = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有阅读历史吗？', '警告', {
      confirmButtonText: '清空',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await api.clearReadingHistory()
    ElMessage.success('已清空')
    await loadHistory()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(err.response?.data?.error?.message || '清空失败')
    }
  }
}

const removeHistory = async (path) => {
  try {
    await api.removeReadingHistory(path)
    ElMessage.success('已移除')
    await loadHistory()
  } catch (err) {
    ElMessage.error(err.response?.data?.error?.message || '移除失败')
  }
}

const navigateToDoc = (path) => {
  router.push({ path: '/document', query: { path } })
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadHistory()
})

defineExpose({
  refresh: loadHistory,
  add: loadHistory
})
</script>

<style scoped>
.reading-history {
  padding: 20px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.history-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.loading, .empty {
  padding: 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.history-item:hover {
  border-color: var(--el-color-primary);
  background: var(--el-fill-color-light);
  transform: translateX(4px);
}

.item-icon {
  color: var(--el-color-primary);
  font-size: 24px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  overflow: hidden;
}

.item-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 6px;
}

.item-path {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.item-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.item-time .el-icon {
  font-size: 14px;
}
</style>
