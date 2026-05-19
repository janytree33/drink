// ================================================================
// 🔌 Supabase 연결 모듈 (supabaseClient.js)
// ================================================================
// 비유: 이 파일은 "제니트리 앱"과 "Supabase DB 서버" 사이를 잇는
//       전화선(연결 통로) 역할을 합니다.
// 이 파일 하나만 불러오면 어느 컴포넌트에서든 DB를 사용할 수 있어요!
// ================================================================

// Supabase 공식 라이브러리에서 연결 생성 함수 불러오기
import { createClient } from '@supabase/supabase-js';

// .env 파일에 저장된 비밀 키 읽어오기
// (VITE_ 로 시작해야 Vite 프레임워크에서 읽을 수 있어요!)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase 클라이언트 인스턴스 생성 (= DB와의 연결 객체 만들기)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
