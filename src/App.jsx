import React, { useState, useEffect, useCallback } from "react";
import { 
  INITIAL_MEMBERS, 
  INITIAL_DRINKS, 
  DRINK_DETAILS 
} from "./data/defaultData";
import { supabase } from "./lib/supabaseClient"; // ✅ Supabase 연결 모듈 불러오기
import VisualMenu from "./components/VisualMenu";
import VoteForm from "./components/VoteForm";
import OrderSummary from "./components/OrderSummary";
import UnvotedList from "./components/UnvotedList";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  // -----------------------------------------
  // 💾 [상태 정의] 화면에서 사용할 데이터들 (이제 DB에서 불러옵니다!)
  // -----------------------------------------
  const [members, setMembers]           = useState([]);     // 직원 목록
  const [drinks, setDrinks]             = useState([]);     // 음료 이름 목록 (배열)
  const [drinkDetails, setDrinkDetails] = useState({});    // 음료 상세 정보 (이모지, 사진 등)
  const [votes, setVotes]               = useState([]);     // 투표 내역
  const [isAdminOpen, setIsAdminOpen]   = useState(false); // 관리자 패널 열림/닫힘

  // -----------------------------------------
  // 🔐 [관리자 비밀번호 모달] 상태 정의
  // -----------------------------------------
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // 비밀번호 입력창 열림/닫힘
  const [passwordInput, setPasswordInput]             = useState("");    // 사용자가 입력 중인 비밀번호 (실제 값)
  const [passwordError, setPasswordError]             = useState(false); // 비밀번호 틀렸을 때 빨간 경고 표시
  const [isLoading, setIsLoading]       = useState(true);  // 📡 DB 데이터 불러오는 중 상태
  const [dbError, setDbError]           = useState(null);  // ❌ DB 오류 메시지

  // -----------------------------------------
  // 🔄 [DB 데이터 가공 함수] drinks 테이블에서 받은 데이터를
  //    기존 컴포넌트가 원하는 형태(drinks 배열 + drinkDetails 객체)로 변환
  // -----------------------------------------
const processDrinksData = useCallback((drinksData) => {
    // 1. 음료 이름만 뽑아서 가나다순으로 똑똑하게 정렬하기
    const drinkNames = drinksData.map((d) => d.name).sort((a, b) => {
      if (a === "직접입력") return 1;  // '직접입력'은 무조건 맨 아래로!
      if (b === "직접입력") return -1;
      return a.localeCompare(b, "ko"); // 나머지는 완벽한 가나다순 정렬
    });

    // 2. 각 음료의 상세 정보를 { 이름: {emoji, image, iceOnly, hasCaffeine} } 형태로 변환
    const details = {};
    drinksData.forEach((d) => {
      details[d.name] = {
        emoji:       d.emoji,
        image:       d.image,
        iceOnly:     d.ice_only,       // DB의 ice_only → JS의 iceOnly (낙타표기법)
        hasCaffeine: d.has_caffeine,   // DB의 has_caffeine → JS의 hasCaffeine
      };
    });

    setDrinks(drinkNames);
    setDrinkDetails(details);
  }, []);

  // -----------------------------------------
  // 🌱 [초기 데이터 심기] DB가 비어있을 때, defaultData.js의 기본값으로 채우기
  // ✅ upsert 방식: 이미 같은 이름이 있으면 건너뛰므로 중복이 절대 발생하지 않습니다!
  // -----------------------------------------
  const seedInitialDrinks = useCallback(async () => {
    // INITIAL_DRINKS 배열을 DB에 넣을 수 있는 형태로 변환
    const drinksToInsert = INITIAL_DRINKS.map((name, index) => ({
      name,
      emoji:        DRINK_DETAILS[name]?.emoji       || "🥤",
      image:        DRINK_DETAILS[name]?.image       || "",
      ice_only:     DRINK_DETAILS[name]?.iceOnly     || false,
      has_caffeine: DRINK_DETAILS[name]?.hasCaffeine || false,
      sort_order:   index, // 기존 순서 그대로 유지
    }));

    // upsert: name이 이미 있으면 UPDATE(무시), 없으면 INSERT
    const { error } = await supabase
      .from("drinks")
      .upsert(drinksToInsert, { onConflict: "name", ignoreDuplicates: true });
    if (error) console.error("🌱 초기 음료 데이터 삽입 오류:", error.message);
  }, []);

  const seedInitialMembers = useCallback(async () => {
    const membersToInsert = INITIAL_MEMBERS.map((name) => ({ name }));
    // upsert: name이 이미 있으면 무시, 없으면 INSERT
    const { error } = await supabase
      .from("members")
      .upsert(membersToInsert, { onConflict: "name", ignoreDuplicates: true });
    if (error) console.error("🌱 초기 멤버 데이터 삽입 오류:", error.message);
  }, []);

  // -----------------------------------------
  // 📡 [앱 시작 시 DB에서 모든 데이터 불러오기]
  //    비유: 사이트가 켜질 때 DB 창고에서 선반에 올려놓는 작업
  // -----------------------------------------
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        setDbError(null);

        // --- 1. 음료 목록 불러오기 ---
        const { data: drinksData, error: drinksError } = await supabase
          .from("drinks")
          .select("*")
          .order("sort_order", { ascending: true }); // sort_order 순서대로

        if (drinksError) throw drinksError;

        if (!drinksData || drinksData.length === 0) {
          // DB가 비어있으면 기본 데이터 심고 다시 불러오기
          await seedInitialDrinks();
          const { data: seeded } = await supabase
            .from("drinks").select("*").order("sort_order", { ascending: true });
          processDrinksData(seeded || []);
        } else {
          processDrinksData(drinksData);
        }

        // --- 2. 멤버 목록 불러오기 ---
        const { data: membersData, error: membersError } = await supabase
          .from("members")
          .select("*")
          .order("name", { ascending: true }); // 가나다 순

        if (membersError) throw membersError;

        if (!membersData || membersData.length === 0) {
          await seedInitialMembers();
          const { data: seededMembers } = await supabase
            .from("members").select("*").order("name", { ascending: true });
          setMembers(seededMembers?.map((m) => m.name) || []);
        } else {
          setMembers(membersData.map((m) => m.name));
        }

        // --- 3. 투표 내역 불러오기 ---
        const { data: votesData, error: votesError } = await supabase
          .from("votes")
          .select("*");

        if (votesError) throw votesError;

        // DB의 snake_case 컬럼명을 JS의 camelCase로 변환
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
      if (aIsGuest && bIsGuest) {
        return a.localeCompare(b, undefined, { numeric: true });
      }
      return a.localeCompare(b, "ko");
    });
  };

  // -----------------------------------------
  // ➕ [로직 1] 신규 멤버 추가 → DB에 저장
  // -----------------------------------------
  const handleAddMember = async (newMemberName) => {
    const trimmed = newMemberName.trim();
    if (!trimmed) { alert("직원 이름을 정확히 적어주세요!"); return false; }
    if (members.includes(trimmed)) { alert("이미 가입되어 있는 동일한 성함이 존재합니다!"); return false; }

    // DB에 새 멤버 삽입
    const { error } = await supabase.from("members").insert({ name: trimmed });
    if (error) { alert("멤버 추가 중 오류가 발생했습니다: " + error.message); return false; }

    // 화면 상태 업데이트 (DB 성공 후 로컬 상태 반영)
    setMembers((prev) => [...prev, trimmed]);
    return true;
  };

  // -----------------------------------------
  // ❌ [로직 2] 멤버 삭제 → DB에서 삭제
  // -----------------------------------------
  const handleDeleteMember = async (nameToDelete) => {
    const { error } = await supabase.from("members").delete().eq("name", nameToDelete);
    if (error) { alert("멤버 삭제 중 오류: " + error.message); return; }

    setMembers((prev) => prev.filter((m) => m !== nameToDelete));
    // 해당 멤버의 투표도 함께 삭제
    await supabase.from("votes").delete().eq("member_name", nameToDelete);
    setVotes((prev) => prev.filter((v) => v.memberName !== nameToDelete));
  };

  // -----------------------------------------
  // ➕ [로직 3] 신메뉴 추가 → DB에 저장
  // -----------------------------------------
  const handleAddDrink = async (newDrinkName, hasCaffeine, iceOnly) => {
    const trimmed = newDrinkName.trim();
    if (!trimmed) { alert("음료 종류 명칭을 적어주세요!"); return false; }
    if (drinks.includes(trimmed)) { alert("이미 판에 기재되어 있는 음료입니다!"); return false; }

    // "직접입력" 바로 앞 순서 계산
    const directIndex = drinks.indexOf("직접입력");
    const newOrder = directIndex !== -1 ? directIndex : drinks.length;

    // DB에 새 음료 삽입
    const { error } = await supabase.from("drinks").insert({
      name:         trimmed,
      emoji:        hasCaffeine ? "☕" : "🍹",
      image:        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80",
      ice_only:     iceOnly,
      has_caffeine: hasCaffeine,
      sort_order:   newOrder,
    });
    if (error) { alert("음료 추가 중 오류: " + error.message); return false; }

    // 직접입력의 sort_order를 newOrder+1로 밀어내기 (순서 유지)
    if (directIndex !== -1) {
      await supabase.from("drinks")
        .update({ sort_order: newOrder + 1 })
        .eq("name", "직접입력");
    }

    // 화면 상태 업데이트 (DB 성공 후 로컬 반영)
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

  // -----------------------------------------
  // ❌ [로직 4] 음료 삭제 → DB에서 삭제
  // -----------------------------------------
  const handleDeleteDrink = async (drinkToDelete) => {
    if (drinkToDelete === "직접입력") {
      alert("직접입력 옵션은 투표의 필수 요소이므로 지울 수 없습니다!");
      return;
    }

    const { error } = await supabase.from("drinks").delete().eq("name", drinkToDelete);
    if (error) { alert("음료 삭제 중 오류: " + error.message); return; }

    setDrinks((prev) => prev.filter((d) => d !== drinkToDelete));
    setDrinkDetails((prev) => { const next = { ...prev }; delete next[drinkToDelete]; return next; });
    // 해당 음료 투표도 함께 제거
    await supabase.from("votes").delete().eq("drink_name", drinkToDelete);
    setVotes((prev) => prev.filter((v) => v.drinkName !== drinkToDelete));
  };

  // -----------------------------------------
  // 🖼️ [로직 5] 음료 이미지 URL 변경 → DB 업데이트
  // -----------------------------------------
  const handleUpdateDrinkImage = async (drinkName, newImageUrl) => {
    const trimmedUrl = newImageUrl.trim();
    if (!trimmedUrl) { alert("변경할 새로운 이미지 주소(URL)를 입력해 주세요!"); return false; }

    const { error } = await supabase
      .from("drinks")
      .update({ image: trimmedUrl })
      .eq("name", drinkName);
    if (error) { alert("이미지 변경 중 오류: " + error.message); return false; }

    setDrinkDetails((prev) => {
      if (!prev[drinkName]) return prev;
      return { ...prev, [drinkName]: { ...prev[drinkName], image: trimmedUrl } };
    });
    return true;
  };

  // -----------------------------------------
  // 🗳️ [로직 6] 투표 등록 (1인 1표 보증 - upsert 사용)
  //    upsert = 없으면 INSERT, 있으면 UPDATE! (중복 자동 처리)
  // -----------------------------------------
  const handleVoteSubmit = async (newVote) => {
    const { error } = await supabase.from("votes").upsert({
      member_name: newVote.memberName,
      drink_name:  newVote.drinkName,
      option:      newVote.option,
      caffeine:    newVote.caffeine,
    }, {
      onConflict: "member_name" // member_name이 같으면 UPDATE로 처리
    });
    if (error) { alert("투표 중 오류: " + error.message); return; }

    // 로컬 상태 업데이트 (1인 1표 덮어쓰기)
    setVotes((prev) => {
      const existingIdx = prev.findIndex((v) => v.memberName === newVote.memberName);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = newVote;
        return updated;
      }
      return [...prev, newVote];
    });
  };

  // -----------------------------------------
  // 🗑️ [로직 7] 개별 투표 취소 → DB에서 삭제
  // -----------------------------------------
  const handleDeleteVote = async (memberName) => {
    const { error } = await supabase.from("votes").delete().eq("member_name", memberName);
    if (error) { alert("투표 취소 중 오류: " + error.message); return; }
    setVotes((prev) => prev.filter((v) => v.memberName !== memberName));
  };

  // -----------------------------------------
  // 🔄 [로직 8] 전체 투표 리셋 → DB에서 모두 삭제
  // -----------------------------------------
  const handleResetAllVotes = async () => {
    const { error } = await supabase.from("votes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) { alert("리셋 중 오류: " + error.message); return; }
    setVotes([]);
    alert("🎉 오늘 하루의 음료 투표 대장이 깨끗하게 초기화(청소)되었습니다!");
  };

  // 정렬된 멤버 명단 준비
  const sortedMembers = sortMembers(members);

  // -----------------------------------------
  // ⏳ [로딩 화면] DB에서 데이터를 가져오는 동안 보여주는 화면
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
  // ❌ [오류 화면] DB 연결에 실패했을 때 보여주는 화면
  // -----------------------------------------
  if (dbError) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm mx-auto px-4">
          <div className="text-5xl">🚨</div>
          <p className="text-red-600 font-bold text-sm">{dbError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl"
          >
            🔄 새로고침
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // 🔐 [비밀번호 확인 함수]
  //    비유: 관리자실 문에 붙어있는 잠금장치!
  //    맞는 열쇠(비밀번호)를 넣으면 열리고, 틀리면 경보음(경고 메시지)
  // -----------------------------------------
  const ADMIN_PASSWORD = "janytree_admin"; // 관리자 비밀번호 (실제 서비스에선 환경변수로 관리 권장)

  const handlePasswordSubmit = (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
    if (passwordInput === ADMIN_PASSWORD) {
      // ✅ 비밀번호 일치 → 모달 닫고, 관리자 패널 열기!
      setIsPasswordModalOpen(false);
      setIsAdminOpen(true);
      setPasswordInput(""); // 보안: 입력값 즉시 초기화
      setPasswordError(false);
    } else {
      // ❌ 비밀번호 불일치 → 빨간 경고 표시
      setPasswordError(true);
      setPasswordInput(""); // 틀렸으니 입력값 초기화해서 다시 입력하게
    }
  };

  // -----------------------------------------
  // 🎭 [커스텀 마스킹 표시 함수]
  //    비유: 타이핑하는 내용을 첫 글자빼고 나머지는 점(●)으로 가리는 효과!
  //    실제 저장된 값(passwordInput)은 그대로 있고, 화면에 보이는 것만 가립니다.
  // -----------------------------------------
  const getMaskedDisplay = (value) => {
    if (value.length === 0) return "";           // 아무것도 안 쳤으면 빈 값
    if (value.length === 1) return value;        // 딱 1글자면 그대로 보여주기
    return value[0] + "●".repeat(value.length - 1); // 첫 글자 + 나머지는 ●●●
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 antialiased relative">
      
      {/* ❄️ 눈송이 글로벌 배경 레이어 */}
      <div className="absolute inset-0 snow-bg pointer-events-none z-0"></div>

      {/* =========================================
          🔐 [비밀번호 입력 모달] 관리자 인증 팝업창
          - 어두운 반투명 뒷배경 + 가운데 흰색 카드 형태
          - 모달 바깥쪽 클릭하면 자동으로 닫힘
          ========================================= */}
      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => {
            // 모달 바깥 어두운 영역 클릭 시 닫기
            setIsPasswordModalOpen(false);
            setPasswordInput("");
            setPasswordError(false);
          }}
        >
          {/* 모달 카드 본체 (클릭 이벤트 전파 차단 - 카드 안 클릭해도 닫히지 않게) */}
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 w-full max-w-sm mx-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 자물쇠 아이콘 + 제목 */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl">🔐</span>
              </div>
              <h2 className="text-base font-black text-slate-900">관리자 인증</h2>
              <p className="text-xs text-slate-500 mt-1">관리자 비밀번호를 입력해 주세요.</p>
            </div>

            {/* 비밀번호 입력 폼 */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="relative">
                {/* 
                  💡 핵심 마스킹 트릭 설명:
                  - 실제 input은 투명(opacity-0)하게 깔아두고, 실제 타이핑은 여기서 받습니다.
                  - 그 위에 보여주는 div에는 getMaskedDisplay()로 가공된 텍스트를 표시합니다.
                  - 이렇게 하면 "첫 글자만 보이고 나머지는 ●"인 효과를 만들 수 있어요!
                */}
                {/* 보여주는 가짜 입력창 (실제 타이핑 X, 마스킹된 텍스트만 표시) */}
                <div
                  className={`w-full bg-slate-50 border-2 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-slate-800 tracking-widest min-h-[48px] flex items-center ${
                    passwordError
                      ? "border-red-400 bg-red-50"
                      : "border-slate-200 focus-within:border-slate-800"
                  }`}
                >
                  {passwordInput.length === 0 ? (
                    <span className="text-slate-300 font-sans font-normal tracking-normal text-xs">비밀번호 입력...</span>
                  ) : (
                    <span>{getMaskedDisplay(passwordInput)}</span>
                  )}
                </div>

                {/* 실제 입력을 받는 진짜 input (투명하게 위에 겹쳐있음) */}
                <input
                  type="text"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false); // 타이핑 시작하면 빨간 경고 해제
                  }}
                  autoFocus
                  autoComplete="off"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-text"
                  maxLength={30}
                />
              </div>

              {/* 비밀번호 오류 경고 메시지 */}
              {passwordError && (
                <p className="text-xs text-red-500 font-bold text-center animate-fadeIn">
                  ❌ 비밀번호가 올바르지 않습니다. 다시 입력해 주세요.
                </p>
              )}

              {/* 확인 / 취소 버튼 */}
              <div className="flex gap-2 pt-2">
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
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm"
                >
                  🔓 확인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  음료 투표 &amp; 주문
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                ☁️ Supabase 실시간 DB 연동 중 · 모든 직원이 동일한 데이터를 공유합니다!
              </p>
            </div>
          </div>

          {/* 우측 관리용 설정 토글 버튼 및 리셋 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isAdminOpen) {
                  // 이미 열려있으면 그냥 닫기 (비밀번호 재확인 불필요)
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

        {/* =========================================
            📦 [2단계] 메인 2단 구조 보드
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
            
            <VoteForm 
              members={sortedMembers} 
              drinks={drinks} 
              drinkDetails={drinkDetails}
              votes={votes}
              onVoteSubmit={handleVoteSubmit}
            />

            <OrderSummary 
              votes={votes} 
              drinkDetails={drinkDetails}
              onDeleteVote={handleDeleteVote}
            />

            <UnvotedList 
              members={sortedMembers} 
              votes={votes} 
            />

          </section>
        </main>

        {/* =========================================
            🔧 [3단계] 토글형 어드민 관리 설정 패널
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
