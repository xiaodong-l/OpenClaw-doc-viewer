-- OpenClaw Doc Viewer v2.0.0
-- 用户数据库架构

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  avatar_url VARCHAR(512),
  email_verified BOOLEAN DEFAULT FALSE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret VARCHAR(255),
  last_login_at TIMESTAMP,
  last_login_ip VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 文档权限表
CREATE TABLE IF NOT EXISTS document_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_path VARCHAR(2048) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  
  UNIQUE(document_path, user_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_doc_perms_path ON document_permissions(document_path);
CREATE INDEX IF NOT EXISTS idx_doc_perms_user ON document_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_doc_perms_role ON document_permissions(role);

-- 审计日志表
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- 初始管理员账户 (密码需要哈希后插入)
-- INSERT INTO users (email, username, password_hash, role, status)
-- VALUES ('admin@doc-viewer.com', 'admin', '$argon2id$...', 'admin', 'active');
