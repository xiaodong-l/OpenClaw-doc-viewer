import fs from 'fs/promises'
import path from 'path'
import chokidar from 'chokidar'
import { parseMarkdown } from './markdownParser.js'

export class FileScanner {
  constructor(config) {
    this.config = config
    // 支持测试模式：如果 rootDirs 未设置或为空，使用空数组
    this.rootDirs = config?.rootDirs || []
    this.documents = new Map() // 存储文档元数据
    this.watcher = null
    this.scanPromise = null
    this.initialized = false
  }

  /**
   * 初始化扫描器
   */
  async initialize() {
    if (this.initialized) return
    
    console.log('[FileScanner] Initializing...')
    
    // 测试模式：如果没有配置根目录，跳过扫描
    if (this.rootDirs.length === 0) {
      console.log('[FileScanner] No root directories configured, skipping scan')
      this.initialized = true
      return
    }
    
    await this.scanAll()
    this.startWatching()
    console.log('[FileScanner] Initialized, indexed', this.documents.size, 'documents')
    this.initialized = true
  }

  /**
   * 扫描所有根目录
   */
  async scanAll() {
    if (this.scanPromise) return this.scanPromise
    
    this.scanPromise = (async () => {
      for (const rootDir of this.rootDirs) {
        try {
          await this.scanDirectory(rootDir)
        } catch (err) {
          console.error(`[FileScanner] Error scanning ${rootDir}:`, err.message)
        }
      }
    })()
    
    await this.scanPromise
    this.scanPromise = null
  }

  /**
   * 扫描单个目录
   */
  async scanDirectory(dir, baseDir = dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        
        // 跳过排除的目录
        if (entry.isDirectory() && this.shouldExclude(entry.name)) {
          continue
        }
        
        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath, baseDir)
        } else if (entry.isFile() && this.isMarkdown(entry.name)) {
          await this.indexFile(fullPath, baseDir)
        }
      }
    } catch (err) {
      if (err.code !== 'ENOENT' && err.code !== 'EACCES') {
        console.error(`[FileScanner] Error scanning ${dir}:`, err.message)
      }
    }
  }

  /**
   * 索引单个文件
   */
  async indexFile(filePath, baseDir) {
    try {
      const stat = await fs.stat(filePath)
      
      // 跳过超过大小限制的文件
      const maxFileSize = (this.config.scan?.maxFileSize || 10) * 1024 * 1024
      if (stat.size > maxFileSize) {
        return
      }
      
      const content = await fs.readFile(filePath, 'utf-8')
      const relativePath = path.relative(baseDir, filePath)
      
      // 提取标题 (第一个 # 标题)
      const titleMatch = content.match(/^#\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1].trim() : path.basename(filePath)
      
      // 提取摘要 (前 200 字)
      const excerpt = content
        .replace(/^#+\s+.+$/gm, '') // 移除标题
        .replace(/```[\s\S]*?```/g, '') // 移除代码块
        .trim()
        .slice(0, 200) + '...'
      
      const docId = this.generateId(filePath)
      
      // 确保 content 是字符串
      const contentStr = String(content || '')
      
      this.documents.set(docId, {
        id: docId,
        path: filePath,
        name: path.basename(filePath),
        relativePath,
        title,
        content: contentStr.slice(0, 50000), // 限制索引内容长度
        excerpt,
        rootDir: baseDir,
        size: stat.size,
        lines: contentStr.split('\n').length,
        wordCount: contentStr.split(/\s+/).length,
        updatedAt: stat.mtime.toISOString(),
        createdAt: stat.birthtime.toISOString()
      })
    } catch (err) {
      console.error(`[FileScanner] Error indexing ${filePath}:`, err.message)
    }
  }

  /**
   * 启动文件监听
   */
  startWatching() {
    // 测试模式：没有根目录时跳过监听
    if (this.rootDirs.length === 0) {
      console.log('[FileScanner] No root directories, skipping watch')
      return
    }

    const patterns = this.rootDirs.map(dir => path.join(dir, '**', '*.md'))
    
    try {
      this.watcher = chokidar.watch(patterns, {
        ignored: /(^|[\/\\])\../, // 忽略隐藏文件
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 1000,
          pollInterval: 100
        }
      })

      this.watcher
        .on('add', (path) => this.handleFileChange('add', path))
        .on('change', (path) => this.handleFileChange('change', path))
        .on('unlink', (path) => this.handleFileChange('unlink', path))
        .on('error', (error) => console.error('[FileScanner] Watcher error:', error))

      console.log('[FileScanner] Started watching for changes')
    } catch (err) {
      console.error('[FileScanner] Failed to start watching:', err.message)
    }
  }

  /**
   * 处理文件变更
   */
  async handleFileChange(event, filePath) {
    console.log(`[FileScanner] File ${event}: ${filePath}`)
    
    // 防抖处理
    const debounceMs = this.config.scan?.debounceMs || 1000
    await new Promise(resolve => setTimeout(resolve, debounceMs))
    
    if (event === 'unlink') {
      this.documents.delete(this.generateId(filePath))
    } else {
      const baseDir = this.rootDirs.find(dir => filePath.startsWith(dir))
      if (baseDir) {
        await this.indexFile(filePath, baseDir)
      }
    }
  }

  /**
   * 检查是否应该排除
   */
  shouldExclude(name) {
    const excludePatterns = this.config.scan?.exclude || ['node_modules', '.git', 'cache', 'tmp', 'logs', 'dist']
    return excludePatterns.some(pattern => name.includes(pattern))
  }

  /**
   * 检查是否是 Markdown 文件
   */
  isMarkdown(name) {
    return name.endsWith('.md') || name.endsWith('.markdown')
  }

  /**
   * 生成文件 ID
   */
  generateId(filePath) {
    return Buffer.from(filePath).toString('base64url')
  }

  /**
   * 获取目录树
   */
  async getDirectoryTree(dirPath = null, depth = 1) {
    if (!dirPath) {
      // 返回根目录列表
      return {
        path: '/',
        name: 'root',
        type: 'directory',
        children: this.rootDirs.map(dir => ({
          name: path.basename(dir),
          path: dir,
          type: 'directory',
          hasChildren: true,
          mdCount: this.countByRoot(dir)
        }))
      }
    }

    // 验证路径
    const validatedPath = this.validatePath(dirPath)
    if (!validatedPath) {
      throw new Error('Invalid path')
    }

    return await this.buildTree(validatedPath, depth)
  }

  /**
   * 构建树结构
   */
  async buildTree(dirPath, remainingDepth) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })
      const children = []

      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue
        if (this.shouldExclude(entry.name)) continue

        const fullPath = path.join(dirPath, entry.name)
        
        if (entry.isDirectory()) {
          const mdCount = this.countByPath(fullPath)
          children.push({
            name: entry.name,
            path: fullPath,
            type: 'directory',
            hasChildren: remainingDepth > 1,
            mdCount
          })
        } else if (entry.isFile() && this.isMarkdown(entry.name)) {
          const stat = await fs.stat(fullPath)
          children.push({
            name: entry.name,
            path: fullPath,
            type: 'file',
            size: stat.size,
            sizeFormatted: this.formatSize(stat.size),
            updatedAt: stat.mtime.toISOString()
          })
        }
      }

      // 按类型和名称排序
      children.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
        return a.name.localeCompare(b.name)
      })

      return {
        name: path.basename(dirPath),
        path: dirPath,
        type: 'directory',
        children
      }
    } catch (err) {
      if (err.code === 'EACCES') {
        return {
          name: path.basename(dirPath),
          path: dirPath,
          type: 'directory',
          children: [],
          error: 'Permission denied'
        }
      }
      throw err
    }
  }

  /**
   * 验证路径是否在允许的根目录内
   */
  validatePath(userPath) {
    const resolved = path.resolve(userPath)
    
    // 检查是否在允许的根目录内
    const isAllowed = this.rootDirs.some(root => 
      resolved.startsWith(path.resolve(root))
    )
    
    if (!isAllowed) {
      return null
    }
    
    return resolved
  }

  /**
   * 获取文件内容
   */
  async getFileContent(filePath) {
    const validatedPath = this.validatePath(filePath)
    if (!validatedPath) {
      throw new Error('Invalid path')
    }

    const stat = await fs.stat(validatedPath)
    const content = await fs.readFile(validatedPath, 'utf-8')
    
    // 提取标题
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : path.basename(validatedPath)

    return {
      path: validatedPath,
      name: path.basename(validatedPath),
      title,
      content,
      meta: {
        size: stat.size,
        sizeFormatted: this.formatSize(stat.size),
        lines: content.split('\n').length,
        wordCount: content.split(/\s+/).length,
        updatedAt: stat.mtime.toISOString(),
        encoding: 'UTF-8'
      }
    }
  }

  /**
   * 格式化文件大小
   */
  formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB']
    let i = 0
    let size = bytes
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024
      i++
    }
    return `${size.toFixed(1)}${units[i]}`
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalFiles: this.documents.size,
      totalDirectories: 0, // 需要单独计算
      totalSize: this.getTotalSize(),
      totalSizeFormatted: this.formatSize(this.getTotalSize()),
      lastScan: new Date().toISOString(),
      rootDirs: this.rootDirs
    }
  }

  /**
   * 关闭扫描器
   */
  async close() {
    if (this.watcher) {
      await this.watcher.close()
    }
  }

  /**
   * 获取所有文档
   */
  getAllDocuments() {
    return Array.from(this.documents.values())
  }

  /**
   * 获取总大小
   */
  getTotalSize() {
    let total = 0
    for (const doc of this.documents.values()) {
      total += doc.size || 0
    }
    return total
  }

  /**
   * 按根目录计数
   */
  countByRoot(rootDir) {
    let count = 0
    for (const doc of this.documents.values()) {
      if (doc.rootDir === rootDir) count++
    }
    return count
  }

  /**
   * 按路径计数
   */
  countByPath(dirPath) {
    let count = 0
    for (const doc of this.documents.values()) {
      if (doc.path.startsWith(dirPath)) count++
    }
    return count
  }
}
