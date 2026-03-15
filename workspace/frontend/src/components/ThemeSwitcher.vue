<template>
  <div class="theme-switcher">
    <el-dropdown trigger="click" @command="handleCommand">
      <el-button text>
        <el-icon>
          <component :is="isDark ? 'Sunny' : 'Moon'" />
        </el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="light">
            <el-icon><Sunny /></el-icon>
            浅色模式
          </el-dropdown-item>
          <el-dropdown-item command="dark">
            <el-icon><Moon /></el-icon>
            深色模式
          </el-dropdown-item>
          <el-dropdown-item divided command="auto">
            <el-icon><Monitor /></el-icon>
            跟随系统
            <el-tag v-if="autoFollow" size="small" type="success" style="margin-left: 8px">
              已启用
            </el-tag>
          </el-dropdown-item>
          <el-dropdown-item command="scheduled">
            <el-icon><Clock /></el-icon>
            定时切换
            <el-tag v-if="scheduledToggle" size="small" type="success" style="margin-left: 8px">
              已启用
            </el-tag>
          </el-dropdown-item>
          <el-dropdown-item command="settings">
            <el-icon><Setting /></el-icon>
            更多设置
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 设置对话框 -->
    <el-dialog
      v-model="showSettings"
      title="暗黑模式设置"
      width="400px"
    >
      <el-form label-width="100px" size="default">
        <el-form-item label="跟随系统">
          <el-switch
            v-model="autoFollow"
            @change="handleAutoFollowChange"
          />
        </el-form-item>
        <el-form-item label="定时切换">
          <el-switch
            v-model="scheduledToggle"
            @change="handleScheduledChange"
          />
        </el-form-item>
        <el-form-item v-if="scheduledToggle" label="日落时间">
          <el-time-picker
            v-model="sunsetTime"
            format="HH:mm"
            value-format="HH"
            :default-value="new Date(2000, 0, 1, 18, 0)"
            @change="handleSunsetChange"
          />
        </el-form-item>
        <el-form-item v-if="scheduledToggle" label="日出时间">
          <el-time-picker
            v-model="sunriseTime"
            format="HH:mm"
            value-format="HH"
            :default-value="new Date(2000, 0, 1, 6, 0)"
            @change="handleSunriseChange"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="showSettings = false">完成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Sunny, Moon, Monitor, Clock, Setting } from '@element-plus/icons-vue'
import { useDarkMode } from '@/composables/useDarkMode'

const {
  isDark,
  autoFollow,
  scheduledToggle,
  sunsetHour,
  sunriseHour,
  toggle,
  setDark,
  setAutoFollow,
  setScheduledToggle,
  setSunsetHour,
  setSunriseHour
} = useDarkMode()

const showSettings = ref(false)
const sunsetTime = ref(sunsetHour.value.toString().padStart(2, '0'))
const sunriseTime = ref(sunriseHour.value.toString().padStart(2, '0'))

const handleCommand = (command) => {
  switch (command) {
    case 'light':
      setAutoFollow(false)
      setDark(false)
      break
    case 'dark':
      setAutoFollow(false)
      setDark(true)
      break
    case 'auto':
      setAutoFollow(true)
      setScheduledToggle(false)
      break
    case 'scheduled':
      setScheduledToggle(!scheduledToggle.value)
      break
    case 'settings':
      showSettings.value = true
      break
  }
}

const handleAutoFollowChange = (value) => {
  setAutoFollow(value)
  if (value) {
    setScheduledToggle(false)
  }
}

const handleScheduledChange = (value) => {
  setScheduledToggle(value)
  if (value) {
    setAutoFollow(false)
  }
}

const handleSunsetChange = (hour) => {
  setSunsetHour(parseInt(hour))
}

const handleSunriseChange = (hour) => {
  setSunriseHour(parseInt(hour))
}
</script>

<style scoped>
.theme-switcher {
  display: inline-block;
}
</style>
