-- ================================================================
-- 🍹 [001] 음료 메뉴 테이블 (drinks) 생성
-- ================================================================
-- 이 SQL을 Supabase 대시보드 → SQL Editor에서 실행해주세요!
-- ================================================================

CREATE TABLE IF NOT EXISTS drinks (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY, -- 자동 생성 고유 ID
  name        TEXT        NOT NULL UNIQUE,                        -- 음료 이름 (중복 불가)
  emoji       TEXT        DEFAULT '🥤',                           -- 이모지 아이콘
  image       TEXT        DEFAULT '',                             -- 이미지 URL
  ice_only    BOOLEAN     DEFAULT false,                          -- ICE 전용 여부
  has_caffeine BOOLEAN    DEFAULT false,                          -- 카페인 포함 여부
  sort_order  INTEGER     DEFAULT 999,                            -- 화면에 보이는 순서
  created_at  TIMESTAMPTZ DEFAULT NOW()                           -- 생성 일시 (자동 기록)
);

-- ✅ Row Level Security (누구나 읽고 쓸 수 있게 허용)
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "모든 사용자 drinks 테이블 전체 접근 허용"
  ON drinks FOR ALL
  USING (true)
  WITH CHECK (true);
