<template>
  <div class="document-share">
    <el-button type="primary" @click="showDialog = true">
      <el-icon><Share /></el-icon>
      分享文档
    </el-button>

    <el-dialog
      v-model="showDialog"
      title="分享文档"
      width="500px"
    >
      <div v-if="shareLink" class="share-result">
        <el-alert
          title="分享链接已生成"
          type="success"
          :closable="false"
          show-icon
        />

        <div class="share-link-box">
          <el-input
            :model-value="fullShareLink"
            readonly
            class="share-link-input"
          >
            <template #append>
              <el-button @click="copyLink">
                <el-icon><DocumentCopy /></el-icon>
                复制
              </el-button>
            </template>
          </el-input>
        </div>

        <div class="share-info">
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item label="权限">
              <el-tag size="small" :type="shareData.permissions === 'read' ? 'success' : 'warning'">
                {{ shareData.permissions === 'read' ? '只读' : '可评论' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="访问次数">
              {{ shareData.viewCount }}{{ shareData.maxViews ? ' / ' + shareData.maxViews : '' }}
            </el-descriptions-item>
            <el-descriptions-item label="有效期">
              {{ shareData.expiresAt ? formatDate(shareData.expiresAt) : '永久有效' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="share-actions">
          <el-button type="danger" text @click="deleteShare">
            <el-icon><Delete /></el-icon>
            删除分享
          </el-button>
        </div>
      </div>

      <el-form v-else :model="shareForm" label-width="80px" size="default">
        <el-form-item label="文档">
          <el-input :model-value="docTitle" readonly />
        </el-form-item>

        <el-form-item label="权限">
          <el-radio-group v-model="shareForm.permissions">
            <el-radio label="read">只读</el-radio>
            <el-radio label="comment">可评论</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="有效期">
          <el-select v-model="shareForm.expiresDays" placeholder="选择有效期">
            <el-option label="1 天" :value="1" />
            <el-option label="7 天" :value="7" />
            <el-option label="30 天" :value="30" />
            <el-option label="永久" :value="null" />
          </el-select>
        </el-form-item>

        <el-form-item label="访问次数">
          <el-input-number
            v-model="shareForm.maxViews"
            :min="1"
            :max="1000"
            placeholder="不限制"
            controls-position="right"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button v-if="!shareLink" @click="showDialog = false">取消</el-button>
        <el-button v-if="!shareLink" type="primary" @click="createShare">创建分享</el-button>
        <el-button v-else @click="closeDialog">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Share, DocumentCopy, Delete } from '@element-plus/icons-vue'
import api from '@/api'

const props = defineProps({
  docTitle: {
    type: String,
    default: ''
  }
})

const route = useRoute()
const showDialog = ref(false)
const shareLink = ref(false)
const shareData = ref(null)

const shareForm = ref({
  permissions: 'read',
  expiresDays: 7,
  maxViews: null
})

const fullShareLink = computed(() => {
  if (!shareData.value?.token) return ''
  return `${window.location.origin}/share/${shareData.value.token}`
})

const createShare = async () => {
  const path = route.query.path
  
  if (!path) {
    ElMessage.warning('请先选择文档')
    return
  }

  try {
    const expiresAt = shareForm.value.expiresDays
      ? new Date(Date.now() + shareForm.value.expiresDays * 24 * 60 * 60 * 1000).toISOString()
      : null

    const { data } = await api.createShare({
      path,
      title: props.docTitle,
      permissions: shareForm.value.permissions,
      expiresAt,
      maxViews: shareForm.value.maxViews
    })

    shareData.value = data
    shareLink.value = true
    ElMessage.success('分享链接已生成')
  } catch (err) {
    ElMessage.error(err.response?.data?.error?.message || '创建失败')
  }
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(fullShareLink.value)
    ElMessage.success('已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

const deleteShare = async () => {
  try {
    await api.deleteShare(shareData.value.id)
    ElMessage.success('已删除分享')
    closeDialog()
  } catch (err) {
    ElMessage.error(err.response?.data?.error?.message || '删除失败')
  }
}

const closeDialog = () => {
  showDialog.value = false
  shareLink.value = false
  shareData.value = null
  shareForm.value = {
    permissions: 'read',
    expiresDays: 7,
    maxViews: null
  }
}
</script>

<style scoped>
.document-share {
  display: inline-block;
}

.share-result {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.share-link-box {
  display: flex;
  gap: 8px;
}

.share-link-input :deep(.el-input__inner) {
  background: var(--el-fill-color-light);
}

.share-info {
  padding: 12px 0;
}

.share-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color);
}
</style>
