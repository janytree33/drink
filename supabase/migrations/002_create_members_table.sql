-- ================================================================
-- 👤 [002] 직원 멤버 테이블 (members) 생성
-- ================================================================
-- 이 SQL을 Supabase 대시보드 → SQL Editor에서 실행해주세요!
-- ================================================================

CREATE TABLE IF NOT EXISTS members (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY, -- 자동 생성 고유 ID
  name       TEXT        NOT NULL UNIQUE,                        -- 직원 이름 (중복 불가)
  created_at TIMESTAMPTZ DEFAULT NOW()                           -- 등록 일시 (자동 기록)
);

-- ✅ Row Level Security (누구나 읽고 쓸 수 있게 허용)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "모든 사용자 members 테이블 전체 접근 허용"
  ON members FOR ALL
  USING (true)
  WITH CHECK (true);
