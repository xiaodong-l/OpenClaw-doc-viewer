<template>
  <div class="document-comments">
    <div class="comments-header">
      <h3>💬 评论</h3>
      <el-tag v-if="comments.length > 0" type="info" size="small">
        {{ comments.length }} 条评论
      </el-tag>
    </div>

    <!-- 评论输入框 (需要登录) -->
    <div class="comment-input-section" v-if="isLoggedIn">
      <div class="input-wrapper">
        <el-avatar :src="userAvatar" :size="40" class="user-avatar" />
        <div class="input-content">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="写下你的评论... (支持 Markdown)"
            maxlength="1000"
            show-word-limit
            @keydown.ctrl.enter="submitComment"
          />
          <div class="input-actions">
            <span class="hint">Ctrl+Enter 快速提交</span>
            <el-button
              type="primary"
              :loading="submitting"
              @click="submitComment"
              :disabled="!newComment.trim()"
            >
              发表评论
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 未登录提示 -->
    <el-alert
      v-else
      title="登录后参与评论"
      type="info"
      :closable="false"
      show-icon
      class="login-hint"
    >
      <template #default>
        <el-button type="primary" size="small" @click="goToLogin" style="margin-top: 10px">
          立即登录
        </el-button>
      </template>
    </el-alert>

    <!-- 评论列表 -->
    <div class="comment-list" v-if="comments.length > 0">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="comment-item"
        :class="{ 'is-reply': !!comment.parentId }"
      >
        <div class="comment-avatar">
          <el-avatar :src="comment.userAvatar || getDefaultAvatar(comment.userName)" :size="40" />
        </div>

        <div class="comment-body">
          <div class="comment-header">
            <span class="user-name">{{ comment.userName }}</span>
            <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
          </div>

          <div class="comment-content" v-html="renderMarkdown(comment.content)"></div>

          <div class="comment-actions">
            <el-button
              text
              size="small"
              :type="isLiked(comment.id) ? 'primary' : ''"
              @click="handleLike(comment)"
            >
              <el-icon><Star /></el-icon>
              {{ comment.likes }}
            </el-button>

            <el-button
              text
              size="small"
              @click="toggleReply(comment.id)"
            >
              <el-icon><ChatDotRound /></el-icon>
              回复
            </el-button>

            <el-button
              v-if="canEdit(comment)"
              text
              size="small"
              @click="toggleEdit(comment.id)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>

            <el-button
              v-if="canDelete(comment)"
              text
              size="small"
              type="danger"
              @click="handleDelete(comment)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>

          <!-- 编辑框 -->
          <div v-if="editingCommentId === comment.id" class="edit-form">
            <el-input
              v-model="editContent"
              type="textarea"
              :rows="3"
              maxlength="1000"
              show-word-limit
            />
            <div class="edit-actions">
              <el-button size="small" @click="cancelEdit">取消</el-button>
              <el-button size="small" type="primary" @click="submitEdit(comment.id)" :loading="submitting">
                保存
              </el-button>
            </div>
          </div>

          <!-- 回复列表 -->
          <div v-if="comment.replies && comment.replies.length > 0" class="replies">
            <div
              v-for="reply in comment.replies"
              :key="reply.id"
              class="reply-item"
            >
              <el-avatar :src="reply.userAvatar || getDefaultAvatar(reply.userName)" :size="32" class="reply-avatar" />
              <div class="reply-content">
                <div class="reply-header">
                  <span class="user-name">{{ reply.userName }}</span>
                  <span class="comment-date">{{ formatDate(reply.createdAt) }}</span>
                </div>
                <div class="comment-content" v-html="renderMarkdown(reply.content)"></div>
                <div class="reply-actions">
                  <el-button
                    text
                    size="small"
                    :type="isLiked(reply.id) ? 'primary' : ''"
                    @click="handleLike(reply)"
                  >
                    <el-icon><Star /></el-icon>
                    {{ reply.likes }}
                  </el-button>
                  <el-button
                    v-if="canDelete(reply)"
                    text
                    size="small"
                    type="danger"
                    @click="handleDelete(reply)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 回复输入框 -->
          <div v-if="replyingTo === comment.id" class="reply-form">
            <el-input
              v-model="replyContent"
              type="textarea"
              :rows="2"
              :placeholder="`回复 @${comment.userName}...`"
              maxlength="500"
              show-word-limit
              @keydown.ctrl.enter="submitReply"
            >
              <template #append>
                <el-button
                  @click="cancelReply"
                  :disabled="submitting"
                >
                  取消
                </el-button>
                <el-button
                  type="primary"
                  @click="submitReply"
                  :loading="submitting"
                  :disabled="!replyContent.trim()"
                >
                  发送
                </el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty
      v-else
      description="暂无评论，快来抢沙发吧~"
      :image-size="80"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Star, ChatDotRound, Edit, Delete } from '@element-plus/icons-vue'
import markdownIt from 'markdown-it'
import api from '@/api'

const props = defineProps({
  documentPath: { type: String, required: true }
})

const emit = defineEmits(['update'])

const comments = ref([])
const newComment = ref('')
const replyContent = ref('')
const editContent = ref('')
const submitting = ref(false)
const replyingTo = ref(null)
const editingCommentId = ref(null)

const md = markdownIt()

// 用户信息
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('doc-viewer-token')
})

const userAvatar = computed(() => {
  const user = JSON.parse(localStorage.getItem('doc-viewer-user') || 'null')
  return user?.avatar || null
})

const currentUserId = computed(() => {
  const user = JSON.parse(localStorage.getItem('doc-viewer-user') || 'null')
  return user?.userId || null
})

const currentUserRole = computed(() => {
  const user = JSON.parse(localStorage.getItem('doc-viewer-user') || 'null')
  return user?.role || null
})

// 点赞记录
const likedComments = ref(new Set())

const isLiked = (commentId) => {
  return likedComments.value.has(commentId)
}

onMounted(async () => {
  await loadComments()
})

const loadComments = async () => {
  try {
    const { data } = await api.getComments(props.documentPath)
    comments.value = data
  } catch (err) {
    ElMessage.error('加载评论失败')
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  submitting.value = true
  try {
    await api.createComment(props.documentPath, newComment.value.trim())
    ElMessage.success('评论成功')
    newComment.value = ''
    await loadComments()
    emit('update')
  } catch (err) {
    ElMessage.error(err.response?.data?.error?.message || '评论失败')
  } finally {
    submitting.value = false
  }
}

const submitReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  if (!replyingTo.value) return

  submitting.value = true
  try {
    await api.createComment(
      props.documentPath,
      replyContent.value.trim(),
      replyingTo.value
    )
    ElMessage.success('回复成功')
    replyContent.value = ''
    replyingTo.value = null
    await loadComments()
  } catch (err) {
    ElMessage.error(err.response?.data?.error?.message || '回复失败')
  } finally {
    submitting.value = false
  }
}

const toggleReply = (commentId) => {
  if (replyingTo.value === commentId) {
    replyingTo.value = null
  } else {
    replyingTo.value = commentId
    editingCommentId.value = null
  }
}

const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
}

const toggleEdit = (commentId) => {
  const comment = comments.value.find(c => c.id === commentId)
  if (comment) {
    editContent.value = comment.content
    editingCommentId.value = commentId
    replyingTo.value = null
  }
}

const cancelEdit = () => {
  editingCommentId.value = null
  editContent.value = ''
}

const submitEdit = async (commentId) => {
  if (!editContent.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }

  submitting.value = true
  try {
    await api.updateComment(commentId, editContent.value.trim())
    ElMessage.success('更新成功')
    editingCommentId.value = null
    await loadComments()
  } catch (err) {
    ElMessage.error(err.response?.data?.error?.message || '更新失败')
  } finally {
    submitting.value = false
  }
}

const handleLike = async (comment) => {
  try {
    await api.likeComment(comment.id)
    
    if (isLiked(comment.id)) {
      comment.likes--
      likedComments.value.delete(comment.id)
    } else {
      comment.likes++
      likedComments.value.add(comment.id)
    }
  } catch (err) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (comment) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条评论吗？',
      '删除评论',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )

    await api.deleteComment(comment.id)
    ElMessage.success('删除成功')
    await loadComments()
    emit('update')
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const canEdit = (comment) => {
  return currentUserId.value === comment.userId
}

const canDelete = (comment) => {
  return currentUserId.value === comment.userId || currentUserRole.value === 'admin'
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getDefaultAvatar = (name) => {
  // 根据用户名生成默认头像颜色
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
  const index = (name || '').charCodeAt(0) % colors.length
  return null // 使用 Element Plus 默认头像
}

const renderMarkdown = (content) => {
  return md.render(content)
}

const goToLogin = () => {
  window.location.href = '/login'
}

defineExpose({
  refresh: loadComments
})
</script>

<style scoped>
.document-comments {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color);
}

.comments-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.comments-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.comment-input-section {
  margin-bottom: 24px;
}

.input-wrapper {
  display: flex;
  gap: 12px;
}

.user-avatar {
  flex-shrink: 0;
}

.input-content {
  flex: 1;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.login-hint {
  margin-bottom: 24px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: var(--el-fill-color);
  border-radius: 8px;
}

.comment-item.is-reply {
  margin-left: 52px;
  background: var(--el-fill-color-light);
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.user-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.comment-date {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.comment-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
  margin-bottom: 12px;
}

.comment-content :deep(p) {
  margin: 0;
}

.comment-content :deep(code) {
  background: var(--el-fill-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

.comment-content :deep(pre) {
  background: var(--el-bg-color);
  padding: 12px;
  border-radius: 6px;
  overflow: auto;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.edit-form {
  margin-top: 12px;
}

.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}

.replies {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-item {
  display: flex;
  gap: 8px;
}

.reply-avatar {
  flex-shrink: 0;
}

.reply-content {
  flex: 1;
  background: var(--el-bg-color);
  padding: 12px;
  border-radius: 6px;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.reply-header .user-name {
  font-size: 14px;
}

.reply-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.reply-form {
  margin-top: 12px;
}

/* 暗黑模式 */
html.dark .comment-item {
  background: #242424;
}

html.dark .comment-item.is-reply {
  background: #1a1a1a;
}

html.dark .reply-content {
  background: #2a2a2a;
}
</style>
