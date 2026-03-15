<template>
  <div class="avatar-upload">
    <el-upload
      ref="uploadRef"
      class="avatar-uploader"
      action="/api/v1/user/avatar"
      :show-file-list="false"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
      :headers="uploadHeaders"
    >
      <div v-if="imageUrl" class="avatar-preview">
        <el-avatar :size="size" :src="imageUrl" />
        <div class="avatar-overlay">
          <el-icon><Camera /></el-icon>
          <span>点击更换</span>
        </div>
      </div>
      <div v-else class="avatar-placeholder">
        <el-avatar :size="size" :icon="UserFilled" />
        <div class="avatar-overlay">
          <el-icon><Camera /></el-icon>
          <span>上传头像</span>
        </div>
      </div>
    </el-upload>

    <div class="avatar-tips">
      <el-text size="small" type="info">
        支持 JPG/PNG/GIF 格式，大小不超过 5MB
      </el-text>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled, Camera } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  modelValue: String,
  size: {
    type: Number,
    default: 100
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const authStore = useAuthStore()
const uploadRef = ref(null)
const imageUrl = ref(props.modelValue)

const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${authStore.token}`
}))

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('头像大小不能超过 5MB！')
    return false
  }
  return true
}

const handleSuccess = (response) => {
  if (response.success) {
    imageUrl.value = response.data.avatar
    emit('update:modelValue', response.data.avatar)
    emit('change', response.data.avatar)
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error(response.error?.message || '上传失败')
  }
}

const handleError = () => {
  ElMessage.error('上传失败，请重试')
}
</script>

<style scoped>
.avatar-upload {
  display: inline-block;
}

.avatar-uploader {
  cursor: pointer;
}

.avatar-preview,
.avatar-placeholder {
  position: relative;
  display: inline-block;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-preview:hover .avatar-overlay,
.avatar-placeholder:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay .el-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.avatar-overlay span {
  font-size: 12px;
}

.avatar-tips {
  margin-top: 8px;
  text-align: center;
}
</style>
