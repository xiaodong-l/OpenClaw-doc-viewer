-- OpenClaw Doc Viewer v2.0.0
-- 权限系统数据库架构

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
CREATE INDEX IF NOT EXISTS idx_doc_perms_expires ON document_permissions(expires_at);

-- 用户组表
CREATE TABLE IF NOT EXISTS user_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 用户组成员表
CREATE TABLE IF NOT EXISTS user_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(group_id, user_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_group_members_group ON user_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON user_group_members(user_id);

-- 组权限表
CREATE TABLE IF NOT EXISTS group_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_path VARCHAR(2048) NOT NULL,
  group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  
  UNIQUE(document_path, group_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_group_perms_path ON group_permissions(document_path);
CREATE INDEX IF NOT EXISTS idx_group_perms_group ON group_permissions(group_id);

-- 权限变更日志表
CREATE TABLE IF NOT EXISTS permission_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_path VARCHAR(2048) NOT NULL,
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- grant, revoke, update
  old_role VARCHAR(20),
  new_role VARCHAR(20),
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW(),
  reason TEXT
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_perm_audit_doc ON permission_audit_logs(document_path);
CREATE INDEX IF NOT EXISTS idx_perm_audit_user ON permission_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_perm_audit_changed ON permission_audit_logs(changed_at);

-- 默认权限配置表
CREATE TABLE IF NOT EXISTS default_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_pattern VARCHAR(512) NOT NULL UNIQUE,
  default_role VARCHAR(20) NOT NULL CHECK (default_role IN ('owner', 'editor', 'viewer')),
  applies_to_subpaths BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_default_perms_pattern ON default_permissions(path_pattern);
