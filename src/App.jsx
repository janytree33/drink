import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  INITIAL_MEMBERS, 
  INITIAL_DRINKS, 
  DRINK_DETAILS 
} from "./data/defaultData";
import { supabase } from "./lib/supabaseClient";
import VisualMenu from "./components/VisualMenu";
import VoteForm from "./components/VoteForm";
import OrderSummary from "./components/OrderSummary";
import UnvotedList from "./components/UnvotedList";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  // -----------------------------------------
  // 💾 [상태 정의] 화면에서 사용할 데이터들
  // -----------------------------------------
  const [members, setMembers]           = useState([]);
  const [drinks, setDrinks]             = useState([]);
  const [drinkDetails, setDrinkDetails] = useState({});
  const [votes, setVotes]               = useState([]);
  const [isAdminOpen, setIsAdminOpen]   = useState(false);
  const [isLoading, setIsLoading]       = useState(true);
  const [dbError, setDbError]           = useState(null);

  // -----------------------------------------
  // 🔐 [관리자 비밀번호 모달] 상태 정의
  // -----------------------------------------
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput]             = useState("");
  const [passwordError, setPasswordError]             = useState(false);

  // -----------------------------------------
  // 📌 [스크롤 제어] 관리자 패널 위치 참조 & 상단으로 올라가기 버튼
  // -----------------------------------------
  const adminPanelRef   = useRef(null); // 관리자 패널 DOM 위치를 기억하는 "표시핀"
  const [showScrollTop, setShowScrollTop] = useState(false); // "위로" 버튼 노출 여부

  // 스크롤 위치를 감지해서 일정 이상 내려가면 "위로" 버튼 표시
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // -----------------------------------------
  // 🔄 [DB 데이터 가공 함수]
  // -----------------------------------------
  const processDrinksData = useCallback((drinksData) => {
    const drinkNames = drinksData.map((d) => d.name).sort((a, b) => {
      if (a === "직접입력") return 1;
      if (b === "직접입력") return -1;
      return a.localeCompare(b, "ko");
    });
    const details = {};
    drinksData.forEach((d) => {
      details[d.name] = {
        emoji:       d.emoji,
        image:       d.image,
        iceOnly:     d.ice_only,
        hasCaffeine: d.has_caffeine,
      };
    });
    setDrinks(drinkNames);
    setDrinkDetails(details);
  }, []);

  // -----------------------------------------
  // 🌱 [초기 데이터 심기] upsert 방식 (중복 방지)
  // -----------------------------------------
  const seedInitialDrinks = useCallback(async () => {
    const drinksToInsert = INITIAL_DRINKS.map((name, index) => ({
      name,
      emoji:        DRINK_DETAILS[name]?.emoji       || "🥤",
      image:        DRINK_DETAILS[name]?.image       || "",
      ice_only:     DRINK_DETAILS[name]?.iceOnly     || false,
      has_caffeine: DRINK_DETAILS[name]?.hasCaffeine || false,
      sort_order:   index,
    }));
    const { error } = await supabase
      .from("drinks")
      .upsert(drinksToInsert, { onConflict: "name", ignoreDuplicates: true });
    if (error) console.error("🌱 초기 음료 데이터 삽입 오류:", error.message);
  }, []);

  const seedInitialMembers = useCallback(async () => {
    const membersToInsert = INITIAL_MEMBERS.map((name) => ({ name }));
    const { error } = await supabase
      .from("members")
      .upsert(membersToInsert, { onConflict: "name", ignoreDuplicates: true });
    if (error) console.error("🌱 초기 멤버 데이터 삽입 오류:", error.message);
  }, []);

  // -----------------------------------------
  // 📡 [앱 시작 시 DB에서 모든 데이터 불러오기]
  // -----------------------------------------
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        setDbError(null);

        const { data: drinksData, error: drinksError } = await supabase
          .from("drinks").select("*").order("sort_order", { ascending: true });
        if (drinksError) throw drinksError;

        if (!drinksData || drinksData.length === 0) {
          await seedInitialDrinks();
          const { data: seeded } = await supabase
            .from("drinks").select("*").order("sort_order", { ascending: true });
          processDrinksData(seeded || []);
        } else {
          processDrinksData(drinksData);
        }

        const { data: membersData, error: membersError } = await supabase
          .from("members").select("*").order("name", { ascending: true });
        if (membersError) throw membersError;

        if (!membersData || membersData.length === 0) {
          await seedInitialMembers();
          const { data: seededMembers } = await supabase
            .from("members").select("*").order("name", { ascending: true });
          setMembers(seededMembers?.map((m) => m.name) || []);
        } else {
          setMembers(membersData.map((m) => m.name));
        }

        const { data: votesData, error: votesError } = await supabase
          .from("votes").select("*");
        if (votesError) throw votesError;

        setVotes(
          (votesData || []).map((v) => ({
            memberName: v.member_name,
            drinkName:  v.drink_name,
            option:     v.option,
            caffeine:   v.caffeine,
          }))
        );

      } catch (error) {
        console.error("❌ DB 연결 오류:", error);
        setDbError("DB 연결에 실패했습니다. 잠시 후 새로고침 해주세요.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [processDrinksData, seedInitialDrinks, seedInitialMembers]);

  // -----------------------------------------
  // 🔮 [지능형 멤버 정렬기] 한글 오름차순, Guest는 맨 아래
  // -----------------------------------------
  const sortMembers = (memberList) => {
    return [...memberList].sort((a, b) => {
      const aIsGuest = a.startsWith("Guest");
      const bIsGuest = b.startsWith("Guest");
      if (aIsGuest && !bIsGuest) return 1;
      if (!aIsGuest && bIsGuest) return -1;
      if (aIsGuest && bIsGuest) return a.localeCompare(b, undefined, { numeric: true });
      return a.localeCompare(b, "ko");
    });
  };

  // -----------------------------------------
  // ➕ [로직 1] 신규 멤버 추가
  // -----------------------------------------
  const handleAddMember = async (newMemberName) => {
    const trimmed = newMemberName.trim();
    if (!trimmed) { alert("직원 이름을 정확히 적어주세요!"); return false; }
    if (members.includes(trimmed)) { alert("이미 가입되어 있는 동일한 성함이 존재합니다!"); return false; }
    const { error } = await supabase.from("members").insert({ name: trimmed });
    if (error) { alert("멤버 추가 중 오류가 발생했습니다: " + error.message); return false; }
    setMembers((prev) => [...prev, trimmed]);
    return true;
  };

  // ❌ [로직 2] 멤버 삭제
  const handleDeleteMember = async (nameToDelete) => {
    const { error } = await supabase.from("members").delete().eq("name", nameToDelete);
    if (error) { alert("멤버 삭제 중 오류: " + error.message); return; }
    setMembers((prev) => prev.filter((m) => m !== nameToDelete));
    await supabase.from("votes").delete().eq("member_name", nameToDelete);
    setVotes((prev) => prev.filter((v) => v.memberName !== nameToDelete));
  };

  // ➕ [로직 3] 신메뉴 추가
  const handleAddDrink = async (newDrinkName, hasCaffeine, iceOnly) => {
    const trimmed = newDrinkName.trim();
    if (!trimmed) { alert("음료 종류 명칭을 적어주세요!"); return false; }
    if (drinks.includes(trimmed)) { alert("이미 판에 기재되어 있는 음료입니다!"); return false; }
    const directIndex = drinks.indexOf("직접입력");
    const newOrder = directIndex !== -1 ? directIndex : drinks.length;
    const { error } = await supabase.from("drinks").insert({
      name: trimmed, emoji: hasCaffeine ? "☕" : "🍹",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80",
      ice_only: iceOnly, has_caffeine: hasCaffeine, sort_order: newOrder,
    });
    if (error) { alert("음료 추가 중 오류: " + error.message); return false; }
    if (directIndex !== -1) {
      await supabase.from("drinks").update({ sort_order: newOrder + 1 }).eq("name", "직접입력");
    }
    const newDetails = { emoji: hasCaffeine ? "☕" : "🍹", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80", iceOnly, hasCaffeine };
    if (directIndex !== -1) {
      const nextDrinks = [...drinks];
      nextDrinks.splice(directIndex, 0, trimmed);
      setDrinks(nextDrinks);
    } else {
      setDrinks((prev) => [...prev, trimmed]);
    }
    setDrinkDetails((prev) => ({ ...prev, [trimmed]: newDetails }));
    return true;
  };

  // ❌ [로직 4] 음료 삭제
  const handleDeleteDrink = async (drinkToDelete) => {
    if (drinkToDelete === "직접입력") { alert("직접입력 옵션은 투표의 필수 요소이므로 지울 수 없습니다!"); return; }
    const { error } = await supabase.from("drinks").delete().eq("name", drinkToDelete);
    if (error) { alert("음료 삭제 중 오류: " + error.message); return; }
    setDrinks((prev) => prev.filter((d) => d !== drinkToDelete));
    setDrinkDetails((prev) => { const next = { ...prev }; delete next[drinkToDelete]; return next; });
    await supabase.from("votes").delete().eq("drink_name", drinkToDelete);
    setVotes((prev) => prev.filter((v) => v.drinkName !== drinkToDelete));
  };

  // 🖼️ [로직 5] 음료 이미지 변경
  const handleUpdateDrinkImage = async (drinkName, newImageUrl) => {
    const trimmedUrl = newImageUrl.trim();
    if (!trimmedUrl) { alert("변경할 새로운 이미지 주소(URL)를 입력해 주세요!"); return false; }
    const { error } = await supabase.from("drinks").update({ image: trimmedUrl }).eq("name", drinkName);
    if (error) { alert("이미지 변경 중 오류: " + error.message); return false; }
    setDrinkDetails((prev) => {
      if (!prev[drinkName]) return prev;
      return { ...prev, [drinkName]: { ...prev[drinkName], image: trimmedUrl } };
    });
    return true;
  };

  // 🗳️ [로직 6] 투표 등록 (upsert - 1인 1표)
  const handleVoteSubmit = async (newVote) => {
    const { error } = await supabase.from("votes").upsert({
      member_name: newVote.memberName, drink_name: newVote.drinkName,
      option: newVote.option, caffeine: newVote.caffeine,
    }, { onConflict: "member_name" });
    if (error) { alert("투표 중 오류: " + error.message); return; }
    setVotes((prev) => {
      const existingIdx = prev.findIndex((v) => v.memberName === newVote.memberName);
      if (existingIdx !== -1) { const updated = [...prev]; updated[existingIdx] = newVote; return updated; }
      return [...prev, newVote];
    });
  };

  // 🗑️ [로직 7] 개별 투표 취소
  const handleDeleteVote = async (memberName) => {
    const { error } = await supabase.from("votes").delete().eq("member_name", memberName);
    if (error) { alert("투표 취소 중 오류: " + error.message); return; }
    setVotes((prev) => prev.filter((v) => v.memberName !== memberName));
  };

  // 🔄 [로직 8] 전체 투표 리셋
  const handleResetAllVotes = async () => {
    const { error } = await supabase.from("votes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) { alert("리셋 중 오류: " + error.message); return; }
    setVotes([]);
    alert("🎉 오늘 하루의 음료 투표 대장이 깨끗하게 초기화(청소)되었습니다!");
  };

  // -----------------------------------------
  // 🔐 [비밀번호 확인 함수]
  // -----------------------------------------
  const ADMIN_PASSWORD = "janytree_admin";

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      // ✅ 비밀번호 일치 → 모달 닫고, 관리자 패널 열고, 해당 위치로 스크롤!
      setIsPasswordModalOpen(false);
      setIsAdminOpen(true);
      setPasswordInput("");
      setPasswordError(false);
      // 비밀번호 확인 후 관리자 패널로 부드럽게 스크롤
      // (패널이 렌더링될 시간을 잠깐 기다린 뒤 스크롤)
      setTimeout(() => {
        adminPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else {
      // ❌ 비밀번호 불일치 → 빨간 경고 + 입력값 초기화
      setPasswordError(true);
      setPasswordInput("");
    }
  };

  // -----------------------------------------
  // 🎭 [커스텀 마스킹 함수]
  //    첫 글자만 보이고 나머지는 ● 로 가리기
  // -----------------------------------------
  const getMaskedDisplay = (value) => {
    if (value.length === 0) return "";
    if (value.length === 1) return value;
    return value[0] + "●".repeat(value.length - 1);
  };

  // 정렬된 멤버 명단 준비
  const sortedMembers = sortMembers(members);

  // -----------------------------------------
  // ⏳ [로딩 화면]
  // -----------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl animate-bounce">☕</div>
          <p className="text-slate-600 font-bold text-sm">음료 메뉴를 불러오는 중...</p>
          <p className="text-slate-400 text-xs">Supabase DB에서 최신 데이터를 가져오고 있어요!</p>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // ❌ [오류 화면]
  // -----------------------------------------
  if (dbError) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm mx-auto px-4">
          <div className="text-5xl">🚨</div>
          <p className="text-red-600 font-bold text-sm">{dbError}</p>
          <button onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl">
            🔄 새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    /* 
      🔑 핵심 변경: 최상위 div를 "relative z-0"으로 유지하고
      모달은 document.body 바로 아래 fixed로 렌더링되어야 하므로
      모달을 최상위 div 밖에 배치하는 방식 대신,
      모달 z-index를 [9999]로 극도로 높여서 확실히 위에 뜨게 합니다.
    */
    <>
      {/* =========================================
          🔐 [비밀번호 모달] - 최상위에 렌더링하여 z-index 충돌 완전 차단
          비유: 건물 옥상에 올려놓은 안내판처럼, 모든 것 위에 떠 있습니다!
          ========================================= */}
      {isPasswordModalOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9999 }}
          className="flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => {
            setIsPasswordModalOpen(false);
            setPasswordInput("");
            setPasswordError(false);
          }}
        >
          {/* 모달 카드 - 바깥 클릭 이벤트 차단 */}
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 w-full max-w-sm mx-4"
            style={{ animation: "fadeSlideIn 0.2s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 자물쇠 아이콘 + 제목 */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl">🔐</span>
              </div>
              <h2 className="text-base font-black text-slate-900">관리자 인증</h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">관리자 비밀번호를 입력해 주세요.</p>
            </div>

            {/* 비밀번호 입력 폼 */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">

              {/* 
                💡 마스킹 입력창 원리:
                ┌─────────────────────────────────────────┐
                │ 보이는 div: "j●●●●●●●●●●●" 표시       │
                │ 투명 input: 실제로 키보드 입력 받는 곳  │ ← 위에 겹쳐있음
                └─────────────────────────────────────────┘
                실제 input은 투명하지만 존재하고, 그 값을 가공해서 div에 표시!
              */}
              <div className="relative">
                {/* 표시용 div (마스킹된 텍스트를 보여줌) */}
                <div className={`
                  w-full rounded-2xl px-4 py-3.5 text-sm font-mono font-bold
                  text-slate-800 tracking-[0.25em] min-h-[52px] flex items-center
                  border-2 transition-colors
                  ${passwordError
                    ? "border-red-400 bg-red-50"
                    : "border-slate-200 bg-slate-50 focus-within:border-slate-700 focus-within:bg-white"
                  }
                `}>
                  {passwordInput.length === 0 ? (
                    <span className="text-slate-300 font-sans font-normal tracking-normal text-xs">
                      비밀번호를 입력하세요...
                    </span>
                  ) : (
                    <span>{getMaskedDisplay(passwordInput)}</span>
                  )}
                </div>

                {/* 진짜 input (투명하게 위에 겹쳐서 타이핑만 받음) */}
                <input
                  type="text"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  onKeyDown={(e) => {
                    // Enter 키로도 제출 가능
                    if (e.key === "Enter") handlePasswordSubmit(e);
                  }}
                  autoFocus
                  autoComplete="new-password"
                  spellCheck="false"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "text",
                    border: "none",
                    background: "transparent",
                  }}
                  maxLength={30}
                />
              </div>

              {/* 오류 메시지 */}
              {passwordError && (
                <p className="text-xs text-red-500 font-bold text-center">
                  ❌ 비밀번호가 올바르지 않습니다. 다시 입력해 주세요.
                </p>
              )}

              {/* 확인 / 취소 버튼 */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordInput("");
                    setPasswordError(false);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-3 rounded-xl transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-sm"
                >
                  🔓 확인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          🔝 [위로 가기 버튼] - 오른쪽 하단 플로팅
          300px 이상 스크롤하면 나타남
          ========================================= */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ position: "fixed", bottom: "28px", right: "20px", zIndex: 999 }}
          className="w-11 h-11 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl"
          title="맨 위로 올라가기"
          aria-label="맨 위로 스크롤"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}

      {/* =========================================
          🏠 [메인 앱 화면]
          ========================================= */}
      <div className="min-h-screen w-full bg-slate-50 text-slate-800 antialiased relative">

        {/* ❄️ 눈송이 배경 */}
        <div className="absolute inset-0 snow-bg pointer-events-none z-0"></div>

        {/* 메인 레이아웃 */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-8">

          {/* 🔝 헤더 */}
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
                    음료 투표 &amp; 주문
                  </span>
                </h1>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  ☁️ Supabase 실시간 DB 연동 중 · 모든 직원이 동일한 데이터를 공유합니다!
                </p>
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isAdminOpen) {
                    // 이미 열려있으면 닫기
                    setIsAdminOpen(false);
                  } else {
                    // 닫혀있으면 비밀번호 모달 열기
                    setPasswordInput("");
                    setPasswordError(false);
                    setIsPasswordModalOpen(true);
                  }
                }}
                className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all shadow-sm ${
                  isAdminOpen
                    ? "bg-slate-800 text-white border-slate-800 hover:bg-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {isAdminOpen ? "⚙️ 관리 설정 닫기" : "🔒 관리 설정 열기"}
              </button>

              <button
                onClick={handleResetAllVotes}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1"
              >
                🔄 전체 리셋
              </button>
            </div>
          </header>

          {/* 📦 메인 2단 보드 */}
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* 👈 좌측: 메뉴판 */}
            <section className="lg:col-span-5 h-full">
              <VisualMenu drinks={drinks} drinkDetails={drinkDetails} />
            </section>

            {/* 👉 우측: 투표 폼 + 집계 + 미투표자 */}
            <section className="lg:col-span-7 space-y-8">
              <VoteForm
                members={sortedMembers} drinks={drinks}
                drinkDetails={drinkDetails} votes={votes}
                onVoteSubmit={handleVoteSubmit}
              />
              <OrderSummary
                votes={votes} drinkDetails={drinkDetails}
                onDeleteVote={handleDeleteVote}
              />
              <UnvotedList members={sortedMembers} votes={votes} />
            </section>
          </main>

          {/* 🔧 관리자 패널 (비밀번호 인증 후 열림) */}
          {isAdminOpen && (
            <footer className="mt-8" ref={adminPanelRef}>
              <AdminPanel
                members={sortedMembers} drinks={drinks}
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

      {/* 모달 애니메이션 스타일 */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: scale(0.93) translateY(-10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </>
  );
}
