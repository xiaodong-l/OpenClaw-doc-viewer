-- OpenClaw Doc Viewer v2.0.0
-- 通知系统数据库架构

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- comment, mention, share, version, lock
  title VARCHAR(255) NOT NULL,
  content TEXT,
  link VARCHAR(512),
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- 通知设置表
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  email_comments BOOLEAN DEFAULT TRUE,
  email_mentions BOOLEAN DEFAULT TRUE,
  email_shares BOOLEAN DEFAULT TRUE,
  email_versions BOOLEAN DEFAULT FALSE,
  in_app_comments BOOLEAN DEFAULT TRUE,
  in_app_mentions BOOLEAN DEFAULT TRUE,
  in_app_shares BOOLEAN DEFAULT TRUE,
  in_app_versions BOOLEAN DEFAULT TRUE,
  digest_enabled BOOLEAN DEFAULT FALSE,
  digest_frequency VARCHAR(20) DEFAULT 'daily', -- daily, weekly
  quiet_hours_start VARCHAR(5) DEFAULT '22:00',
  quiet_hours_end VARCHAR(5) DEFAULT '08:00',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 邮件日志表
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  template VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed, bounced
  error_message TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON email_logs(created_at);

-- 清理过期通知的函数
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 清理 90 天前的已读通知
CREATE OR REPLACE FUNCTION cleanup_old_read_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications 
  WHERE is_read = TRUE AND created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
