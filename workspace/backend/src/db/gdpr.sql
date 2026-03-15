-- OpenClaw Doc Viewer v2.0.0
-- GDPR 合规数据库架构

-- 数据导出请求表
CREATE TABLE IF NOT EXISTS gdpr_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  export_path VARCHAR(1024),
  download_token VARCHAR(64) UNIQUE,
  expires_at TIMESTAMP,
  requested_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_gdpr_exports_user ON gdpr_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_exports_status ON gdpr_export_requests(status);
CREATE INDEX IF NOT EXISTS idx_gdpr_exports_token ON gdpr_export_requests(download_token);

-- 账户删除请求表
CREATE TABLE IF NOT EXISTS gdpr_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, processing, completed, cancelled
  confirmation_token VARCHAR(64) UNIQUE,
  requested_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_gdpr_deletions_user ON gdpr_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_deletions_status ON gdpr_deletion_requests(status);

-- 隐私设置表
CREATE TABLE IF NOT EXISTS privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  profile_visible BOOLEAN DEFAULT TRUE,
  activity_visible BOOLEAN DEFAULT FALSE,
  allow_analytics BOOLEAN DEFAULT TRUE,
  allow_marketing BOOLEAN DEFAULT FALSE,
  data_retention_days INTEGER DEFAULT 365,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_privacy_user ON privacy_settings(user_id);

-- Cookie 同意记录表
CREATE TABLE IF NOT EXISTS cookie_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(64),
  categories JSONB, -- ["essential", "analytics"]
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_cookie_user ON cookie_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_cookie_session ON cookie_consents(session_id);

-- 数据处理日志表
CREATE TABLE IF NOT EXISTS data_processing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- export, delete, anonymize
  details JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_processing_user ON data_processing_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_action ON data_processing_logs(action);

-- 匿名化用户数据的函数
CREATE OR REPLACE FUNCTION anonymize_user_data(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- 更新用户表
  UPDATE users SET
    email = CONCAT('deleted_', id, '@deleted.local'),
    username = 'Deleted User',
    name = NULL,
    password_hash = NULL,
    mfa_secret = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- 删除隐私设置
  DELETE FROM privacy_settings WHERE user_id = p_user_id;

  -- 删除 Cookie 同意
  DELETE FROM cookie_consents WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
