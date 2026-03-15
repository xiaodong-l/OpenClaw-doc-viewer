<template>
  <div class="document-collections">
    <!-- 收藏夹列表 -->
    <div class="collections-header">
      <h3>⭐ 我的收藏</h3>
      <div class="header-actions">
        <el-button
          v-if="hasSelection"
          type="warning"
          size="small"
          @click="toggleBatchMode"
        >
          退出批量 ({{ selectedDocuments.length }})
        </el-button>
        <el-button type="primary" size="small" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建收藏夹
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="collections.length === 0" class="empty">
      <el-empty description="暂无收藏夹" />
    </div>

    <el-collapse v-else v-model="activeCollection" accordion>
      <el-collapse-item
        v-for="collection in collections"
        :key="collection.id"
        :name="collection.id"
      >
        <template #title>
          <div class="collection-title">
            <el-icon><Folder /></el-icon>
            <span>{{ collection.name }}</span>
            <el-tag size="small" type="info">{{ collection.documents.length }}</el-tag>
            
            <!-- 批量模式下的全选 -->
            <el-checkbox
              v-if="batchMode && activeCollection === collection.id"
              :model-value="isAllSelected(collection.id)"
              @click.stop="toggleSelectAll(collection.id)"
              style="margin-left: 12px"
            />
          </div>
        </template>

        <div class="collection-content">
          <div v-if="collection.documents.length === 0" class="empty-docs">
            <el-empty :image-size="60" description="收藏夹为空" />
          </div>

          <div v-else class="doc-list">
            <div
              v-for="doc in collection.documents"
              :key="doc.path"
              class="doc-item"
              :class="{ selected: isDocumentSelected(collection.id, doc.path) }"
              @click="handleDocClick(collection.id, doc.path)"
            >
              <!-- 批量模式显示复选框 -->
              <el-checkbox
                v-if="batchMode"
                :model-value="isDocumentSelected(collection.id, doc.path)"
                @click.stop="toggleDocument(collection.id, doc.path)"
              />
              
              <el-icon class="doc-icon" :class="{ clickable: !batchMode }">
                <Document />
              </el-icon>
              
              <div class="doc-info" @click.stop="!batchMode && navigateToDoc(doc.path)">
                <div class="doc-title">{{ doc.title }}</div>
                <div class="doc-path">{{ doc.path }}</div>
              </div>
              
              <el-button
                v-if="!batchMode"
                text
                type="danger"
                size="small"
                @click.stop="removeDocument(collection.id, doc.path)"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <template #extra>
          <div class="collection-actions">
            <el-button text size="small" @click.stop="editCollection(collection)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button text size="small" type="danger" @click.stop="deleteCollection(collection.id)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </template>
      </el-collapse-item>
    </el-collapse>

    <!-- 批量操作工具栏 -->
    <BatchActions
      v-if="batchMode && selectedDocuments.length > 0"
      :selected-items="selectedDocuments.map(d => d.path)"
      action-type="documents"
      :collections="collections"
      :source-collection-id="activeCollection"
      @update="loadCollections"
      @clear="clearSelection"
    />

    <!-- 创建收藏夹对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新建收藏夹"
      width="400px"
    >
      <el-input
        v-model="newCollectionName"
        placeholder="输入收藏夹名称"
        @keyup.enter="createCollection"
      />
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createCollection">创建</el-button>
      </template>
    </el-dialog>

    <!-- 编辑收藏夹对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑收藏夹"
      width="400px"
    >
      <el-input
        v-model="editCollectionName"
        placeholder="输入收藏夹名称"
        @keyup.enter="updateCollection"
      />
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="updateCollection">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Folder,
  Document,
  Edit,
  Delete,
  Close
} from '@element-plus/icons-vue'
import api from '@/api'
import BatchActions from './BatchActions.vue'

const router = useRouter()

const loading = ref(false)
const collections = ref([])
const activeCollection = ref(null)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const newCollectionName = ref('')
const editCollectionName = ref('')
const editingCollection = ref(null)

// 批量操作相关
const batchMode = ref(false)
const selectedDocuments = ref([]) // { collectionId, path }

const hasSelection = computed(() => selectedDocuments.value.length > 0)

const toggleBatchMode = () => {
  batchMode.value = !batchMode.value
  if (!batchMode.value) {
    clearSelection()
  }
}

const handleDocClick = (collectionId, docPath) => {
  if (batchMode.value) {
    toggleDocument(collectionId, docPath)
  } else {
    navigateToDoc(docPath)
  }
}

const isDocumentSelected = (collectionId, docPath) => {
  return selectedDocuments.value.some(d => d.collectionId === collectionId && d.path === docPath)
}

const toggleDocument = (collectionId, docPath) => {
  const index = selectedDocuments.value.findIndex(d => d.collectionId === collectionId && d.path === docPath)
  if (index > -1) {
    selectedDocuments.value.splice(index, 1)
  } else {
    selectedDocuments.value.push({ collectionId, path: docPath })
  }
}

const isAllSelected = (collectionId) => {
  const collection = collections.value.find(c => c.id === collectionId)
  if (!collection) return false
  
  return collection.documents.every(doc =>
    selectedDocuments.value.some(d => d.collectionId === collectionId && d.path === doc.path)
  )
}

const toggleSelectAll = (collectionId) => {
  const collection = collections.value.find(c => c.id === collectionId)
  if (!collection) return
  
  if (isAllSelected(collectionId)) {
    // 取消全选
    selectedDocuments.value = selectedDocuments.value.filter(d => d.collectionId !== collectionId)
  } else {
    // 全选
    collection.documents.forEach(doc => {
      if (!isDocumentSelected(collectionId, doc.path)) {
        selectedDocuments.value.push({ collectionId, path: doc.path })
      }
    })
  }
}

const clearSelection = () => {
  selectedDocuments.value = []
}

const loadCollections = async () => {
  loading.value = true
  try {
    const { data } = await api.getCollections()
    collections.value = data
  } catch (err) {
    ElMessage.error('加载收藏夹失败')
  } finally {
    loading.value = false
  }
}

const createCollection = async () => {
  if (!newCollectionName.value.trim()) {
    ElMessage.warning('请输入收藏夹名称')
    return
  }

  try {
    await api.createCollection(newCollectionName.value.trim())
    ElMessage.success('创建成功')
    showCreateDialog.value = false
    newCollectionName.value = ''
    await loadCollections()
  } catch (err) {
    ElMessage.error(err.response?.data?.error?.message || '创建失败')
  }
}

const editCollection = (collection) => {
  editingCollection.value = collection
  editCollectionName.value = collection.name
  showEditDialog.value = true
}

const updateCollection = async () => {
  if (!editCollectionName.value.trim()) {
    ElMessage.warning('请输入收藏夹名称')
    return
  }

  try {
    await api.updateCollection(editingCollection.value.id, editCollectionName.value.trim())
    ElMessage.success('更新成功')
    showEditDialog.value = false
    await loadCollections()
  } catch (err) {
    ElMessage.error(err.response?.data?.error?.message || '更新失败')
  }
}

const deleteCollection = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个收藏夹吗？', '警告', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await api.deleteCollection(id)
    ElMessage.success('删除成功')
    await loadCollections()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(err.response?.data?.error?.message || '删除失败')
    }
  }
}

const removeDocument = async (collectionId, docPath) => {
  try {
    await api.removeDocumentFromCollection(collectionId, docPath)
    ElMessage.success('已移除')
    await loadCollections()
  } catch (err) {
    ElMessage.error(err.response?.data?.error?.message || '移除失败')
  }
}

const navigateToDoc = (path) => {
  router.push({ path: '/document', query: { path } })
}

onMounted(() => {
  loadCollections()
})

defineExpose({
  refresh: loadCollections,
  toggleBatchMode
})
</script>

<style scoped>
.document-collections {
  padding: 20px;
}

.collections-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.collections-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.collection-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.collection-title .el-tag {
  margin-left: auto;
}

.collection-actions {
  display: flex;
  gap: 4px;
}

.collection-content {
  padding: 8px 0;
}

.empty-docs {
  padding: 20px;
}

.doc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  transition: all 0.2s;
}

.doc-item:not(.selected):hover {
  border-color: var(--el-color-primary);
  background: var(--el-fill-color-light);
}

.doc-item.selected {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.doc-icon {
  color: var(--el-color-primary);
  font-size: 20px;
}

.doc-icon.clickable {
  cursor: pointer;
}

.doc-info {
  flex: 1;
  overflow: hidden;
  cursor: pointer;
}

.doc-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.doc-path {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 暗黑模式 */
html.dark .doc-item.selected {
  background: rgba(64, 158, 255, 0.15);
}
</style>
