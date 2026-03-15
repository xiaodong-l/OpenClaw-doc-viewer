<template>
  <div class="app-layout" :class="{ 'sidebar-open': sidebarOpen }">
    <AppHeader @toggle-sidebar="toggleSidebar" />
    
    <div class="main-container">
      <!-- 移动端侧边栏抽屉 -->
      <el-drawer
        v-model="sidebarOpen"
        :size="isMobile ? '80%' : '300px'"
        direction="ltr"
        :with-header="false"
        class="sidebar-drawer"
      >
        <DirectoryTree />
      </el-drawer>

      <!-- 桌面端侧边栏 -->
      <aside v-if="isDesktop" class="sidebar">
        <DirectoryTree />
      </aside>

      <!-- 主内容区 -->
      <main class="main-content">
        <router-view />
      </main>
    </div>

    <!-- 移动端底部导航 -->
    <nav v-if="isMobile" class="bottom-nav">
      <div 
        class="nav-item" 
        :class="{ active: route.path === '/' }"
        @click="router.push('/')"
      >
        <el-icon><HomeFilled /></el-icon>
        <span>首页</span>
      </div>
      <div 
        class="nav-item"
        :class="{ active: route.path === '/search' }"
        @click="router.push('/search')"
      >
        <el-icon><Search /></el-icon>
        <span>搜索</span>
      </div>
      <div 
        class="nav-item"
        :class="{ active: route.path === '/document' }"
        @click="handleDocument"
      >
        <el-icon><Document /></el-icon>
        <span>文档</span>
      </div>
      <div 
        class="nav-item"
        :class="{ active: route.path === '/users' }"
        @click="router.push('/users')"
      >
        <el-icon><User /></el-icon>
        <span>用户</span>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  HomeFilled, 
  Search, 
  Document, 
  User 
} from '@element-plus/icons-vue'
import { useResponsive } from '@/composables/useResponsive'
import AppHeader from './AppHeader.vue'
import DirectoryTree from './DirectoryTree.vue'

const route = useRoute()
const router = useRouter()
const { isMobile, isDesktop } = useResponsive()

const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleDocument = () => {
  // 如果有当前文档，跳转到文档页，否则跳转到首页
  if (route.query.path) {
    router.push('/document')
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
  border-right: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow: auto;
  background: var(--el-fill-color-light);
}

.sidebar-drawer :deep(.el-drawer__body) {
  padding: 0;
  overflow: hidden;
}

/* 移动端底部导航 */
.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 60px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  cursor: pointer;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  transition: color 0.2s;
}

.nav-item:hover {
  color: var(--el-color-primary);
}

.nav-item.active {
  color: var(--el-color-primary);
}

.nav-item .el-icon {
  font-size: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}

@media (min-width: 769px) {
  .bottom-nav {
    display: none;
  }
}
</style>
