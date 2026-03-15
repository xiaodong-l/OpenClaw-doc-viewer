import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('./views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/document',
    name: 'Document',
    component: () => import('./views/Document.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('./views/Search.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: () => import('./views/UserManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/share/:token',
    name: 'ShareView',
    component: () => import('./views/ShareView.vue'),
    meta: { 
      requiresAuth: false,  // 公开页面，无需认证
      title: '文档分享'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('doc-viewer-token')
  const user = JSON.parse(localStorage.getItem('doc-viewer-user') || 'null')

  // 需要认证的路由
  if (to.meta.requiresAuth !== false && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // 需要管理员权限的路由
  if (to.meta.requiresAdmin && user?.role !== 'admin') {
    next({ name: 'Home' })
    return
  }

  // 已登录用户访问登录页，重定向到首页
  if (to.name === 'Login' && token) {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router
