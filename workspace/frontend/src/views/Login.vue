<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>OpenClaw Doc Viewer</h2>
          <p class="subtitle">v2.0.0 Alpha</p>
        </div>
      </template>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="80px"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="请输入邮箱"
            prefix-icon="Message"
            size="large"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>

        <div class="form-footer">
          <el-link type="primary" :underline="false">忘记密码？</el-link>
          <el-link type="primary" :underline="false" @click="showRegister = true">
            注册账号
          </el-link>
        </div>
      </el-form>
    </el-card>

    <!-- 注册对话框 -->
    <el-dialog
      v-model="showRegister"
      title="注册新账号"
      width="400px"
    >
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="80px"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
          />
        </el-form-item>

        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="至少 8 位，包含大小写字母和数字"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showRegister = false">取消</el-button>
        <el-button type="primary" :loading="registering" @click="handleRegister">
          注册
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '../api/index.js'

const apiV2 = api.v2

const router = useRouter()
const loginFormRef = ref(null)
const registerFormRef = ref(null)
const loading = ref(false)
const registering = ref(false)
const showRegister = ref(false)

const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const loginRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少需要 6 个字符', trigger: 'blur' }
  ]
}

const registerRules = {
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
    { min: 8, message: '密码至少需要 8 个字符', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: '密码必须包含大小写字母和数字',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      // 使用 v1 API (兼容邮箱/用户名登录)
      const response = await api.post('/auth/login', { email: loginForm.email, password: loginForm.password })
      
      // 保存 Token
      localStorage.setItem('token', response.token)
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      ElMessage.success('登录成功')
      
      // 跳转到首页
      router.push('/')
    } catch (error) {
      ElMessage.error(error.response?.data?.error || '登录失败')
    } finally {
      loading.value = false
    }
  })
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    registering.value = true
    try {
      const { confirmPassword, ...registerData } = registerForm
      const response = await apiV2.register(registerData.email, registerData.username, registerData.password)
      
      // 保存 Token
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      ElMessage.success('注册成功')
      showRegister.value = false
      
      // 跳转到首页
      router.push('/')
    } catch (error) {
      ElMessage.error(error.response?.data?.error || '注册失败')
    } finally {
      registering.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  max-width: 90%;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
</style>
