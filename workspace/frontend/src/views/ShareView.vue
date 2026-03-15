<template>
  <div class="share-page">
    <!-- 加载状态 -->
    <el-container v-if="loading">
      <el-header>
        <el-skeleton :rows="2" animated />
      </el-header>
      <el-main>
        <el-skeleton :rows="10" animated />
      </el-main>
    </el-container>
    
    <!-- 错误状态 -->
    <el-container v-else-if="error">
      <div class="error-container">
        <el-result
          :icon="errorIcon"
          :title="errorTitle"
          :sub-title="error"
        >
          <template #extra>
            <el-button type="primary" @click="goHome">返回首页</el-button>
          </template>
        </el-result>
      </div>
    </el-container>
    
    <!-- 正常内容 -->
    <el-container v-else>
      <el-header>
        <div class="header-content">
          <div class="header-left">
            <h1 class="document-title">📄 {{ shareData.documentTitle }}</h1>
            <div class="share-info">
              <el-tag size="small" type="info">
                由 {{ shareData.createdBy }} 分享
              </el-tag>
              <span class="share-date">{{ formatDate(shareData.createdAt) }}</span>
            </div>
          </div>
          <div class="header-right">
            <el-button @click="goHome">
              <el-icon><HomeFilled /></el-icon>
              返回首页
            </el-button>
            <el-button
              v-if="isLoggedIn"
              type="primary"
              @click="addToCollection"
            >
              <el-icon><Star /></el-icon>
              加入收藏
            </el-button>
          </div>
        </div>
      </el-header>
      
      <el-main>
        <div class="document-content">
          <!-- 目录 (如果有) -->
          <div v-if="toc && toc.length > 0" class="toc-container">
            <el-card shadow="never">
              <template #header>
                <span>📑 目录</span>
              </template>
              <el-tree
                :data="toc"
                :props="{ label: 'title', children: 'children' }"
                :expand-on-click-node="false"
                @node-click="handleTocClick"
              />
            </el-card>
          </div>
          
          <!-- Markdown 内容 -->
          <div class="markdown-body" v-html="documentHtml"></div>
        </div>
      </el-main>
      
      <el-footer>
        <el-alert
          type="info"
          :closable="false"
          show-icon
        >
          <template #title>
            <div class="footer-content">
              <span>此为公开分享页面</span>
              <el-tag size="small" type="warning" v-if="shareData.permissions === 'read'">
                只读权限
              </el-tag>
            </div>
          </template>
        </el-alert>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { HomeFilled, Star } from '@element-plus/icons-vue'
import markdownIt from 'markdown-it'
import api from '@/api'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const shareData = ref(null)
const documentHtml = ref('')
const toc = ref([])

const md = markdownIt({
  html: true,
  linkify: true,
  typographer: true
})

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('doc-viewer-token')
})

const errorIcon = computed(() => {
  if (error.value?.includes('过期')) return 'time'
  if (error.value?.includes('不存在')) return 'warning'
  return 'error'
})

const errorTitle = computed(() => {
  if (error.value?.includes('过期')) return '分享已过期'
  if (error.value?.includes('不存在')) return '分享不存在'
  return '访问失败'
})

onMounted(async () => {
  await loadShare()
})

const loadShare = async () => {
  try {
    const { token } = route.params
    
    // 获取分享信息
    const shareRes = await api.shares.getPublic(token)
    shareData.value = shareRes.data
    
    // 获取文档内容
    const docRes = await api.shares.getDocument(token, shareData.value.documentPath)
    documentHtml.value = md.render(docRes.data.content)
    toc.value = docRes.data.toc || []
    
    // 记录阅读历史 (如果已登录)
    if (isLoggedIn.value) {
      await api.addReadingHistory({
        path: shareData.value.documentPath,
        title: shareData.value.documentTitle
      })
    }
  } catch (e) {
    console.error('Load share error:', e)
    error.value = e.response?.data?.error || e.response?.data || '加载失败'
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleTocClick = (node) => {
  const element = document.getElementById(node.id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const goHome = () => {
  router.push('/')
}

const addToCollection = async () => {
  try {
    // 获取用户的收藏夹
    const collections = await api.getCollections()
    
    if (!collections.data || collections.data.length === 0) {
      // 没有收藏夹，创建默认收藏夹
      const name = await ElMessageBox.prompt('请输入收藏夹名称', '创建收藏夹', {
        inputPlaceholder: '默认收藏夹',
        confirmButtonText: '创建',
        cancelButtonText: '取消'
      })
      
      await api.createCollection(name.value)
      await addDocumentToCollection()
    } else {
      // 选择收藏夹
      const collection = await ElMessageBox.alert(
        '请选择收藏夹',
        '加入收藏',
        {
          confirmButtonText: '确定',
          before: async (action, instance) => {
            // 这里可以添加选择逻辑
            instance.close()
            await addDocumentToCollection(collections.data[0].id)
          }
        }
      )
    }
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('收藏失败')
    }
  }
}

const addDocumentToCollection = async (collectionId) => {
  try {
    await api.addDocumentToCollection(collectionId, {
      path: shareData.value.documentPath,
      title: shareData.value.documentTitle
    })
    ElMessage.success('收藏成功')
  } catch (e) {
    ElMessage.error('收藏失败')
  }
}
</script>

<style scoped>
.share-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.el-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0;
  height: auto;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  flex: 1;
}

.document-title {
  margin: 0 0 12px 0;
  font-size: 24px;
  color: #303133;
  font-weight: 600;
}

.share-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.share-date {
  font-size: 14px;
  color: #909399;
}

.header-right {
  display: flex;
  gap: 12px;
}

.el-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.document-content {
  display: flex;
  gap: 24px;
}

.toc-container {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 24px;
  height: fit-content;
}

.toc-container :deep(.el-card__header) {
  padding: 12px 16px;
  font-weight: 500;
}

.markdown-body {
  flex: 1;
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.el-footer {
  padding: 16px 24px;
  background: transparent;
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

/* Markdown 样式 */
:deep(.markdown-body) {
  font-size: 16px;
  line-height: 1.8;
}

:deep(.markdown-body h1) {
  font-size: 2em;
  margin-bottom: 0.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

:deep(.markdown-body h2) {
  font-size: 1.5em;
  margin-bottom: 0.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

:deep(.markdown-body code) {
  background: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

:deep(.markdown-body pre) {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  overflow: auto;
}

:deep(.markdown-body pre code) {
  background: transparent;
  padding: 0;
}

:deep(.markdown-body blockquote) {
  border-left: 4px solid #dfe2e5;
  padding-left: 16px;
  color: #6a737d;
}

:deep(.markdown-body table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}

:deep(.markdown-body table th),
:deep(.markdown-body table td) {
  border: 1px solid #dfe2e5;
  padding: 8px 12px;
}

:deep(.markdown-body table th) {
  background: #f6f8fa;
  font-weight: 600;
}

/* 暗黑模式支持 */
html.dark .share-page {
  background: #141414;
}

html.dark .el-header {
  background: #1a1a1a;
  border-bottom-color: #333;
}

html.dark .document-title {
  color: #e5e5e5;
}

html.dark .markdown-body {
  background: #1a1a1a;
  color: #cccccc;
}

html.dark .markdown-body h1,
html.dark .markdown-body h2 {
  border-bottom-color: #333;
}

html.dark .markdown-body code {
  background: #2a2a2a;
}

html.dark .markdown-body pre {
  background: #2a2a2a;
}

html.dark .markdown-body table th,
html.dark .markdown-body table td {
  border-color: #333;
}

html.dark .markdown-body table th {
  background: #242424;
}

html.dark .markdown-body blockquote {
  border-left-color: #333;
  color: #999;
}

html.dark .toc-container :deep(.el-card) {
  background: #1a1a1a;
  border-color: #333;
}

html.dark .toc-container :deep(.el-card__header) {
  background: #242424;
  border-bottom-color: #333;
  color: #e5e5e5;
}
</style>
