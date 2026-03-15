<template>
  <header class="app-header">
    <div class="header-left">
      <el-button 
        v-if="isMobile || isTablet" 
        text 
        @click="toggleSidebar"
        class="menu-toggle"
      >
        <el-icon><Menu /></el-icon>
      </el-button>
      
      <div class="logo" @click="goHome">
        <el-icon><Document /></el-icon>
        <span class="logo-text">Doc Viewer</span>
      </div>
    </div>

    <div class="header-center">
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索文档..."
          clearable
          size="default"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <div class="header-right">
      <ThemeSwitcher />
      
      <el-dropdown>
        <div class="user-avatar">
          <el-avatar :size="32" :icon="UserFilled" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人中心</el-dropdown-item>
            <el-dropdown-item divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Menu, Document, Search, UserFilled } from '@element-plus/icons-vue'
import { useResponsive } from '@/composables/useResponsive'
import ThemeSwitcher from './ThemeSwitcher.vue'

defineComponents({ ThemeSwitcher })

const router = useRouter()
const { isMobile, isTablet } = useResponsive()

const searchQuery = ref('')

const emit = defineEmits(['toggle-sidebar'])

const toggleSidebar = () => {
  emit('toggle-sidebar')
}

const goHome = () => {
  router.push('/')
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } })
  }
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-center {
  flex: 1;
  max-width: 400px;
  margin: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 18px;
  color: var(--el-color-primary);
}

.logo:hover {
  opacity: 0.8;
}

.search-box {
  width: 100%;
}

.user-avatar {
  cursor: pointer;
}

.menu-toggle {
  display: none;
}

@media (max-width: 768px) {
  .menu-toggle {
    display: inline-flex;
  }

  .header-center {
    display: none;
  }

  .logo-text {
    display: none;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .logo-text {
    display: none;
  }

  .header-center {
    max-width: 250px;
  }
}
</style>
