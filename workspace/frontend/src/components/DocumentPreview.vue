<template>
  <div class="document-preview">
    <!-- 工具栏 -->
    <div class="preview-toolbar">
      <div class="toolbar-left">
        <el-button size="small" @click="toggleToc">
          <el-icon><List /></el-icon>
          目录
        </el-button>
        <el-button size="small" @click="zoomOut">
          <el-icon><ZoomOut /></el-icon>
        </el-button>
        <span class="font-size">{{ fontSize }}px</span>
        <el-button size="small" @click="zoomIn">
          <el-icon><ZoomIn /></el-icon>
        </el-button>
        <el-divider direction="vertical" />
        <el-button size="small" @click="copyContent">
          <el-icon><DocumentCopy /></el-icon>
          复制
        </el-button>
      </div>

      <div class="toolbar-right">
        <el-button size="small" @click="toggleTheme">
          <el-icon><component :is="isDark ? 'Sunny' : 'Moon'" /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 阅读进度条 -->
    <div class="progress-bar-container">
      <div class="progress-bar" :style="{ width: scrollProgress + '%' }" />
    </div>

    <div class="preview-content" ref="contentRef" :style="{ fontSize: fontSize + 'px' }">
      <!-- Markdown 内容 -->
      <div
        v-if="doc?.type === 'markdown'"
        class="markdown-body"
        :class="{ 'dark-mode': isDark }"
        v-html="doc.html"
      />

      <!-- 代码文件 -->
      <div v-else-if="doc?.type === 'code'" class="code-preview">
        <pre><code :class="'language-' + doc.language">{{ doc.content }}</code></pre>
      </div>

      <!-- 纯文本 -->
      <div v-else class="text-preview">
        <pre>{{ doc?.content }}</pre>
      </div>
    </div>

    <!-- 目录侧边栏 -->
    <el-drawer
      v-model="tocVisible"
      title="文档目录"
      size="280px"
      :with-header="true"
    >
      <div class="toc-list">
        <div
          v-for="(heading, index) in toc"
          :key="index"
          class="toc-item"
          :style="{ paddingLeft: (heading.level - 1) * 16 + 'px' }"
          :class="{ active: activeHeading === index }"
          @click="scrollToHeading(index, heading.id)"
        >
          <span class="toc-text">{{ heading.text }}</span>
        </div>
        <el-empty v-if="toc.length === 0" description="无目录结构" :image-size="80" />
      </div>
    </el-drawer>

    <!-- 文件信息面板 -->
    <div class="doc-info">
      <el-descriptions title="文件信息" :column="2" size="small" border>
        <el-descriptions-item label="文件名">{{ doc?.name }}</el-descriptions-item>
        <el-descriptions-item label="大小">{{ doc?.meta?.sizeFormatted }}</el-descriptions-item>
        <el-descriptions-item label="行数">{{ doc?.meta?.lines }}</el-descriptions-item>
        <el-descriptions-item label="字数">{{ doc?.meta?.wordCount }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">
          {{ formatDate(doc?.meta?.updatedAt) }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { List, ZoomIn, ZoomOut, DocumentCopy, Moon, Sunny } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  doc: {
    type: Object,
    default: () => ({})
  }
})

const contentRef = ref(null)
const fontSize = ref(16)
const isDark = ref(false)
const tocVisible = ref(false)
const toc = ref([])
const activeHeading = ref(-1)
const scrollProgress = ref(0)

// 提取目录
const extractToc = (html) => {
  const headings = []
  const regex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/g
  let match
  
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1])
    const id = match[2]
    const text = match[3].replace(/<[^>]*>/g, '')
    
    headings.push({ level, id, text })
  }
  
  return headings
}

// 切换目录
const toggleToc = () => {
  tocVisible.value = !tocVisible.value
}

// 缩放
const zoomIn = () => {
  fontSize.value = Math.min(fontSize.value + 2, 24)
}

const zoomOut = () => {
  fontSize.value = Math.max(fontSize.value - 2, 12)
}

// 切换主题
const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

// 复制内容
const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(props.doc?.content || '')
    ElMessage.success('已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 滚动到标题
const scrollToHeading = (index, id) => {
  activeHeading.value = index
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  tocVisible.value = false
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

// 监听滚动
const handleScroll = () => {
  if (contentRef.value) {
    const scrollTop = contentRef.value.scrollTop
    const scrollHeight = contentRef.value.scrollHeight - contentRef.value.clientHeight
    scrollProgress.value = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
  }
}

// 监听内容变化
watchEffect(() => {
  if (props.doc?.html) {
    toc.value = extractToc(props.doc.html)
  }
})

onMounted(() => {
  if (contentRef.value) {
    contentRef.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (contentRef.value) {
    contentRef.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.document-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
}

.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  position: sticky;
  top: 0;
  z-index: 10;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.font-size {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  min-width: 40px;
  text-align: center;
}

.progress-bar-container {
  height: 3px;
  background: var(--el-fill-color);
  position: relative;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3));
  transition: width 0.2s;
}

.preview-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.markdown-body {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
  scroll-margin-top: 80px;
}

.markdown-body :deep(h1) {
  font-size: 2em;
  border-bottom: 1px solid var(--el-border-color);
  padding-bottom: 0.3em;
}

.markdown-body :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid var(--el-border-color);
  padding-bottom: 0.3em;
}

.markdown-body :deep(code) {
  padding: 0.2em 0.4em;
  font-size: 0.9em;
  background: var(--el-fill-color);
  border-radius: 3px;
}

.markdown-body :deep(pre) {
  padding: 16px;
  overflow: auto;
  background: var(--el-fill-color);
  border-radius: 6px;
}

.markdown-body :deep(pre code) {
  padding: 0;
  background: transparent;
}

.markdown-body :deep(blockquote) {
  padding: 0 1em;
  color: var(--el-text-color-secondary);
  border-left: 4px solid var(--el-border-color);
}

.markdown-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  padding: 8px 12px;
  border: 1px solid var(--el-border-color);
}

.markdown-body :deep(tr:nth-child(even)) {
  background: var(--el-fill-color-light);
}

.markdown-body.dark-mode {
  filter: none;
}

.code-preview,
.text-preview {
  max-width: 900px;
  margin: 0 auto;
}

.code-preview pre,
.text-preview pre {
  padding: 16px;
  background: var(--el-fill-color);
  border-radius: 6px;
  overflow: auto;
  font-family: 'Consolas', 'Monaco', monospace;
}

/* 目录样式 */
.toc-list {
  padding: 10px;
}

.toc-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.toc-item:hover {
  background: var(--el-fill-color-light);
}

.toc-item.active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.toc-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 文件信息 */
.doc-info {
  padding: 16px 20px;
  border-top: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
}
</style>
