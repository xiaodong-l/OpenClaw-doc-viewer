<template>
  <div class="directory-tree">
    <el-tree
      ref="treeRef"
      :data="rootNodes"
      :load="loadNode"
      lazy
      :props="treeProps"
      :expand-on-click-node="false"
      :current-node-key="currentPath"
      highlight-current
      @node-click="handleNodeClick"
      @node-contextmenu="handleContextMenu"
    >
      <template #default="{ node, data }">
        <span class="tree-node">
          <el-icon :class="['node-icon', getIconClass(data)]">
            <component :is="getIconComponent(data)" />
          </el-icon>
          <span class="node-label">{{ node.label }}</span>
          <span v-if="data.mdCount" class="md-count">({{ data.mdCount }})</span>
          <span v-if="data.loading" class="loading-icon">
            <el-icon class="is-loading"><component :is="'Loading'" /></el-icon>
          </span>
        </span>
      </template>
    </el-tree>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.visible"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop="closeContextMenu"
    >
      <el-card shadow="hover" class="context-menu-card">
        <div class="context-menu-title">
          <el-icon><Document /></el-icon>
          {{ contextMenu.node?.name }}
        </div>
        <el-divider style="margin: 8px 0" />
        <div class="context-menu-items">
          <div
            v-for="item in contextMenu.items"
            :key="item.label"
            class="context-menu-item"
            @click="handleContextAction(item.action, contextMenu.node)"
          >
            <span>{{ item.label }}</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Folder,
  Document
} from '@element-plus/icons-vue'
import api from '@/api'

const router = useRouter()
const treeRef = ref(null)
const rootNodes = ref([])
const currentPath = ref('')

const treeProps = {
  label: 'name',
  children: 'children',
  isLeaf: (data) => data.type === 'file'
}

const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  node: null,
  items: []
})

// 加载根节点
const loadRootNodes = async () => {
  try {
    const { data } = await api.getFiles({ depth: 1 })
    rootNodes.value = data.children || []
  } catch (err) {
    console.error('Failed to load root nodes:', err)
  }
}

// 懒加载子节点
const loadNode = async (node, resolve) => {
  const path = node.data?.path || '/'
  
  try {
    const { data } = await api.getFiles({ path, depth: 1 })
    resolve(data.children || [])
  } catch (err) {
    console.error('Failed to load node:', err)
    resolve([])
  }
}

// 点击节点
const handleNodeClick = (data) => {
  currentPath.value = data.path
  
  if (data.type === 'file') {
    router.push({ path: '/document', query: { path: data.path } })
  } else {
    // 目录：展开/折叠
    const node = treeRef.value?.getNode(data.path)
    if (node) {
      node.isExpanded ? node.collapse() : node.expand()
    }
  }
}

// 右键菜单
const handleContextMenu = (e, node, data) => {
  e.preventDefault()
  
  contextMenu.visible = true
  contextMenu.x = e.clientX
  contextMenu.y = e.clientY
  contextMenu.node = data
  
  contextMenu.items = data.type === 'directory'
    ? [
        { label: '刷新', action: 'refresh' },
        { label: '复制路径', action: 'copyPath' },
        { label: '在此搜索', action: 'searchHere' },
        { label: '属性', action: 'properties' }
      ]
    : [
        { label: '预览', action: 'preview' },
        { label: '复制路径', action: 'copyPath' },
        { label: '属性', action: 'properties' }
      ]
}

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenu.visible = false
  contextMenu.node = null
}

// 处理右键操作
const handleContextAction = async (action, node) => {
  closeContextMenu()
  
  switch (action) {
    case 'refresh':
      await refreshNode(node)
      break
    case 'copyPath':
      await copyPath(node.path)
      break
    case 'searchHere':
      router.push({ path: '/search', query: { path: node.path } })
      break
    case 'preview':
      router.push({ path: '/document', query: { path: node.path } })
      break
    case 'properties':
      // TODO: 显示属性对话框
      console.log('Properties:', node)
      break
  }
}

// 刷新节点
const refreshNode = async (node) => {
  const treeNode = treeRef.value?.getNode(node.path)
  if (treeNode) {
    treeNode.loaded = false
    treeNode.expand()
  }
}

// 复制路径
const copyPath = async (path) => {
  try {
    await navigator.clipboard.writeText(path)
    // TODO: 显示成功提示
    console.log('Copied:', path)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// 获取图标类
const getIconClass = (data) => {
  if (data.type === 'directory') {
    return 'folder-icon'
  }
  return 'file-icon'
}

// 获取图标组件
const getIconComponent = (data) => {
  if (data.type === 'directory') {
    return Folder
  }
  
  // 根据文件类型返回不同图标
  const ext = data.name?.split('.').pop()?.toLowerCase()
  
  switch (ext) {
    case 'md':
    case 'markdown':
      return Document
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
      return File
    default:
      return File
  }
}

// 初始化
loadRootNodes()

// 暴露方法给父组件
defineExpose({
  refreshNode,
  loadRootNodes
})
</script>

<style scoped>
.directory-tree {
  height: 100%;
  overflow: auto;
  padding: 8px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.node-icon {
  color: var(--el-color-primary);
  font-size: 16px;
}

.node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.md-count {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-left: 4px;
}

.loading-icon {
  color: var(--el-color-primary);
  font-size: 14px;
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  z-index: 9999;
}

.context-menu-card {
  min-width: 180px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.context-menu-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  font-size: 14px;
  padding: 4px 0;
}

.context-menu-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.context-menu-item:hover {
  background-color: var(--el-fill-color-light);
}

.context-menu-item .el-icon {
  font-size: 16px;
  color: var(--el-text-color-secondary);
}
</style>
