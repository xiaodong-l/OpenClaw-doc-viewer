<template>
  <div class="notification-center">
    <!-- 通知铃铛图标 -->
    <el-badge
      :value="unreadCount"
      :hidden="unreadCount === 0"
      class="notification-badge"
    >
      <el-button
        text
        size="large"
        @click="showDrawer = true"
      >
        <el-icon><Bell /></el-icon>
      </el-button>
    </el-badge>

    <!-- 通知抽屉 -->
    <el-drawer
      v-model="showDrawer"
      title="通知中心"
      size="400px"
      @opened="loadNotifications"
    >
      <template #header>
        <div class="drawer-header">
          <h2>通知中心</h2>
          <el-button
            v-if="unreadCount > 0"
            text
            type="primary"
            @click="markAllAsRead"
          >
            全部已读
          </el-button>
        </div>
      </template>

      <!-- 通知列表 -->
      <div class="notification-list" v-loading="loading">
        <el-empty
          v-if="notifications.length === 0"
          description="暂无通知"
        />

        <div
          v-for="notif in notifications"
          :key="notif.id"
          class="notification-item"
          :class="{ unread: !notif.isRead }"
          @click="handleClick(notif)"
        >
          <div class="notification-icon">
            <el-icon :size="20">
              <component :is="getIcon(notif.type)" />
            </el-icon>
          </div>

          <div class="notification-content">
            <div class="notification-title">{{ notif.title }}</div>
            <div class="notification-text">{{ notif.content }}</div>
            <div class="notification-time">{{ formatDate(notif.createdAt) }}</div>
          </div>

          <div class="notification-actions">
            <el-button
              v-if="!notif.isRead"
              text
              size="small"
              @click.stop="markAsRead(notif.id)"
            >
              标记已读
            </el-button>
            <el-button
              text
              size="small"
              type="danger"
              @click.stop="handleDelete(notif.id)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 底部操作 -->
      <template #footer>
        <div class="drawer-footer">
          <el-button text @click="showSettings = true">
            <el-icon><Setting /></el-icon>
            通知设置
          </el-button>
          <el-button text @click="loadMore">
            加载更多
          </el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 通知设置对话框 -->
    <el-dialog
      v-model="showSettings"
      title="通知设置"
      width="500px"
    >
      <el-form :model="settings" label-width="120px">
        <el-divider content-position="left">邮件通知</el-divider>
        <el-form-item label="评论通知">
          <el-switch v-model="settings.emailComments" />
        </el-form-item>
        <el-form-item label="@提及通知">
          <el-switch v-model="settings.emailMentions" />
        </el-form-item>
        <el-form-item label="分享通知">
          <el-switch v-model="settings.emailShares" />
        </el-form-item>
        <el-form-item label="版本更新">
          <el-switch v-model="settings.emailVersions" />
        </el-form-item>

        <el-divider content-position="left">站内通知</el-divider>
        <el-form-item label="评论通知">
          <el-switch v-model="settings.inAppComments" />
        </el-form-item>
        <el-form-item label="@提及通知">
          <el-switch v-model="settings.inAppMentions" />
        </el-form-item>
        <el-form-item label="分享通知">
          <el-switch v-model="settings.inAppShares" />
        </el-form-item>
        <el-form-item label="版本更新">
          <el-switch v-model="settings.inAppVersions" />
        </el-form-item>

        <el-divider content-position="left">摘要设置</el-divider>
        <el-form-item label="启用摘要">
          <el-switch v-model="settings.digestEnabled" />
        </el-form-item>
        <el-form-item label="摘要频率">
          <el-select v-model="settings.digestFrequency">
            <el-option label="每日" value="daily" />
            <el-option label="每周" value="weekly" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showSettings = false">取消</el-button>
        <el-button type="primary" @click="saveSettings">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Bell,
  Delete,
  Setting,
  Comment,
  At,
  Share,
  Version,
  Lock,
  Key
} from '@element-plus/icons-vue'
import api from '../api/index.js'

const apiV2 = api.v2

const showDrawer = ref(false)
const showSettings = ref(false)
const loading = ref(false)
const unreadCount = ref(0)
const notifications = ref([])
const offset = ref(0)
const limit = 20

const settings = reactive({
  emailComments: true,
  emailMentions: true,
  emailShares: true,
  emailVersions: false,
  inAppComments: true,
  inAppMentions: true,
  inAppShares: true,
  inAppVersions: true,
  digestEnabled: false,
  digestFrequency: 'daily'
})

const getIcon = (type) => {
  const icons = {
    comment: Comment,
    mention: At,
    share: Share,
    version: Version,
    lock: Lock,
    permission: Key
  }
  return icons[type] || Bell
}

const formatDate = (date) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`

  return d.toLocaleDateString('zh-CN')
}

const loadNotifications = async () => {
  loading.value = true
  try {
    const response = await apiV2.getNotifications({
      limit,
      offset: offset.value
    })
    notifications.value = response.data.notifications
    await loadUnreadCount()
  } catch (error) {
    ElMessage.error('加载通知失败')
  } finally {
    loading.value = false
  }
}

const loadUnreadCount = async () => {
  try {
    const response = await apiV2.getUnreadCount()
    unreadCount.value = response.data.count
  } catch (error) {
    console.error('加载未读数量失败', error)
  }
}

const loadMore = () => {
  offset.value += limit
  loadNotifications()
}

const markAsRead = async (id) => {
  try {
    await apiV2.markNotificationAsRead(id)
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.isRead = true
    }
    await loadUnreadCount()
  } catch (error) {
    ElMessage.error('标记失败')
  }
}

const markAllAsRead = async () => {
  try {
    await apiV2.markAllNotificationsAsRead()
    notifications.value.forEach(n => n.isRead = true)
    unreadCount.value = 0
    ElMessage.success('已全部标记为已读')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (id) => {
  try {
    await apiV2.deleteNotification(id)
    notifications.value = notifications.value.filter(n => n.id !== id)
    ElMessage.success('通知已删除')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleClick = (notification) => {
  if (notification.link) {
    window.open(notification.link, '_blank')
  }
  if (!notification.isRead) {
    markAsRead(notification.id)
  }
}

const loadSettings = async () => {
  try {
    const response = await apiV2.getNotificationSettings()
    Object.assign(settings, response.data.settings)
  } catch (error) {
    console.error('加载设置失败', error)
  }
}

const saveSettings = async () => {
  try {
    await apiV2.updateNotificationSettings(settings)
    ElMessage.success('设置已保存')
    showSettings.value = false
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 轮询未读数量 (每 30 秒)
let pollInterval
onMounted(() => {
  loadUnreadCount()
  pollInterval = setInterval(loadUnreadCount, 30000)
})

// 清理轮询
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})
</script>

<style scoped>
.notification-center {
  display: inline-block;
}

.notification-badge {
  cursor: pointer;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-header h2 {
  margin: 0;
  font-size: 18px;
}

.notification-list {
  max-height: 500px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-item.unread {
  background-color: #ecf5ff;
}

.notification-icon {
  margin-right: 12px;
  color: #409eff;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 500;
  margin-bottom: 4px;
  color: #303133;
}

.notification-text {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.notification-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

.drawer-footer {
  display: flex;
  justify-content: space-between;
}
</style>
