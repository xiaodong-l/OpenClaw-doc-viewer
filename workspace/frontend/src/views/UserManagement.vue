<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>用户管理</h2>
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            创建用户
          </el-button>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="filter-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名或邮箱"
          style="width: 300px"
          clearable
          @clear="loadUsers"
          @keyup.enter="loadUsers"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="filterRole"
          placeholder="角色筛选"
          style="width: 150px; margin-left: 10px"
          clearable
          @change="loadUsers"
        >
          <el-option label="管理员" value="admin" />
          <el-option label="编辑者" value="editor" />
          <el-option label="查看者" value="viewer" />
        </el-select>

        <el-select
          v-model="filterStatus"
          placeholder="状态筛选"
          style="width: 150px; margin-left: 10px"
          clearable
          @change="loadUsers"
        >
          <el-option label="活跃" value="active" />
          <el-option label="未激活" value="inactive" />
          <el-option label="已暂停" value="suspended" />
        </el-select>

        <el-button
          type="primary"
          style="margin-left: 10px"
          @click="loadUsers"
        >
          搜索
        </el-button>
      </div>

      <!-- 用户统计 -->
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-statistic title="总用户数" :value="stats.total" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="管理员" :value="stats.byRole?.admin || 0" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="编辑者" :value="stats.byRole?.editor || 0" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="查看者" :value="stats.byRole?.viewer || 0" />
        </el-col>
      </el-row>

      <!-- 用户列表 -->
      <el-table :data="users" v-loading="loading" style="width: 100%">
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后登录" width="180">
          <template #default="{ row }">
            {{ row.lastLoginAt ? formatDate(row.lastLoginAt) : '从未' }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              size="small"
              :type="row.status === 'active' ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '激活' }}
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(row)"
              :disabled="row.role === 'admin'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadUsers"
        @current-change="loadUsers"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 创建/编辑用户对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingUser ? '编辑用户' : '创建用户'"
      width="500px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="80px"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item
          v-if="!editingUser"
          label="密码"
          prop="password"
        >
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="编辑者" value="editor" />
            <el-option label="查看者" value="viewer" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import api from '../api/index.js'

const apiV2 = api.v2

const loading = ref(false)
const submitting = ref(false)
const showCreateDialog = ref(false)
const editingUser = ref(null)
const searchQuery = ref('')
const filterRole = ref('')
const filterStatus = ref('')
const userFormRef = ref(null)

const users = ref([])
const stats = ref({})
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

const userForm = reactive({
  email: '',
  username: '',
  password: '',
  role: 'viewer'
})

const userRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2-20 个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码至少需要 8 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const getRoleType = (role) => {
  const types = { admin: 'danger', editor: 'warning', viewer: 'info' }
  return types[role] || 'info'
}

const getRoleLabel = (role) => {
  const labels = { admin: '管理员', editor: '编辑者', viewer: '查看者' }
  return labels[role] || role
}

const getStatusType = (status) => {
  const types = { active: 'success', inactive: 'info', suspended: 'danger' }
  return types[status] || 'info'
}

const getStatusLabel = (status) => {
  const labels = { active: '活跃', inactive: '未激活', suspended: '已暂停' }
  return labels[status] || status
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const loadUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit
    }
    if (searchQuery.value) params.search = searchQuery.value
    if (filterRole.value) params.role = filterRole.value
    if (filterStatus.value) params.status = filterStatus.value

    const response = await apiV2.getUsers(params)
    users.value = response.data.users
    pagination.total = response.data.pagination.total
  } catch (error) {
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const response = await apiV2.getUserStats()
    stats.value = response.data.stats
  } catch (error) {
    console.error('加载统计失败', error)
  }
}

const handleEdit = (user) => {
  editingUser.value = user
  userForm.email = user.email
  userForm.username = user.username
  userForm.role = user.role
  userForm.password = ''
  showCreateDialog.value = true
}

const handleSubmit = async () => {
  if (!userFormRef.value) return

  await userFormRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      if (editingUser.value) {
        // 更新用户
        await apiV2.updateUser(editingUser.value.id, {
          email: userForm.email,
          username: userForm.username,
          role: userForm.role
        })
        ElMessage.success('用户更新成功')
      } else {
        // 创建用户
        await apiV2.createUser(userForm.email, userForm.username, userForm.password, userForm.role)
        ElMessage.success('用户创建成功')
      }

      showCreateDialog.value = false
      loadUsers()
      loadStats()
    } catch (error) {
      ElMessage.error(error.response?.data?.error || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

const handleToggleStatus = async (user) => {
  const newStatus = user.status === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? '激活' : '禁用'

  try {
    await ElMessageBox.confirm(
      `确定要${action}该用户吗？`,
      '确认操作',
      { type: 'warning' }
    )

    await apiV2.updateUserStatus(user.id, newStatus)
    ElMessage.success(`用户已${action}`)
    loadUsers()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleDelete = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？此操作不可恢复。`,
      '删除确认',
      { type: 'error' }
    )

    await apiV2.deleteUser(user.id)
    ElMessage.success('用户已删除')
    loadUsers()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadUsers()
  loadStats()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
}

.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
</style>
