<template>
  <div class="home">
    <div class="home-header">
      <h2>📊 文档统计</h2>
    </div>
    
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-statistic title="总文件数" :value="stats.totalFiles" />
      </el-col>
      <el-col :span="8">
        <el-statistic title="总目录数" :value="stats.totalDirectories" />
      </el-col>
      <el-col :span="8">
        <el-statistic title="总大小" :value="stats.totalSizeFormatted" />
      </el-col>
    </el-row>

    <div class="content-area">
      <div class="sidebar">
        <div class="sidebar-header">
          <h3>📂 目录结构</h3>
          <el-button size="small" @click="refreshTree">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
        <DirectoryTree ref="treeRef" />
      </div>
      
      <div class="main-content">
        <h3>📈 最近访问</h3>
        <el-empty description="暂无最近访问记录" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import api from '@/api'
import DirectoryTree from '@/components/DirectoryTree.vue'

const treeRef = ref(null)
const stats = ref({
  totalFiles: 0,
  totalDirectories: 0,
  totalSizeFormatted: '0B'
})

const refreshTree = () => {
  treeRef.value?.loadRootNodes()
}

const loadStats = async () => {
  try {
    const { data } = await api.getStats()
    stats.value = data
  } catch (err) {
    console.error('Failed to load stats:', err)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.home {
  padding: 20px;
  height: 100%;
  overflow: auto;
}

.home-header {
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 30px;
}

.content-area {
  display: flex;
  gap: 20px;
  height: calc(100% - 200px);
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-fill-color-light);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.main-content {
  flex: 1;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 20px;
  overflow: auto;
}

.main-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 500;
}
</style>
