<template>
  <div class="users-view">
    <div class="users-header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        创建用户
      </el-button>
    </div>

    <el-table :data="users" stripe v-loading="loading">
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="role" label="角色">
        <template #default="{ row }">
          <el-tag :type="getRoleTagType(row.role)">
            {{ getRoleLabel(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间">
        <template #default="{ row }">
          {{ new Date(row.createdAt).toLocaleString('zh-CN') }}
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginAt" label="最后登录">
        <template #default="{ row }">
          {{ row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString('zh-CN') : '从未' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button
            v-if="row.username !== 'admin'"
            type="danger"
            size="small"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建用户对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建用户"
      width="400px"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="createForm.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="createForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="createForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="createForm.role" placeholder="请选择角色">
            <el-option label="查看者" value="viewer" />
            <el-option label="编辑者" value="editor" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreate">
          创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'

const users = ref([])
const loading = ref(false)
const showCreateDialog = ref(false)
const creating = ref(false)

const createFormRef = ref(null)
const createForm = reactive({
  username: '',
  password: '',
  email: '',
  role: 'viewer'
})

const createRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const getRoleLabel = (role) => {
  const labels = { admin: '管理员', editor: '编辑者', viewer: '查看者' }
  return labels[role] || role
}

const getRoleTagType = (role) => {
  const types = { admin: 'danger', editor: 'warning', viewer: 'info' }
  return types[role] || 'info'
}

const loadUsers = async () => {
  loading.value = true
  try {
    const { data } = await api.getUsers()
    users.value = data.users
  } catch (err) {
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleCreate = async () => {
  if (!createFormRef.value) return
  
  await createFormRef.value.validate(async (valid) => {
    if (!valid) return

    creating.value = true
    try {
      await api.createUser(createForm)
      ElMessage.success('用户创建成功')
      showCreateDialog.value = false
      loadUsers()
      
      // 重置表单
      Object.assign(createForm, {
        username: '',
        password: '',
        email: '',
        role: 'viewer'
      })
    } catch (err) {
      ElMessage.error(err.response?.data?.error?.message || '创建失败')
    } finally {
      creating.value = false
    }
  })
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.username}" 吗？`,
      '确认删除',
      { type: 'warning' }
    )
    
    await api.deleteUser(row.id)
    ElMessage.success('删除成功')
    loadUsers()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.users-view {
  padding: 20px;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.users-header h2 {
  margin: 0;
}
</style>
