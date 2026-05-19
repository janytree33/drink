// ==========================================
// ☕ [제니트리] 음료 투표 초기 데이터 보관소 (개정판 2)
// ==========================================
// 초보자 가이드: 이 파일은 최초 사이트 접속 시 세팅되는 기본 직원들과 기본 음료 목록입니다.
// 바닐라라떼의 디폴트 Unsplash 주소를 샌드위치 등이 전혀 없는 진짜 맑고 시원한 정석 커피 라떼 샷으로 교환했습니다!

// 1. 초기 멤버 리스트 (총 15명 - Guest 4명 포함)
export const INITIAL_MEMBERS = [
  "김은주", "김은혜", "김희진", "박찬욱", "양미라",
  "이용직", "임복숙", "정수인", "정아람", "형남건",
  "황선미", "Guest1", "Guest2", "Guest3", "Guest4"
];

// 2. 초기 음료 리스트 (순서 및 이름은 캡쳐 시안 기반)
export const INITIAL_DRINKS = [
  "로얄밀크티라떼",
  "딸기라떼",
  "초코라떼",
  "바닐라라떼",
  "쿠앤크프라페",
  "민트초코프라페",
  "말차라떼",
  "카페라떼",
  "아메리카노",
  "직접입력"
];

// 3. 음료별 상세 정보 (개정된 고화질 리얼 비주얼 매핑 2)
// - 바닐라라떼: 샌드위치 등이 전혀 보이지 않고, 유리컵에 우유와 에스프레소 샷이 투명하게 담긴 정석 아이스 라떼 커피 샷!
export const DRINK_DETAILS = {
  "로얄밀크티라떼": {
    emoji: "🥛",
    image: "https://img1.kakaocdn.net/thumb/C375x375@2x.fwebp.q82/?fname=https%3A%2F%2Fst.kakaocdn.net%2Fproduct%2Fgift%2Fproduct%2F20220704143508_4438b0faea45411e8e93f7050021aa7e.jpg",
    iceOnly: false,
    hasCaffeine: false
  },
  "딸기라떼": {
    emoji: "🍓",
    image: "https://img1.kakaocdn.net/thumb/C375x375@2x.fwebp.q82/?fname=https%3A%2F%2Fst.kakaocdn.net%2Fproduct%2Fgift%2Fproduct%2F20230203140520_f5d65fe3fae144ab8405723a34ee2a95.jpg",
    iceOnly: true,
    hasCaffeine: false
  },
  "초코라떼": {
    emoji: "🍫",
    image: "https://img1.kakaocdn.net/thumb/C375x375@2x.fwebp.q82/?fname=https%3A%2F%2Fst.kakaocdn.net%2Fproduct%2Fgift%2Fproduct%2F20220622112909_d8f9ef5591114dea83c0b070f55a8dac.jpg",
    iceOnly: false,
    hasCaffeine: false
  },
  "바닐라라떼": {
    emoji: "🍦",
    // 💡 [샌드위치 박멸!] 샌드위치가 없는 진짜 영롱한 정석 라떼 커피 비주얼로 변경 완료!
    image: "https://img1.kakaocdn.net/thumb/C375x375@2x.fwebp.q82/?fname=https%3A%2F%2Fst.kakaocdn.net%2Fproduct%2Fgift%2Fproduct%2F20220622112659_d38714c17a064a0d927201a514f06594.jpg",
    iceOnly: false,
    hasCaffeine: false
  },
  "쿠앤크프라페": {
    emoji: "🍪",
    image: "https://img1.kakaocdn.net/thumb/C375x375@2x.fwebp.q82/?fname=https%3A%2F%2Fst.kakaocdn.net%2Fproduct%2Fgift%2Fproduct%2F20250225093032_c8a9b431a796460b882e9237eea3c576.jpg",
    iceOnly: true,
    hasCaffeine: false
  },
  "민트초코프라페": {
    emoji: "🌿",
    image: "https://img1.kakaocdn.net/thumb/C375x375@2x.fwebp.q82/?fname=https%3A%2F%2Fst.kakaocdn.net%2Fproduct%2Fgift%2Fproduct%2F20220622132624_5975a4e8b68d4c7486b1c9395e047469.jpg",
    iceOnly: true,
    hasCaffeine: false
  },
  "말차라떼": {
    emoji: "🍵",
    image: "https://img1.kakaocdn.net/thumb/C305x305@2x.fwebp.q82/?fname=https%3A%2F%2Fst.kakaocdn.net%2Fproduct%2Fgift%2Fproduct%2F20220622112338_5b6cb26637194758bd83c370ae8a6aef.jpg",
    iceOnly: false,
    hasCaffeine: false
  },
  "카페라떼": {
    emoji: "☕",
    image: "https://img1.kakaocdn.net/thumb/C375x375@2x.fwebp.q82/?fname=https%3A%2F%2Fst.kakaocdn.net%2Fproduct%2Fgift%2Fproduct%2F20260120174416_6a63bf12157e4ea8ad0379b6bf1ed538.jpg",
    iceOnly: false,
    hasCaffeine: true
  },
  "아메리카노": {
    emoji: "☕",
    image: "https://img1.kakaocdn.net/thumb/C375x375@2x.fwebp.q82/?fname=https%3A%2F%2Fst.kakaocdn.net%2Fproduct%2Fgift%2Fproduct%2F20260120174233_2242624c9f7a4da2a29c8445b8313cb4.jpg",
    iceOnly: false,
    hasCaffeine: true
  },
  "직접입력": {
    emoji: "✏️",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80",
    iceOnly: false,
    hasCaffeine: false
  }
};
