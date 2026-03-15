import markdownIt from 'markdown-it'

// 创建 Markdown 解析器实例
const md = markdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
  highlight: (str, lang) => {
    // 代码高亮由前端处理
    return `<pre><code class="hljs language-${lang}">${md.utils.escapeHtml(str)}</code></pre>`
  }
})

// 自定义规则：渲染标题时添加 ID
const defaultHeadingRenderer = md.renderer.rules.heading_open || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options)
}

md.renderer.rules.heading_open = function(tokens, idx, options, env, self) {
  const token = tokens[idx]
  const level = token.tag.slice(1)
  
  // 查找标题内容
  let title = ''
  for (let i = idx + 1; i < tokens.length; i++) {
    if (tokens[i].type === 'heading_close') break
    if (tokens[i].type === 'text') {
      title += tokens[i].content
    }
  }
  
  // 生成 ID
  const id = title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
    .replace(/\s+/g, '-')
  
  token.attrSet('id', id)
  token.attrSet('class', `heading-${level}`)
  
  return defaultHeadingRenderer(tokens, idx, options, env, self)
}

// 链接渲染：外部链接添加 target="_blank"
const defaultLinkRenderer = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options)
}

md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
  const token = tokens[idx]
  const href = token.attrGet('href')
  
  // 如果是外部链接
  if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
    token.attrSet('target', '_blank')
    token.attrSet('rel', 'noopener noreferrer')
    token.attrSet('class', 'external-link')
  }
  
  return defaultLinkRenderer(tokens, idx, options, env, self)
}

// 图片渲染：添加懒加载
const defaultImageRenderer = md.renderer.rules.image || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options)
}

md.renderer.rules.image = function(tokens, idx, options, env, self) {
  const token = tokens[idx]
  token.attrSet('loading', 'lazy')
  token.attrSet('class', 'markdown-image')
  
  return defaultImageRenderer(tokens, idx, options, env, self)
}

/**
 * 解析 Markdown 为 HTML
 */
export function parseMarkdown(content) {
  return md.render(content)
}

/**
 * 解析 Markdown 并提取目录
 */
export function parseMarkdownWithToc(content) {
  const headings = []
  const tokens = md.parse(content, {})
  
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'heading_open') {
      const level = parseInt(tokens[i].tag.slice(1))
      let title = ''
      
      // 查找标题内容
      for (let j = i + 1; j < tokens.length; j++) {
        if (tokens[j].type === 'heading_close') break
        if (tokens[j].type === 'text' || tokens[j].type === 'code_inline') {
          title += tokens[j].content
        }
      }
      
      // 生成 ID
      const id = title
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
        .replace(/\s+/g, '-')
      
      headings.push({ level, title, id })
    }
  }
  
  return {
    html: md.render(content),
    toc: headings
  }
}

/**
 * 提取 Markdown 纯文本
 */
export function extractPlainText(content) {
  return content
    .replace(/^#+\s+.+$/gm, '') // 移除标题
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/`[^`]+`/g, '') // 移除行内代码
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文本
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 移除图片
    .replace(/^[>\-+*]\s+/gm, '') // 移除列表符号
    .replace(/\n{2,}/g, '\n') // 合并空行
    .trim()
}

export default {
  parseMarkdown,
  parseMarkdownWithToc,
  extractPlainText
}
