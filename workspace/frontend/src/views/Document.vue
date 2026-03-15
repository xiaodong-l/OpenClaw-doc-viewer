<template>
  <div class="document-view">
    <!-- 面包屑导航 -->
    <Breadcrumb class="breadcrumb" />

    <!-- 文档内容 -->
    <div v-if="docStore.loading" class="loading">
      <el-skeleton :rows="15" animated />
    </div>

    <div v-else-if="docStore.error" class="error">
      <el-result icon="error" title="加载失败" :sub-title="docStore.error">
        <template #extra>
          <el-button type="primary" @click="reload">重试</el-button>
        </template>
      </el-result>
    </div>

    <template v-else-if="docStore.currentDoc">
      <DocumentPreview :doc="docStore.currentDoc" />
      
      <!-- 评论区域 - v1.3.0 新增 -->
      <DocumentComments
        :document-path="docStore.currentDoc.path"
        @update="handleCommentUpdate"
      />
    </template>

    <el-empty v-else description="请选择文档查看" />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDocStore } from '../stores/doc'
import Breadcrumb from '@/components/Breadcrumb.vue'
import DocumentPreview from '@/components/DocumentPreview.vue'
import DocumentComments from '@/components/DocumentComments.vue'

const route = useRoute()
const docStore = useDocStore()

const currentPath = computed(() => route.query.path)

const loadDocument = async () => {
  if (currentPath.value) {
    try {
      await docStore.loadDocument(currentPath.value)
    } catch (err) {
      console.error('Failed to load document:', err)
    }
  }
}

const reload = () => {
  docStore.clear()
  loadDocument()
}

const handleCommentUpdate = () => {
  // 评论更新时的处理，可以刷新文档信息或执行其他操作
  console.log('Comment updated')
}

watch(() => route.query.path, loadDocument)

onMounted(() => {
  if (currentPath.value) {
    loadDocument()
  }
})
</script>

<style>
@import 'github-markdown-css';

.document-view {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
  background: var(--el-bg-color);
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color);
}

.loading, .error {
  padding: 40px;
}

.document {
  max-width: 900px;
  margin: 0 auto;
}

.doc-header {
  margin-bottom: 20px;
}

.doc-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.doc-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  color: #606266;
  font-size: 13px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.markdown-body {
  box-sizing: border-box;
  padding: 30px;
  background: #fafafa;
  border-radius: 8px;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body h1 {
  font-size: 2em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-body h2 {
  font-size: 1.5em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-body code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27,31,35,0.05);
  border-radius: 3px;
}

.markdown-body pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 3px;
}

.markdown-body pre code {
  display: inline;
  padding: 0;
  margin: 0;
  overflow: visible;
  line-height: inherit;
  word-wrap: normal;
  background-color: transparent;
  border: 0;
}
</style>
