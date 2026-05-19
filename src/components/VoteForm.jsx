import React, { useState, useEffect } from "react";

// 초보자 가이드: VoteForm은 직원이 성함을 고르고, 음료, 온도, 카페인을 고르는 스마트 폼입니다.
// 부모로부터 drinkDetails 동적 상태 프로퍼티를 주입받아 신메뉴도 실시간으로 조건부 락을 걸게 구현했습니다!
export default function VoteForm({ 
  members, 
  drinks, 
  drinkDetails, 
  votes, 
  onVoteSubmit 
}) {
  // -----------------------------------------
  // 💾 [상태 정의] 드롭다운에서 선택된 값 보관함
  // -----------------------------------------
  const [selectedName, setSelectedName] = useState("");
  const [selectedDrink, setSelectedDrink] = useState("");
  const [selectedOption, setSelectedOption] = useState("ICE"); // ICE, HOT
  const [selectedCaffeine, setSelectedCaffeine] = useState("해당없음"); // 레귤러, 디카페인, 해당없음
  const [customDrinkName, setCustomDrinkName] = useState(""); // 직접입력 시 기재란

  // -----------------------------------------
  // 🔄 [동적 조건부 연쇄 제약 로직]
  // ➔ 직원이 '음료 종류'를 고를 때마다, 메타 데이터 속성을 검사해 연쇄적으로 옵션을 강제 락(Lock)합니다!
  // -----------------------------------------
  useEffect(() => {
    if (!selectedDrink) return;

    // 부모로부터 주입된 동적 상태 맵(drinkDetails)에서 고른 음료 정보를 찾습니다.
    const details = drinkDetails[selectedDrink] || { 
      iceOnly: false, 
      hasCaffeine: false 
    };

    // 1. [ICE ONLY 락 규칙]
    // 딸기라떼, 프라페 종류 또는 사장님이 어드민에서 'ICE 전용' 체크해 추가한 음료일 경우 온도를 ICE로 강제 잠금!
    if (details.iceOnly) {
      setSelectedOption("ICE");
    }

    // 2. [카페인 옵션 락 규칙]
    // 아메리카노, 카페라떼 또는 사장님이 어드민에서 '커피 계열' 체크해 추가한 음료일 때만 카페인 활성화!
    if (details.hasCaffeine) {
      // 커피 계열이면 기본값 "레귤러"로 켜주기
      setSelectedCaffeine("레귤러");
    } else {
      // 그 외 음료는 카페인 드롭다운 강제 잠금 및 해당없음 고정!
      setSelectedCaffeine("해당없음");
    }
  }, [selectedDrink, drinkDetails]);

  // -----------------------------------------
  // 🗳️ [투표하기] 제출 버튼 클릭 핸들러
  // -----------------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();

    // 필수 유효성 검사 
    if (!selectedName) {
      alert("성함을 선택해 주세요!");
      return;
    }
    if (!selectedDrink) {
      alert("마실 음료를 선택해 주세요!");
      return;
    }

    // 직접입력 검증
    let finalDrinkName = selectedDrink;
    if (selectedDrink === "직접입력") {
      const trimmedCustom = customDrinkName.trim();
      if (!trimmedCustom) {
        alert("원하시는 음료 이름을 직접 타이핑해서 적어주세요!");
        return;
      }
      finalDrinkName = `✏️ ${trimmedCustom}`;
    }

    // 1인 1표 보증을 위한 덮어쓰기 안내
    const alreadyVoted = votes.find((v) => v.memberName === selectedName);
    if (alreadyVoted) {
      const confirmOverwrite = window.confirm(
        `⚠️ ${selectedName}님은 이미 투표하셨습니다!\n선택하신 내용으로 수정(덮어쓰기)하시겠습니까?`
      );
      if (!confirmOverwrite) return;
    }

    // 부모 컨트롤 타워에 표(vote) 제출
    onVoteSubmit({
      memberName: selectedName,
      drinkName: finalDrinkName,
      option: selectedOption,
      caffeine: selectedCaffeine
    });

    // 성공 안내 및 폼 초기화 (성함은 여러 명 투표 편하라고 그대로 두고 음료만 비웁니다)
    alert("🎉 투표가 정상적으로 완료/수정되었습니다!");
    setSelectedDrink("");
    setCustomDrinkName("");
  };

  // 선택된 음료의 메타 세부 데이터 찾기
  const currentDetails = drinkDetails[selectedDrink] || { 
    iceOnly: false, 
    hasCaffeine: false 
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-md relative overflow-hidden select-none">
      
      {/* 폼 상단 라벨 장식 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
          <span>🍵</span> 음료 주문 받습니다. 선택해주세요. 🥤
        </h3>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
      </div>

      {/* 실시간 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* =========================================
            🌸 1단계: 성함 고르기
            ========================================= */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <span>🌸</span> 성함
          </label>
          <select
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="">성함을 골라주세요</option>
            {members.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* =========================================
            ☕ 2단계: 음료 종류 고르기
            ========================================= */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <span>☕</span> 음료 종류
          </label>
          <select
            value={selectedDrink}
            onChange={(e) => setSelectedDrink(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="">마실 음료를 선택하세요</option>
            {drinks.map((drinkName) => {
              const details = drinkDetails[drinkName] || { emoji: "🥤" };
              return (
                <option key={drinkName} value={drinkName}>
                  {details.emoji} {drinkName}
                </option>
              );
            })}
          </select>
        </div>

        {/* ✏️ 직접입력 텍스트 필드 활성화 상자 (그라데이션 효과) */}
        {selectedDrink === "직접입력" && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200/60 space-y-1.5 animate-fadeIn">
            <label className="text-[10px] font-bold text-amber-800">
              ✍️ 리얼 신상 메뉴 수동 직접 기재
            </label>
            <input
              type="text"
              value={customDrinkName}
              onChange={(e) => setCustomDrinkName(e.target.value)}
              placeholder="예: 자몽에이드, 유자차 등 기재"
              className="w-full bg-white border border-amber-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              maxLength={15}
            />
          </div>
        )}

        {/* =========================================
            🧊 3단계: 온도 옵션 고르기 (ICE Only 락 작동)
            ========================================= */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <span>🧊</span> 옵션
            </label>
            {currentDetails.iceOnly && (
              <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                🔒 이 음료는 ICE 고정입니다! (HOT 선택불가)
              </span>
            )}
          </div>
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            disabled={currentDetails.iceOnly} // 🔒 조건부 비활성화!
            className={`w-full border rounded-2xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
              currentDetails.iceOnly
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-slate-50 text-slate-700 border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            }`}
          >
            <option value="ICE">❄️ ICE</option>
            <option value="HOT">🔥 HOT</option>
          </select>
        </div>

        {/* =========================================
            ☕ 4단계: 카페인 옵션 고르기 (커피 계열 외 락 작동)
            ========================================= */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <span>☕</span> 카페인
            </label>
            {!currentDetails.hasCaffeine && selectedDrink && (
              <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                🔒 커피 메뉴에만 옵션 활성화
              </span>
            )}
          </div>
          <select
            value={selectedCaffeine}
            onChange={(e) => setSelectedCaffeine(e.target.value)}
            disabled={!currentDetails.hasCaffeine} // 🔒 조건부 비활성화!
            className={`w-full border rounded-2xl px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
              !currentDetails.hasCaffeine
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-slate-50 text-slate-700 border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            }`}
          >
            {!currentDetails.hasCaffeine ? (
              <option value="해당없음">🥛 해당없음 (non 커피 메뉴)</option>
            ) : (
              <>
                <option value="레귤러">☕ 레귤러 (카페인 샷)</option>
                <option value="디카페인">🌿 디카페인 (카페인 프리)</option>
              </>
            )}
          </select>
        </div>

        {/* =========================================
            🚀 최종 투표 전송 버튼
            ========================================= */}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 tracking-wider flex items-center justify-center gap-1.5 mt-2"
        >
          <span>🗳️</span> 투표하기
        </button>

      </form>
    </div>
  );
}
