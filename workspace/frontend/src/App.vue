<template>
  <el-config-provider :locale="zhCn">
    <AppLayout />
  </el-config-provider>
</template>

<script setup>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import AppLayout from './components/AppLayout.vue'
import { useDarkMode } from './composables/useDarkMode'

// 初始化暗黑模式
useDarkMode()
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  overflow: hidden;
}

/* ===== 暗黑模式完整样式 ===== */
html.dark {
  /* Element Plus 颜色变量 */
  --el-bg-color: #1a1a1a;
  --el-bg-color-page: #141414;
  --el-bg-color-overlay: #242424;
  --el-text-color-primary: #e5e5e5;
  --el-text-color-regular: #cccccc;
  --el-text-color-secondary: #999999;
  --el-text-color-placeholder: #666666;
  --el-border-color: #333333;
  --el-border-color-light: #3a3a3a;
  --el-fill-color: #2a2a2a;
  --el-fill-color-light: #242424;
  --el-fill-color-lighter: #2a2a2a;
  --el-fill-color-dark: #333333;
  --el-color-primary: #409EFF;
  --el-color-primary-light-3: #3a8ee6;
  --el-color-primary-light-5: #3375b9;
  --el-color-primary-light-7: #2d5f8c;
  --el-color-primary-light-8: #26485f;
  --el-color-primary-light-9: #203042;
  --el-mask-color: rgba(0, 0, 0, 0.8);
  
  color-scheme: dark;
}

/* 全局背景色 */
html.dark body {
  background-color: var(--el-bg-color-page);
}

/* 卡片和容器 */
html.dark .el-card {
  background-color: var(--el-bg-color-overlay);
  border-color: var(--el-border-color);
}

html.dark .el-card__header {
  background-color: var(--el-fill-color);
  border-bottom-color: var(--el-border-color);
}

/* 输入框 */
html.dark .el-input__wrapper {
  background-color: var(--el-fill-color);
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
}

html.dark .el-input__inner {
  color: var(--el-text-color-regular);
}

/* 下拉菜单 */
html.dark .el-dropdown-menu {
  background-color: var(--el-bg-color-overlay);
  border-color: var(--el-border-color);
}

html.dark .el-dropdown-menu__item {
  color: var(--el-text-color-regular);
}

html.dark .el-dropdown-menu__item:hover {
  background-color: var(--el-fill-color);
}

/* 对话框 */
html.dark .el-dialog {
  background-color: var(--el-bg-color-overlay);
}

html.dark .el-dialog__header {
  border-bottom-color: var(--el-border-color);
}

html.dark .el-dialog__title {
  color: var(--el-text-color-primary);
}

/* 表格 */
html.dark .el-table {
  --el-table-bg-color: var(--el-bg-color);
  --el-table-tr-bg-color: var(--el-bg-color);
  --el-table-header-bg-color: var(--el-fill-color);
  --el-table-text-color: var(--el-text-color-regular);
  --el-table-header-text-color: var(--el-text-color-regular);
  --el-table-row-hover-bg-color: var(--el-fill-color);
  --el-table-border-color: var(--el-border-color);
  --el-table-fixed-box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

/* 按钮 */
html.dark .el-button {
  --el-button-bg-color: var(--el-fill-color);
  --el-button-border-color: var(--el-border-color);
  --el-button-text-color: var(--el-text-color-regular);
}

html.dark .el-button:hover {
  --el-button-hover-bg-color: var(--el-fill-color-lighter);
  --el-button-hover-border-color: var(--el-border-color-light);
}

/* 标签 */
html.dark .el-tag {
  --el-tag-bg-color: var(--el-fill-color);
  --el-tag-border-color: var(--el-border-color);
  --el-tag-text-color: var(--el-text-color-regular);
}

/* 分割线 */
html.dark .el-divider {
  background-color: var(--el-border-color);
}

/* 空状态 */
html.dark .el-empty__description {
  color: var(--el-text-color-secondary);
}

/* 骨架屏 */
html.dark .el-skeleton__item {
  background: linear-gradient(90deg, var(--el-fill-color) 25%, var(--el-fill-color-light) 37%, var(--el-fill-color) 63%);
}

/* 滚动条 */
html.dark ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

html.dark ::-webkit-scrollbar-track {
  background: var(--el-bg-color);
}

html.dark ::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 4px;
}

html.dark ::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-light);
}

/* 过渡动画 */
html, body {
  transition: background-color 0.3s, color 0.3s;
}
</style>
