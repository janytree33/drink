-- ================================================================
-- 🗳️ [003] 투표 내역 테이블 (votes) 생성
-- ================================================================
-- 이 SQL을 Supabase 대시보드 → SQL Editor에서 실행해주세요!
-- ================================================================

CREATE TABLE IF NOT EXISTS votes (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY, -- 자동 생성 고유 ID
  member_name TEXT        NOT NULL UNIQUE,                        -- 투표한 직원 이름 (1인 1표 보장!)
  drink_name  TEXT        NOT NULL,                               -- 선택한 음료 이름
  option      TEXT        DEFAULT 'ICE',                         -- 온도 옵션 (ICE / HOT)
  caffeine    TEXT        DEFAULT '해당없음',                      -- 카페인 옵션 (레귤러 / 디카페인 / 해당없음)
  custom_drink TEXT       DEFAULT NULL,                           -- 직접입력 시 내용
  created_at  TIMESTAMPTZ DEFAULT NOW()                           -- 투표 일시 (자동 기록)
);

-- ✅ Row Level Security (누구나 읽고 쓸 수 있게 허용)
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "모든 사용자 votes 테이블 전체 접근 허용"
  ON votes FOR ALL
  USING (true)
  WITH CHECK (true);
