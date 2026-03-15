-- OpenClaw Doc Viewer v2.0.0
-- LDAP/AD 集成数据库架构

-- LDAP 配置表
CREATE TABLE IF NOT EXISTS ldap_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  host VARCHAR(255) NOT NULL,
  port INTEGER DEFAULT 389,
  use_ssl BOOLEAN DEFAULT FALSE,
  base_dn VARCHAR(512) NOT NULL,
  bind_dn VARCHAR(512),
  bind_password VARCHAR(512),
  user_filter VARCHAR(512) DEFAULT '(objectClass=person)',
  user_search_base VARCHAR(512),
  username_attribute VARCHAR(50) DEFAULT 'sAMAccountName',
  email_attribute VARCHAR(50) DEFAULT 'mail',
  display_name_attribute VARCHAR(50) DEFAULT 'displayName',
  group_attribute VARCHAR(50) DEFAULT 'memberOf',
  sync_enabled BOOLEAN DEFAULT TRUE,
  sync_interval INTEGER DEFAULT 3600,
  auto_create_user BOOLEAN DEFAULT TRUE,
  default_role VARCHAR(20) DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- LDAP 用户映射表
CREATE TABLE IF NOT EXISTS ldap_user_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ldap_config_id UUID REFERENCES ldap_configs(id) ON DELETE CASCADE,
  ldap_dn VARCHAR(1024) NOT NULL,
  ldap_uid VARCHAR(512) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(100),
  email VARCHAR(255),
  display_name VARCHAR(255),
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(ldap_config_id, ldap_dn)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_ldap_mappings_uid ON ldap_user_mappings(ldap_uid);
CREATE INDEX IF NOT EXISTS idx_ldap_mappings_user ON ldap_user_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_ldap_mappings_email ON ldap_user_mappings(email);

-- LDAP 组映射表
CREATE TABLE IF NOT EXISTS ldap_group_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ldap_config_id UUID REFERENCES ldap_configs(id) ON DELETE CASCADE,
  ldap_dn VARCHAR(1024) NOT NULL,
  ldap_cn VARCHAR(512) NOT NULL,
  role VARCHAR(20) DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(ldap_config_id, ldap_dn)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_ldap_groups_cn ON ldap_group_mappings(ldap_cn);

-- LDAP 同步日志表
CREATE TABLE IF NOT EXISTS ldap_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ldap_config_id UUID REFERENCES ldap_configs(id) ON DELETE CASCADE,
  sync_type VARCHAR(50) NOT NULL, -- full, incremental, user_create, user_update
  status VARCHAR(20) DEFAULT 'pending', -- pending, success, partial, failed
  users_synced INTEGER DEFAULT 0,
  users_created INTEGER DEFAULT 0,
  users_updated INTEGER DEFAULT 0,
  users_failed INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_ms INTEGER
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_ldap_logs_config ON ldap_sync_logs(ldap_config_id);
CREATE INDEX IF NOT EXISTS idx_ldap_logs_status ON ldap_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_ldap_logs_started ON ldap_sync_logs(started_at);

-- SSO 会话表
CREATE TABLE IF NOT EXISTS sso_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- ldap, wechat, dingtalk
  provider_user_id VARCHAR(512),
  token VARCHAR(512) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_sso_user ON sso_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sso_token ON sso_sessions(token);
CREATE INDEX IF NOT EXISTS idx_sso_expires ON sso_sessions(expires_at);

-- 清理过期 SSO 会话的函数
CREATE OR REPLACE FUNCTION cleanup_expired_sso_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM sso_sessions 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
