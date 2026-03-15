<template>
  <div class="batch-actions" v-if="selectedItems.length > 0">
    <div class="selected-info">
      <el-checkbox
        :model-value="true"
        disabled
        style="margin-right: 8px"
      />
      <span>已选择 {{ selectedItems.length }} 项</span>
    </div>
    
    <div class="action-buttons">
      <!-- 文档操作按钮 -->
      <template v-if="actionType === 'documents'">
        <el-button
          type="danger"
          size="small"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
        
        <el-button
          type="primary"
          size="small"
          @click="showMoveDialog = true"
        >
          <el-icon><FolderOpened /></el-icon>
          移动到
        </el-button>
      </template>
      
      <!-- 收藏夹操作按钮 -->
      <template v-if="actionType === 'collections'">
        <el-button
          type="danger"
          size="small"
          @click="handleBatchDeleteCollections"
        >
          <el-icon><Delete /></el-icon>
          删除收藏夹
        </el-button>
      </template>
      
      <el-button
        size="small"
        @click="clearSelection"
      >
        取消选择
      </el-button>
    </div>
    
    <!-- 移动对话框 -->
    <el-dialog
      v-model="showMoveDialog"
      title="移动到收藏夹"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form label-width="80px">
        <el-form-item label="目标收藏夹">
          <el-select
            v-model="targetCollectionId"
            placeholder="请选择目标收藏夹"
            style="width: 100%"
          >
            <el-option
              v-for="col in availableCollections"
              :key="col.id"
              :label="col.name"
              :value="col.id"
              :disabled="col.id === sourceCollectionId"
            >
              <span>{{ col.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ col.documents?.length || 0 }} 个文档
              </span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showMoveDialog = false">取消</el-button>
        <el-button type="primary" @click="handleBatchMove" :loading="moving">
          确定移动
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, FolderOpened } from '@element-plus/icons-vue'
import api from '@/api'

const props = defineProps({
  selectedItems: { type: Array, required: true },
  actionType: { type: String, default: 'documents' }, // 'documents' | 'collections'
  collections: { type: Array, default: () => [] },
  sourceCollectionId: { type: String, default: '' }
})

const emit = defineEmits(['update', 'clear', 'selection-change'])

const showMoveDialog = ref(false)
const targetCollectionId = ref('')
const moving = ref(false)

const availableCollections = computed(() => {
  return props.collections || []
})

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${props.selectedItems.length} 个文档吗？此操作不可恢复。`,
      '批量删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await api.batchDeleteDocuments(props.sourceCollectionId, props.selectedItems)
    
    ElMessage.success(`成功删除 ${props.selectedItems.length} 个文档`)
    emit('update')
    emit('clear')
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败：' + (e.response?.data?.error?.message || e.message))
    }
  }
}

const handleBatchMove = async () => {
  if (!targetCollectionId.value) {
    ElMessage.warning('请选择目标收藏夹')
    return
  }
  
  if (targetCollectionId.value === props.sourceCollectionId) {
    ElMessage.warning('不能移动到同一个收藏夹')
    return
  }
  
  moving.value = true
  try {
    const result = await api.batchMoveDocuments(
      props.sourceCollectionId,
      targetCollectionId.value,
      props.selectedItems
    )
    
    ElMessage.success(`成功移动 ${result.data.movedCount} 个文档到目标收藏夹`)
    showMoveDialog.value = false
    targetCollectionId.value = ''
    emit('update')
    emit('clear')
  } catch (e) {
    ElMessage.error('移动失败：' + (e.response?.data?.error?.message || e.message))
  } finally {
    moving.value = false
  }
}

const handleBatchDeleteCollections = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${props.selectedItems.length} 个收藏夹吗？收藏夹中的文档将一并删除，此操作不可恢复。`,
      '批量删除收藏夹',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await api.batchDeleteCollections(props.selectedItems)
    
    ElMessage.success(`成功删除 ${props.selectedItems.length} 个收藏夹`)
    emit('update')
    emit('clear')
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败：' + (e.response?.data?.error?.message || e.message))
    }
  }
}

const clearSelection = () => {
  emit('clear')
}
</script>

<style scoped>
.batch-actions {
  position: sticky;
  top: 0;
  background: #fff;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.selected-info {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #409EFF;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 暗黑模式 */
html.dark .batch-actions {
  background: #1a1a1a;
  border-bottom-color: #333;
}
</style>
