<template>
  <div class="ldap-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>LDAP/AD 集成</h2>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            添加 LDAP 配置
          </el-button>
        </div>
      </template>

      <!-- LDAP 配置列表 -->
      <el-table :data="configs" v-loading="loading">
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="host" label="服务器" />
        <el-table-column prop="port" label="端口" width="80" />
        <el-table-column label="SSL" width="80">
          <template #default="{ row }">
            <el-tag :type="row.useSSL ? 'success' : 'info'">
              {{ row.useSSL ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="自动创建用户" width="100">
          <template #default="{ row }">
            <el-tag :type="row.autoCreateUser ? 'success' : 'info'">
              {{ row.autoCreateUser ? '开启' : '关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button size="small" @click="testConnection(row)">
              测试连接
            </el-button>
            <el-button size="small" @click="syncUsers(row)">
              同步用户
            </el-button>
            <el-button size="small" @click="editConfig(row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="deleteConfig(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="configs.length === 0" description="暂无 LDAP 配置" />
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingConfig ? '编辑 LDAP 配置' : '添加 LDAP 配置'"
      width="700px"
    >
      <el-form :model="formData" label-width="140px">
        <el-divider content-position="left">基本设置</el-divider>
        <el-form-item label="配置名称" required>
          <el-input v-model="formData.name" placeholder="如：公司 AD" />
        </el-form-item>
        <el-form-item label="服务器地址" required>
          <el-input v-model="formData.host" placeholder="如：ad.example.com" />
        </el-form-item>
        <el-form-item label="端口" required>
          <el-input-number v-model="formData.port" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item label="使用 SSL">
          <el-switch v-model="formData.useSSL" />
        </el-form-item>
        <el-form-item label="Base DN" required>
          <el-input v-model="formData.baseDN" placeholder="如：DC=example,DC=com" />
        </el-form-item>

        <el-divider content-position="left">绑定设置</el-divider>
        <el-form-item label="Bind DN">
          <el-input v-model="formData.bindDN" placeholder="如：CN=Admin,CN=Users,DC=example,DC=com" />
        </el-form-item>
        <el-form-item label="Bind 密码">
          <el-input v-model="formData.bindPassword" type="password" show-password />
        </el-form-item>

        <el-divider content-position="left">用户设置</el-divider>
        <el-form-item label="用户过滤器">
          <el-input v-model="formData.userFilter" placeholder="(objectClass=person)" />
        </el-form-item>
        <el-form-item label="用户名属性">
          <el-input v-model="formData.usernameAttribute" placeholder="sAMAccountName" />
        </el-form-item>
        <el-form-item label="邮箱属性">
          <el-input v-model="formData.emailAttribute" placeholder="mail" />
        </el-form-item>
        <el-form-item label="显示名属性">
          <el-input v-model="formData.displayNameAttribute" placeholder="displayName" />
        </el-form-item>

        <el-divider content-position="left">同步设置</el-divider>
        <el-form-item label="启用同步">
          <el-switch v-model="formData.syncEnabled" />
        </el-form-item>
        <el-form-item label="同步间隔 (秒)">
          <el-input-number v-model="formData.syncInterval" :min="60" :step="60" />
        </el-form-item>
        <el-form-item label="自动创建用户">
          <el-switch v-model="formData.autoCreateUser" />
        </el-form-item>
        <el-form-item label="默认角色">
          <el-select v-model="formData.defaultRole">
            <el-option label="查看者" value="viewer" />
            <el-option label="编辑者" value="editor" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="启用配置">
          <el-switch v-model="formData.isActive" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveConfig">保存</el-button>
      </template>
    </el-dialog>

    <!-- 同步日志对话框 -->
    <el-dialog v-model="showLogsDialog" title="同步日志" width="800px">
      <el-table :data="syncLogs">
        <el-table-column prop="startedAt" label="开始时间" />
        <el-table-column prop="syncType" label="类型" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="usersSynced" label="同步数" />
        <el-table-column prop="durationMs" label="耗时" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import api from '../api/index.js'

const apiV2 = api.v2

const loading = ref(false)
const configs = ref([])
const showAddDialog = ref(false)
const showLogsDialog = ref(false)
const editingConfig = ref(null)
const syncLogs = ref([])

const formData = reactive({
  name: '',
  host: '',
  port: 389,
  useSSL: false,
  baseDN: '',
  bindDN: '',
  bindPassword: '',
  userFilter: '(objectClass=person)',
  usernameAttribute: 'sAMAccountName',
  emailAttribute: 'mail',
  displayNameAttribute: 'displayName',
  syncEnabled: true,
  syncInterval: 3600,
  autoCreateUser: true,
  defaultRole: 'viewer',
  isActive: true
})

const loadConfigs = async () => {
  loading.value = true
  try {
    const response = await apiV2.getLDAPConfigs()
    configs.value = response.data.configs
  } catch (error) {
    ElMessage.error('加载 LDAP 配置失败')
  } finally {
    loading.value = false
  }
}

const testConnection = async (config) => {
  try {
    const response = await apiV2.testLDAPConnection(config.id)
    if (response.data.success) {
      ElMessage.success('连接测试成功')
    } else {
      ElMessage.error(`连接失败：${response.data.message}`)
    }
  } catch (error) {
    ElMessage.error('连接测试失败')
  }
}

const syncUsers = async (config) => {
  try {
    ElMessage.info('开始同步用户...')
    const response = await apiV2.syncLDAPUsers(config.id)
    ElMessage.success(`同步完成：${response.data.synced} 个用户`)
  } catch (error) {
    ElMessage.error('同步失败')
  }
}

const editConfig = (config) => {
  editingConfig.value = config
  Object.assign(formData, config)
  showAddDialog.value = true
}

const saveConfig = async () => {
  try {
    if (editingConfig.value) {
      await apiV2.updateLDAPConfig(editingConfig.value.id, formData)
      ElMessage.success('配置已更新')
    } else {
      await apiV2.createLDAPConfig(formData)
      ElMessage.success('配置已创建')
    }
    showAddDialog.value = false
    editingConfig.value = null
    loadConfigs()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const deleteConfig = async (config) => {
  try {
    await ElMessageBox.confirm('确定要删除此 LDAP 配置吗？', '确认删除', {
      type: 'warning'
    })
    await apiV2.deleteLDAPConfig(config.id)
    ElMessage.success('配置已删除')
    loadConfigs()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadConfigs()
})
</script>

<style scoped>
.ldap-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
}
</style>
