<template>
  <div class="breadcrumb-component">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item 
        :to="{ path: '/' }" 
        class="breadcrumb-item"
      >
        <el-icon><HomeFilled /></el-icon>
        首页
      </el-breadcrumb-item>
      
      <el-breadcrumb-item
        v-for="(part, index) in pathParts"
        :key="index"
        :to="getBreadcrumbPath(index)"
        class="breadcrumb-item"
      >
        {{ part }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HomeFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 从路由获取当前路径
const currentPath = computed(() => route.query.path)

// 解析路径部分
const pathParts = computed(() => {
  if (!currentPath.value) return []
  return currentPath.value.split('/').filter(Boolean)
})

// 获取面包屑路径
const getBreadcrumbPath = (index) => {
  const path = '/' + pathParts.value.slice(0, index + 1).join('/')
  return { 
    path: route.path === '/document' ? '/document' : '/',
    query: { path }
  }
}
</script>

<style scoped>
.breadcrumb-component {
  padding: 12px 0;
}

.breadcrumb-item {
  cursor: pointer;
}

.breadcrumb-item :deep(.el-breadcrumb__inner) {
  color: var(--el-text-color-regular);
  transition: color 0.2s;
}

.breadcrumb-item :deep(.el-breadcrumb__inner:hover) {
  color: var(--el-color-primary);
}

.breadcrumb-item:last-child :deep(.el-breadcrumb__inner) {
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.breadcrumb-item:last-child :deep(.el-breadcrumb__inner:hover) {
  color: var(--el-text-color-primary);
}
</style>
