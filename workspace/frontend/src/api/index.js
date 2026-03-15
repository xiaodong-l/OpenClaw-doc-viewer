import axios from 'axios'

// v1 API
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000
})

// v2 API (用户管理)
const apiV2 = axios.create({
  baseURL: '/api/v2',
  timeout: 30000
})

// v2 请求拦截器
apiV2.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// v2 响应拦截器
apiV2.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// 请求拦截器 - 自动添加 token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('doc-viewer-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default {
  /**
   * 认证相关
   */
  async login(username, password) {
    return api.post('/auth/login', { username, password })
  },

  async logout() {
    return api.post('/auth/logout')
  },

  async getCurrentUser() {
    return api.get('/auth/me')
  },

  async getUsers() {
    return api.get('/auth/users')
  },

  async createUser(userData) {
    return api.post('/auth/users', userData)
  },

  async deleteUser(id) {
    return api.delete(`/auth/users/${id}`)
  },

  /**
   * 文件相关
   */
  async getFiles(params = {}) {
    return api.get('/files', { params })
  },

  async getFileContent(path) {
    return api.get('/files/content', { params: { path } })
  },

  /**
   * 搜索相关
   */
  async search(query, options = {}) {
    return api.get('/search', {
      params: {
        q: query,
        limit: options.limit || 20,
        offset: options.offset || 0
      }
    })
  },

  async getSearchSuggestions(query, limit = 5) {
    return api.get('/search/suggest', {
      params: { q: query, limit }
    })
  },

  /**
   * 收藏相关
   */
  async getCollections() {
    return api.get('/collections')
  },

  async createCollection(name) {
    return api.post('/collections', { name })
  },

  async updateCollection(id, name) {
    return api.put(`/collections/${id}`, { name })
  },

  async deleteCollection(id) {
    return api.delete(`/collections/${id}`)
  },

  async addDocumentToCollection(collectionId, doc) {
    return api.post(`/collections/${collectionId}/documents`, doc)
  },

  async removeDocumentFromCollection(collectionId, docPath) {
    return api.delete(`/collections/${collectionId}/documents/${encodeURIComponent(docPath)}`)
  },

  async getCollectionDocuments(collectionId) {
    return api.get(`/collections/${collectionId}/documents`)
  },

  // v1.3.0 批量操作
  async batchDeleteDocuments(collectionId, documentPaths) {
    return api.post(`/collections/${collectionId}/docs/batch-delete`, { documentPaths })
  },

  async batchMoveDocuments(sourceCollectionId, targetCollectionId, documentPaths) {
    return api.post(`/collections/${sourceCollectionId}/docs/batch-move`, {
      documentPaths,
      targetCollectionId
    })
  },

  async batchDeleteCollections(collectionIds) {
    return api.post('/collections/batch-delete', { collectionIds })
  },

  /**
   * 阅读历史相关
   */
  async getReadingHistory(limit = 50) {
    return api.get('/user/history', { params: { limit } })
  },

  async addReadingHistory(doc) {
    return api.post('/user/history', doc)
  },

  async clearReadingHistory() {
    return api.delete('/user/history')
  },

  async removeReadingHistory(path) {
    return api.delete(`/user/history/${encodeURIComponent(path)}`)
  },

  /**
   * 分享相关
   */
  async getShares() {
    return api.get('/shares')
  },

  async createShare(data) {
    return api.post('/shares', data)
  },

  async getShareByToken(token) {
    return api.get(`/shares/${token}`)
  },

  async getPublicShare(token) {
    // v1.3.0 新增 - 无需认证
    return api.get(`/shares/${token}/public`)
  },

  async getShareDocument(token, path) {
    // v1.3.0 新增 - 无需认证
    return api.get(`/shares/${token}/document`, { params: { path } })
  },

  async deleteShare(id) {
    return api.delete(`/shares/${id}`)
  },

  async getShareStats(id) {
    return api.get(`/shares/${id}/stats`)
  },

  /**
   * 评论相关 - v1.3.0 新增
   */
  async getComments(documentPath) {
    return api.get('/comments', { params: { path: documentPath } })
  },

  async getCommentStats(documentPath) {
    return api.get('/comments/stats', { params: { path: documentPath } })
  },

  async createComment(documentPath, content, parentId = null) {
    return api.post('/comments', { documentPath, content, parentId })
  },

  async updateComment(id, content) {
    return api.put(`/comments/${id}`, { content })
  },

  async deleteComment(id) {
    return api.delete(`/comments/${id}`)
  },

  async likeComment(id) {
    return api.post(`/comments/${id}/like`)
  },

  /**
   * 搜索相关
   */
  async search(query, params = {}) {
    return api.get('/search', { params: { q: query, ...params } })
  },

  async getSuggestions(query) {
    return api.get('/search/suggest', { params: { q: query } })
  },

  /**
   * 统计相关
   */
  async getStats() {
    return api.get('/stats')
  },

  async refresh() {
    return api.post('/refresh')
  },

  /**
   * v2 API - 用户管理
   */
  v2: {
    // 认证相关
    async login(email, password) {
      return apiV2.post('/auth/login', { email, password })
    },

    async register(email, username, password) {
      return apiV2.post('/auth/register', { email, username, password })
    },

    async logout() {
      return apiV2.post('/auth/logout')
    },

    async refreshToken(refreshToken) {
      return apiV2.post('/auth/refresh', { refreshToken })
    },

    async getCurrentUser() {
      return apiV2.get('/auth/me')
    },

    async changePassword(currentPassword, newPassword) {
      return apiV2.put('/auth/password', { currentPassword, newPassword })
    },

    // 用户管理 (Admin)
    async getUsers(params = {}) {
      return apiV2.get('/users', { params })
    },

    async getUserStats() {
      return apiV2.get('/users/stats')
    },

    async getUser(id) {
      return apiV2.get(`/users/${id}`)
    },

    async createUser(email, username, password, role = 'viewer') {
      return apiV2.post('/users', { email, username, password, role })
    },

    async updateUser(id, userData) {
      return apiV2.put(`/users/${id}`, userData)
    },

    async updateUserStatus(id, status) {
      return apiV2.patch(`/users/${id}/status`, { status })
    },

    async resetUserPassword(id, newPassword) {
      return apiV2.post(`/users/${id}/reset-password`, { newPassword })
    },

    async deleteUser(id) {
      return apiV2.delete(`/users/${id}`)
    },

    // LDAP 相关
    async getLDAPConfigs() {
      return apiV2.get('/ldap')
    },

    async getLDAPConfig(id) {
      return apiV2.get(`/ldap/${id}`)
    },

    async createLDAPConfig(config) {
      return apiV2.post('/ldap', config)
    },

    async updateLDAPConfig(id, config) {
      return apiV2.put(`/ldap/${id}`, config)
    },

    async deleteLDAPConfig(id) {
      return apiV2.delete(`/ldap/${id}`)
    },

    async testLDAPConnection(id) {
      return apiV2.post(`/ldap/${id}/test`)
    },

    async syncLDAPUsers(id) {
      return apiV2.post(`/ldap/${id}/sync`)
    },

    async getLDAPLogs(id, limit = 50) {
      return apiV2.get(`/ldap/${id}/logs`, { params: { limit } })
    },

    async getLDAPStats(id) {
      return apiV2.get(`/ldap/${id}/stats`)
    },

    async getLDAPMappings(id) {
      return apiV2.get(`/ldap/${id}/mappings`)
    },

    async deleteLDAPMapping(mappingId) {
      return apiV2.delete(`/ldap/mappings/${mappingId}`)
    },

    // LDAP 登录
    async ldapLogin(configId, username, password) {
      return apiV2.post('/auth/ldap', { configId, username, password })
    },

    // 企业 SSO
    async getWechatConfig() {
      return apiV2.get('/sso/wechat/config')
    },

    async updateWechatConfig(config) {
      return apiV2.put('/sso/wechat/config', config)
    },

    async getDingtalkConfig() {
      return apiV2.get('/sso/dingtalk/config')
    },

    async updateDingtalkConfig(config) {
      return apiV2.put('/sso/dingtalk/config', config)
    },

    // GDPR 相关
    async requestDataExport() {
      return apiV2.post('/gdpr/export')
    },

    async downloadExport(token) {
      return apiV2.get(`/gdpr/export/${token}`)
    },

    async requestAccountDeletion(password, reason) {
      return apiV2.post('/gdpr/delete-account', { password, reason })
    },

    async confirmAccountDeletion(token) {
      return apiV2.post('/gdpr/delete-account/confirm', { token })
    },

    async getPrivacySettings() {
      return apiV2.get('/gdpr/privacy-settings')
    },

    async updatePrivacySettings(settings) {
      return apiV2.put('/gdpr/privacy-settings', settings)
    },

    async getCookiePolicy() {
      return apiV2.get('/gdpr/cookie-policy')
    },

    async submitCookieConsent(categories) {
      return apiV2.post('/gdpr/cookie-consent', { categories })
    }
  }
}
