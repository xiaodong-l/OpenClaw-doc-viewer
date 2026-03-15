/**
 * 评论服务 - v1.3.0 新增
 * 管理文档评论的 CRUD 操作
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '../data/comments.json')

class CommentService {
  /**
   * 加载评论数据
   */
  async loadData() {
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8')
      return JSON.parse(data)
    } catch (e) {
      // 文件不存在或解析失败，返回空数据
      return { comments: [] }
    }
  }

  /**
   * 保存评论数据
   */
  async saveData(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  }

  /**
   * 根据文档路径获取评论列表
   * @param {string} documentPath - 文档路径
   * @returns {Promise<Array>} 评论树形结构
   */
  async findByDocument(documentPath) {
    const data = await this.loadData()
    const comments = data.comments.filter(c => c.documentPath === documentPath)
    
    // 构建评论树
    return this.buildCommentTree(comments)
  }

  /**
   * 构建评论树形结构
   */
  buildCommentTree(comments) {
    // 根评论 (没有 parentId)
    const rootComments = comments.filter(c => !c.parentId)
    // 回复评论
    const replies = comments.filter(c => c.parentId)
    
    // 将回复关联到父评论
    return rootComments.map(comment => ({
      ...comment,
      replies: replies.filter(r => r.parentId === comment.id)
    }))
  }

  /**
   * 根据 ID 获取评论
   */
  async findById(id) {
    const data = await this.loadData()
    return data.comments.find(c => c.id === id)
  }

  /**
   * 创建评论
   */
  async create(comment) {
    const data = await this.loadData()
    
    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      documentPath: comment.documentPath,
      userId: comment.userId,
      userName: comment.userName,
      userAvatar: comment.userAvatar || null,
      content: comment.content,
      parentId: comment.parentId || null,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    data.comments.push(newComment)
    await this.saveData(data)
    
    return newComment
  }

  /**
   * 更新评论
   */
  async update(id, updates) {
    const data = await this.loadData()
    const index = data.comments.findIndex(c => c.id === id)
    
    if (index === -1) {
      throw new Error('评论不存在')
    }
    
    // 只允许更新 content 字段
    const allowedUpdates = ['content']
    const sanitizedUpdates = {}
    allowedUpdates.forEach(key => {
      if (updates[key] !== undefined) {
        sanitizedUpdates[key] = updates[key]
      }
    })
    
    data.comments[index] = {
      ...data.comments[index],
      ...sanitizedUpdates,
      updatedAt: new Date().toISOString()
    }
    
    await this.saveData(data)
    return data.comments[index]
  }

  /**
   * 删除评论 (包括回复)
   */
  async delete(id) {
    const data = await this.loadData()
    
    // 找到要删除的评论及其所有回复
    const idsToDelete = this.findAllReplies(id, data.comments)
    
    if (idsToDelete.length === 0) {
      throw new Error('评论不存在')
    }
    
    data.comments = data.comments.filter(c => !idsToDelete.includes(c.id))
    await this.saveData(data)
    
    return true
  }

  /**
   * 递归查找所有回复 ID
   */
  findAllReplies(parentId, comments) {
    const ids = [parentId]
    const replies = comments.filter(c => c.parentId === parentId)
    
    replies.forEach(reply => {
      ids.push(...this.findAllReplies(reply.id, comments))
    })
    
    return ids
  }

  /**
   * 点赞/取消点赞评论
   */
  async like(id, userId) {
    const data = await this.loadData()
    const comment = data.comments.find(c => c.id === id)
    
    if (!comment) {
      throw new Error('评论不存在')
    }
    
    const likeIndex = comment.likedBy.indexOf(userId)
    
    if (likeIndex === -1) {
      // 点赞
      comment.likedBy.push(userId)
      comment.likes++
    } else {
      // 取消点赞
      comment.likedBy.splice(likeIndex, 1)
      comment.likes--
    }
    
    await this.saveData(data)
    return comment
  }

  /**
   * 获取评论统计
   */
  async getStats(documentPath) {
    const data = await this.loadData()
    const comments = data.comments.filter(c => c.documentPath === documentPath)
    
    return {
      total: comments.length,
      rootComments: comments.filter(c => !c.parentId).length,
      replies: comments.filter(c => c.parentId).length,
      totalLikes: comments.reduce((sum, c) => sum + c.likes, 0)
    }
  }
}

export default new CommentService()
