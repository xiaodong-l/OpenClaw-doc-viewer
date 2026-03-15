<template>
  <div class="gdpr-settings">
    <el-card>
      <template #header>
        <h2>数据隐私 (GDPR)</h2>
      </template>

      <!-- 数据导出 -->
      <el-card shadow="hover" class="section-card">
        <template #header>
          <div class="section-header">
            <span>📥 数据导出</span>
          </div>
        </template>
        <p>下载您的个人数据副本，包括文档、评论和活动记录。</p>
        <el-button type="primary" @click="requestExport" :loading="exporting">
          请求导出数据
        </el-button>
      </el-card>

      <!-- 账户删除 -->
      <el-card shadow="hover" class="section-card">
        <template #header>
          <div class="section-header">
            <span>🗑️ 账户删除</span>
          </div>
        </template>
        <p>永久删除您的账户和相关数据。此操作不可撤销。</p>
        <el-button type="danger" @click="showDeleteDialog = true">
          请求删除账户
        </el-button>
      </el-card>

      <!-- 隐私设置 -->
      <el-card shadow="hover" class="section-card">
        <template #header>
          <div class="section-header">
            <span>🔒 隐私设置</span>
          </div>
        </template>
        <el-form :model="privacySettings" label-width="150px">
          <el-form-item label="公开个人资料">
            <el-switch v-model="privacySettings.profileVisible" />
          </el-form-item>
          <el-form-item label="公开活动记录">
            <el-switch v-model="privacySettings.activityVisible" />
          </el-form-item>
          <el-form-item label="允许分析">
            <el-switch v-model="privacySettings.allowAnalytics" />
          </el-form-item>
          <el-form-item label="允许营销">
            <el-switch v-model="privacySettings.allowMarketing" />
          </el-form-item>
          <el-form-item label="数据保留天数">
            <el-input-number v-model="privacySettings.dataRetentionDays" :min="30" :max="730" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="savePrivacySettings">保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- Cookie 设置 -->
      <el-card shadow="hover" class="section-card">
        <template #header>
          <div class="section-header">
            <span>🍪 Cookie 设置</span>
          </div>
        </template>
        <p>管理您的 Cookie 偏好设置。</p>
        <el-button @click="showCookieDialog = true">管理 Cookie</el-button>
      </el-card>
    </el-card>

    <!-- 删除账户对话框 -->
    <el-dialog
      v-model="showDeleteDialog"
      title="删除账户"
      width="500px"
    >
      <el-alert
        title="警告"
        description="删除账户后，您的所有数据将被永久删除，此操作不可撤销。"
        type="warning"
        show-icon
      />
      <el-form :model="deleteForm" label-width="100px" style="margin-top: 20px">
        <el-form-item label="删除原因">
          <el-select v-model="deleteForm.reason" placeholder="请选择">
            <el-option label="不再使用此服务" value="no_longer_use" />
            <el-option label="隐私顾虑" value="privacy_concerns" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="确认密码" required>
          <el-input v-model="deleteForm.password" type="password" placeholder="请输入密码确认" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDeleteDialog = false">取消</el-button>
        <el-button type="danger" @click="confirmDeleteAccount" :loading="deleting">
          确认删除
        </el-button>
      </template>
    </el-dialog>

    <!-- Cookie 对话框 -->
    <el-dialog
      v-model="showCookieDialog"
      title="Cookie 设置"
      width="500px"
    >
      <el-form :model="cookieSettings" label-width="120px">
        <el-form-item label="必要 Cookie">
          <el-switch v-model="cookieSettings.essential" disabled />
          <span class="hint">（必需，无法禁用）</span>
        </el-form-item>
        <el-form-item label="分析 Cookie">
          <el-switch v-model="cookieSettings.analytics" />
        </el-form-item>
        <el-form-item label="营销 Cookie">
          <el-switch v-model="cookieSettings.marketing" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCookieDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCookieSettings">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api/index.js'

const apiV2 = api.v2

const exporting = ref(false)
const deleting = ref(false)
const showDeleteDialog = ref(false)
const showCookieDialog = ref(false)

const privacySettings = reactive({
  profileVisible: true,
  activityVisible: false,
  allowAnalytics: true,
  allowMarketing: false,
  dataRetentionDays: 365
})

const deleteForm = reactive({
  reason: '',
  password: ''
})

const cookieSettings = reactive({
  essential: true,
  analytics: false,
  marketing: false
})

const requestExport = async () => {
  exporting.value = true
  try {
    const response = await apiV2.requestDataExport()
    ElMessage.success(`导出请求已提交，下载链接将发送到您的邮箱`)
  } catch (error) {
    ElMessage.error('导出请求失败')
  } finally {
    exporting.value = false
  }
}

const confirmDeleteAccount = async () => {
  if (!deleteForm.password) {
    ElMessage.warning('请输入密码确认')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除账户吗？此操作不可撤销！', '确认删除', {
      type: 'error'
    })

    deleting.value = true
    await apiV2.requestAccountDeletion(deleteForm.password, deleteForm.reason)
    ElMessage.success('账户删除请求已提交，请检查确认邮件')
    showDeleteDialog.value = false
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除请求失败')
    }
  } finally {
    deleting.value = false
  }
}

const savePrivacySettings = async () => {
  try {
    await apiV2.updatePrivacySettings(privacySettings)
    ElMessage.success('隐私设置已保存')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const saveCookieSettings = async () => {
  try {
    const categories = []
    if (cookieSettings.essential) categories.push('essential')
    if (cookieSettings.analytics) categories.push('analytics')
    if (cookieSettings.marketing) categories.push('marketing')

    await apiV2.submitCookieConsent(categories)
    ElMessage.success('Cookie 设置已保存')
    showCookieDialog.value = false
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const loadPrivacySettings = async () => {
  try {
    const response = await apiV2.getPrivacySettings()
    Object.assign(privacySettings, response.data.settings)
  } catch (error) {
    console.error('加载隐私设置失败', error)
  }
}

onMounted(() => {
  loadPrivacySettings()
})
</script>

<style scoped>
.gdpr-settings {
  padding: 20px;
  max-width: 800px;
}

.section-card {
  margin-bottom: 20px;
}

.section-header {
  font-weight: 500;
}

.hint {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}
</style>
