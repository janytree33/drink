import React, { useState, useEffect } from "react";
import { 
  INITIAL_MEMBERS, 
  INITIAL_DRINKS, 
  DRINK_DETAILS 
} from "./data/defaultData";
import VisualMenu from "./components/VisualMenu";
import VoteForm from "./components/VoteForm";
import OrderSummary from "./components/OrderSummary";
import UnvotedList from "./components/UnvotedList";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  // -----------------------------------------
  // 💾 [상태 정의 1] 멤버 리스트 (로컬스토리지 연동)
  // -----------------------------------------
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem("janytree_members");
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  // -----------------------------------------
  // 💾 [상태 정의 2] 음료 리스트 (로컬스토리지 연동)
  // -----------------------------------------
  const [drinks, setDrinks] = useState(() => {
    const saved = localStorage.getItem("janytree_drinks");
    return saved ? JSON.parse(saved) : INITIAL_DRINKS;
  });

  // -----------------------------------------
  // 💾 [상태 정의 3] 음료 메타 세부정보 (로컬스토리지 동적 상태 연동)
  // -----------------------------------------
  const [drinkDetails, setDrinkDetails] = useState(() => {
    const saved = localStorage.getItem("janytree_drink_details");
    return saved ? JSON.parse(saved) : DRINK_DETAILS;
  });

  // -----------------------------------------
  // 💾 [상태 정의 4] 투표 장부 (로컬스토리지 연동)
  // -----------------------------------------
  const [votes, setVotes] = useState(() => {
    const saved = localStorage.getItem("janytree_votes");
    return saved ? JSON.parse(saved) : [];
  });

  // 💾 [상태 정의 5] 관리자 설정 패널의 온오프(접고 펼치기) 상태
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // -----------------------------------------
  // 🔄 [동기화] 모든 동적 상태를 로컬스토리지에 실시간 자동 세이브!
  // -----------------------------------------
  useEffect(() => {
    localStorage.setItem("janytree_members", JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem("janytree_drinks", JSON.stringify(drinks));
  }, [drinks]);

  useEffect(() => {
    localStorage.setItem("janytree_drink_details", JSON.stringify(drinkDetails));
  }, [drinkDetails]);

  useEffect(() => {
    localStorage.setItem("janytree_votes", JSON.stringify(votes));
  }, [votes]);

  // -----------------------------------------
  // 🔮 [요구사항 1번 구현] 지능형 멤버 정렬기 (sortMembers)
  // ➔ 일반 이름은 한글 오름차순(가나다순) 정렬!
  // ➔ Guest가 붙은 임시 이름은 무조건 목록의 맨 아래(최하단)로 밀어냅니다!
  // -----------------------------------------
  const sortMembers = (memberList) => {
    return [...memberList].sort((a, b) => {
      const aIsGuest = a.startsWith("Guest");
      const bIsGuest = b.startsWith("Guest");
      
      // 1. 만약 a가 Guest이고 b는 일반 직원이면, a(Guest)를 뒤로 보냄 (우선순위 낮춤)
      if (aIsGuest && !bIsGuest) return 1;
      
      // 2. 만약 b가 Guest이고 a는 일반 직원이면, b(Guest)를 뒤로 보냄
      if (!aIsGuest && bIsGuest) return -1;
      
      // 3. 둘 다 Guest인 경우, 숫자 크기 오름차순 정렬 (Guest1 -> Guest2 -> Guest3 -> Guest4)
      if (aIsGuest && bIsGuest) {
        return a.localeCompare(b, undefined, { numeric: true });
      }
      
      // 4. 둘 다 일반 직원인 경우, 자비 없는 한국어 한글 가나다 오름차순 정렬!
      return a.localeCompare(b, "ko");
    });
  };

  // -----------------------------------------
  // ➕ [로직 1] 신규 멤버 가입
  // -----------------------------------------
  const handleAddMember = (newMemberName) => {
    const trimmed = newMemberName.trim();
    if (!trimmed) {
      alert("직원 이름을 정확히 적어주세요!");
      return false;
    }
    if (members.includes(trimmed)) {
      alert("이미 가입되어 있는 동일한 성함이 존재합니다!");
      return false;
    }
    setMembers((prev) => [...prev, trimmed]);
    return true;
  };

  // ❌ [로직 2] 멤버 탈퇴 (즉시 삭제)
  const handleDeleteMember = (nameToDelete) => {
    setMembers((prev) => prev.filter((m) => m !== nameToDelete));
    setVotes((prev) => prev.filter((v) => v.memberName !== nameToDelete));
  };

  // -----------------------------------------
  // ➕ [로직 3] 신메뉴 출시
  // -----------------------------------------
  const handleAddDrink = (newDrinkName, hasCaffeine, iceOnly) => {
    const trimmed = newDrinkName.trim();
    if (!trimmed) {
      alert("음료 종류 명칭을 적어주세요!");
      return false;
    }
    if (drinks.includes(trimmed)) {
      alert("이미 판에 기재되어 있는 음료입니다!");
      return false;
    }

    const directInputIndex = drinks.indexOf("직접입력");
    if (directInputIndex !== -1) {
      const nextDrinks = [...drinks];
      nextDrinks.splice(directInputIndex, 0, trimmed);
      setDrinks(nextDrinks);
    } else {
      setDrinks((prev) => [...prev, trimmed]);
    }

    setDrinkDetails((prev) => ({
      ...prev,
      [trimmed]: {
        emoji: hasCaffeine ? "☕" : "🍹",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80",
        iceOnly: iceOnly,
        hasCaffeine: hasCaffeine
      }
    }));

    return true;
  };

  // ❌ [로직 4] 음료 메뉴 단종 (즉시 삭제)
  const handleDeleteDrink = (drinkToDelete) => {
    if (drinkToDelete === "직접입력") {
      alert("직접입력 옵션은 투표의 필수 요소이므로 지울 수 없습니다!");
      return;
    }
    setDrinks((prev) => prev.filter((d) => d !== drinkToDelete));
    
    setDrinkDetails((prev) => {
      const next = { ...prev };
      delete next[drinkToDelete];
      return next;
    });

    setVotes((prev) => prev.filter((v) => v.drinkName !== drinkToDelete));
  };

  // -----------------------------------------
  // 🖼️ [요구사항 2번 구현] ⭐음료 사진 이미지 주소(URL) 변경 마스터 함수⭐
  // ➔ 사장님이 마음에 안 드는 음료 사진을 원하는 새 Unsplash/웹 이미지로 갈아 끼우는 기술!
  // -----------------------------------------
  const handleUpdateDrinkImage = (drinkName, newImageUrl) => {
    const trimmedUrl = newImageUrl.trim();
    if (!trimmedUrl) {
      alert("변경할 새로운 고화질 이미지 사진 인터넷 주소(URL)를 입력해 주세요!");
      return false;
    }

    setDrinkDetails((prev) => {
      if (!prev[drinkName]) return prev;
      return {
        ...prev,
        [drinkName]: {
          ...prev[drinkName],
          image: trimmedUrl
        }
      };
    });

    return true;
  };

  // -----------------------------------------
  // 🗳️ [로직 5] 투표 등록 및 덮어쓰기 (1인 1표 보증)
  // -----------------------------------------
  const handleVoteSubmit = (newVote) => {
    setVotes((prev) => {
      const existingVoteIndex = prev.findIndex(
        (v) => v.memberName === newVote.memberName
      );
      if (existingVoteIndex !== -1) {
        const updated = [...prev];
        updated[existingVoteIndex] = newVote;
        return updated;
      } else {
        return [...prev, newVote];
      }
    });
  };

  // 🗑️ [로직 6] 개별 주문 취소 (주문 집계 아코디언 내부에서 ✕ 누르면 작동)
  const handleDeleteVote = (memberName) => {
    setVotes((prev) => prev.filter((v) => v.memberName !== memberName));
  };

  // 🔄 [요구사항 3번 구현] ⭐전체 투표 장부 완전 리셋 (오류 치료판)⭐
  // ➔ 브라우저 차단 필터에 차단되던 window.confirm을 전면 박멸하고, 
  // ➔ 누르는 즉시 0.1초 만에 깔끔히 리셋 후 예쁜 성공 알림창으로 즉시 보장합니다!
  const handleResetAllVotes = () => {
    setVotes([]);
    alert("🎉 오늘 하루의 음료 투표 대장이 깨끗하게 초기화(청소)되었습니다!");
  };

  // 정렬된 멤버 명단 준비
  const sortedMembers = sortMembers(members);

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 antialiased relative">
      
      {/* ❄️ 눈송이 글로벌 배경 레이어 */}
      <div className="absolute inset-0 snow-bg pointer-events-none z-0"></div>

      {/* 메인 전체 레이아웃 바디 */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-8">
        
        {/* =========================================
            🔝 [1단계] 최상단 뷰티풀 브랜드 헤더
            ========================================= */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white/70 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/40 shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Janytree 로고" 
              className="w-10 h-10 object-contain rounded-full shadow-md border border-slate-200 transform hover:rotate-12 transition-transform duration-300"
            />
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Janytree</span> 
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                  음료 투표 & 주문
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                우리 팀의 오늘 음료를 스마트하게 수합하고 주문해 보세요! 옵션 조건부 자동화 기능 제공.
              </p>
            </div>
          </div>

          {/* 우측 관리용 설정 토글 버튼 및 리셋 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all shadow-sm ${
                isAdminOpen 
                  ? "bg-slate-800 text-white border-slate-800 hover:bg-slate-900" 
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {isAdminOpen ? "⚙️ 관리 설정 닫기" : "⚙️ 관리 설정 열기"}
            </button>
            
            {/* 🔄 [오류 격파!] window.confirm 없이 즉시 리셋 치료 완료 */}
            <button
              onClick={handleResetAllVotes}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1"
            >
              🔄 전체 리셋
            </button>
          </div>
        </header>

        {/* =========================================
            📦 [2단계] 메인 2단 구조 보드 (왼쪽: 비주얼 메뉴, 오른쪽: 대시보드)
            ========================================= */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 👈 [좌측 5칸] Janytree 메뉴판 이미지 그리드 */}
          <section className="lg:col-span-5 h-full">
            <VisualMenu 
              drinks={drinks} 
              drinkDetails={drinkDetails} 
            />
          </section>

          {/* 👉 [우측 7칸] 투표 폼 + 합계 통계 + 미투표자 리스트 */}
          <section className="lg:col-span-7 space-y-8">
            
            {/* 1. 투표 입력 폼 (지능형으로 정렬된 sortedMembers 주입!) */}
            <VoteForm 
              members={sortedMembers} 
              drinks={drinks} 
              drinkDetails={drinkDetails}
              votes={votes}
              onVoteSubmit={handleVoteSubmit}
            />

            {/* 2. 최종 주문 합계 집계표 (동일 스펙 자동 묶음) */}
            <OrderSummary 
              votes={votes} 
              drinkDetails={drinkDetails}
              onDeleteVote={handleDeleteVote}
            />

            {/* 3. 아직 안 낸 미투표 대기자 카드 (지능형 sortedMembers 주입!) */}
            <UnvotedList 
              members={sortedMembers} 
              votes={votes} 
            />

          </section>
        </main>

        {/* =========================================
            🔧 [3단계] 토글형 어드민 관리 설정 패널 (sortedMembers 및 사진변경 함수 전달!)
            ========================================= */}
        {isAdminOpen && (
          <footer className="mt-8">
            <AdminPanel 
              members={sortedMembers} 
              drinks={drinks} 
              onAddMember={handleAddMember}
              onDeleteMember={handleDeleteMember}
              onAddDrink={handleAddDrink}
              onDeleteDrink={handleDeleteDrink}
              onUpdateDrinkImage={handleUpdateDrinkImage}
            />
          </footer>
        )}

      </div>
    </div>
  );
}
