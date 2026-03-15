import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

export function useDarkMode() {
  const isDark = ref(false)
  const autoFollow = ref(true)
  const scheduledToggle = ref(false)
  const sunsetHour = ref(18) // 默认 18:00 切换
  const sunriseHour = ref(6) // 默认 6:00 切换

  // 从 localStorage 加载偏好
  const loadPreference = () => {
    const saved = localStorage.getItem('darkMode')
    const savedAuto = localStorage.getItem('darkModeAutoFollow')
    const savedScheduled = localStorage.getItem('darkModeScheduled')
    
    if (saved !== null) {
      isDark.value = JSON.parse(saved)
    } else if (autoFollow.value) {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    
    if (savedAuto !== null) {
      autoFollow.value = JSON.parse(savedAuto)
    }
    
    if (savedScheduled !== null) {
      scheduledToggle.value = JSON.parse(savedScheduled)
    }
  }

  // 保存到 localStorage
  const savePreference = () => {
    localStorage.setItem('darkMode', JSON.stringify(isDark.value))
    localStorage.setItem('darkModeAutoFollow', JSON.stringify(autoFollow.value))
    localStorage.setItem('darkModeScheduled', JSON.stringify(scheduledToggle.value))
  }

  // 应用暗黑模式
  const applyDarkMode = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark')
      document.documentElement.style.colorScheme = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.style.colorScheme = 'light'
    }
  }

  // 切换暗黑模式
  const toggle = () => {
    isDark.value = !isDark.value
    applyDarkMode(isDark.value)
    savePreference()
  }

  // 设置暗黑模式
  const setDark = (dark) => {
    isDark.value = dark
    applyDarkMode(dark)
    savePreference()
  }

  // 检查是否应该切换 (日落/日出时间)
  const checkScheduledToggle = () => {
    if (!scheduledToggle.value) return
    
    const currentHour = new Date().getHours()
    const shouldBeDark = currentHour >= sunsetHour.value || currentHour < sunriseHour.value
    
    if (shouldBeDark !== isDark.value) {
      setDark(shouldBeDark)
    }
  }

  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemThemeChange = (e) => {
    if (autoFollow.value) {
      setDark(e.matches)
    }
  }

  // 定时器检查定时切换
  let intervalId = null
  const startScheduledCheck = () => {
    if (scheduledToggle.value) {
      checkScheduledToggle()
      intervalId = setInterval(checkScheduledToggle, 60000) // 每分钟检查
    }
  }

  const stopScheduledCheck = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // 监听变化并保存
  watch([isDark, autoFollow, scheduledToggle], () => {
    savePreference()
  })

  onMounted(() => {
    loadPreference()
    applyDarkMode(isDark.value)
    
    if (autoFollow.value) {
      mediaQuery.addEventListener('change', handleSystemThemeChange)
    }
    
    startScheduledCheck()
  })

  onUnmounted(() => {
    if (autoFollow.value) {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
    stopScheduledCheck()
  })

  return {
    isDark: computed(() => isDark.value),
    autoFollow: computed(() => autoFollow.value),
    scheduledToggle: computed(() => scheduledToggle.value),
    sunsetHour: computed(() => sunsetHour.value),
    sunriseHour: computed(() => sunriseHour.value),
    toggle,
    setDark,
    setAutoFollow: (value) => {
      autoFollow.value = value
      if (value) {
        isDark.value = mediaQuery.matches
        applyDarkMode(isDark.value)
        mediaQuery.addEventListener('change', handleSystemThemeChange)
      } else {
        mediaQuery.removeEventListener('change', handleSystemThemeChange)
      }
      savePreference()
    },
    setScheduledToggle: (value) => {
      scheduledToggle.value = value
      if (value) {
        startScheduledCheck()
      } else {
        stopScheduledCheck()
      }
      savePreference()
    },
    setSunsetHour: (hour) => {
      sunsetHour.value = hour
      savePreference()
    },
    setSunriseHour: (hour) => {
      sunriseHour.value = hour
      savePreference()
    }
  }
}
