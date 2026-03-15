<template>
  <el-select
    :model-value="modelValue"
    :placeholder="placeholder || '选择角色'"
    :disabled="disabled"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-option
      v-for="option in roleOptions"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    >
      <div class="role-option">
        <el-tag :type="option.type" size="small">
          {{ option.label }}
        </el-tag>
        <span class="role-description">{{ option.description }}</span>
      </div>
    </el-option>
  </el-select>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '选择角色'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  allowedRoles: {
    type: Array,
    default: () => ['admin', 'editor', 'viewer']
  }
})

defineEmits(['update:modelValue'])

const roleOptions = computed(() => {
  const allRoles = [
    {
      value: 'admin',
      label: '管理员',
      type: 'danger',
      description: '完全访问权限，可管理用户和系统设置'
    },
    {
      value: 'editor',
      label: '编辑者',
      type: 'warning',
      description: '可编辑和管理文档，无法管理系统'
    },
    {
      value: 'viewer',
      label: '查看者',
      type: 'info',
      description: '仅可查看和搜索文档'
    }
  ]

  return allRoles.filter(role => props.allowedRoles.includes(role.value))
})
</script>

<style scoped>
.role-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.role-description {
  font-size: 12px;
  color: #909399;
  flex: 1;
}
</style>
