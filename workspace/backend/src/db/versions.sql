-- OpenClaw Doc Viewer v2.0.0
-- 文档版本控制系统数据库架构

-- 文档版本表
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_path VARCHAR(2048) NOT NULL,
  version_number INTEGER NOT NULL,
  content_hash VARCHAR(64) NOT NULL,
  content_snapshot_path VARCHAR(2048),
  content_preview TEXT,
  change_summary VARCHAR(1024),
  change_type VARCHAR(50) DEFAULT 'update', -- create, update, restore, rename
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(document_path, version_number)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_versions_path ON document_versions(document_path);
CREATE INDEX IF NOT EXISTS idx_versions_number ON document_versions(version_number);
CREATE INDEX IF NOT EXISTS idx_versions_created ON document_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_versions_creator ON document_versions(created_by);

-- 文档锁表
CREATE TABLE IF NOT EXISTS document_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_path VARCHAR(2048) UNIQUE NOT NULL,
  locked_by UUID REFERENCES users(id) ON DELETE CASCADE,
  locked_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  reason TEXT,
  auto_expire BOOLEAN DEFAULT TRUE
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_locks_path ON document_locks(document_path);
CREATE INDEX IF NOT EXISTS idx_locks_user ON document_locks(locked_by);
CREATE INDEX IF NOT EXISTS idx_locks_expires ON document_locks(expires_at);

-- 版本对比缓存表
CREATE TABLE IF NOT EXISTS version_diffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_version_id UUID REFERENCES document_versions(id) ON DELETE CASCADE,
  to_version_id UUID REFERENCES document_versions(id) ON DELETE CASCADE,
  diff_json JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(from_version_id, to_version_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_diffs_from ON version_diffs(from_version_id);
CREATE INDEX IF NOT EXISTS idx_diffs_to ON version_diffs(to_version_id);

-- 文档操作历史表
CREATE TABLE IF NOT EXISTS document_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_path VARCHAR(2048) NOT NULL,
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- view, edit, lock, unlock, version_create, version_restore
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_activity_path ON document_activity_logs(document_path);
CREATE INDEX IF NOT EXISTS idx_activity_user ON document_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_action ON document_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_created ON document_activity_logs(created_at);

-- 清理过期锁的函数
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM document_locks 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 创建定时清理任务 (需要 pg_cron 扩展)
-- SELECT cron.schedule('cleanup-locks', '*/5 * * * *', 'SELECT cleanup_expired_locks()');
