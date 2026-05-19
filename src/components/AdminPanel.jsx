import React, { useState } from "react";

// 초보자 가이드: AdminPanel은 화면 하단에서 열리는 관리 보드입니다.
// 사장님이 사진이 마음에 안 드는 경우, 각 음료 행 옆에 위치한 [🖼️ 사진변경] 버튼을 클릭해 
// 새 웹 이미지 주소(URL)를 복사+붙여넣기하여 즉석 갈아끼우기할 수 있는 동적 에디터를 탑재했습니다!
export default function AdminPanel({
  members,
  drinks,
  onAddMember,
  onDeleteMember,
  onAddDrink,
  onDeleteDrink,
  onUpdateDrinkImage // ⭐ 부모로부터 내려받은 이미지 갱신 함수
}) {
  // -----------------------------------------
  // 💾 [상태 정의] 텍스트 입력창 및 체크박스 임시 저장소
  // -----------------------------------------
  const [newMemberInput, setNewMemberInput] = useState("");
  const [newDrinkInput, setNewDrinkInput] = useState("");
  const [isCoffee, setIsCoffee] = useState(false);
  const [isIceOnly, setIsIceOnly] = useState(false);

  // ⭐ [사진변경 토글 관리] 현재 어떤 음료의 사진 편집창을 열어두었는지 보관 (null이면 닫힘)
  const [editingDrinkName, setEditingDrinkName] = useState(null);
  const [newImageUrlInput, setNewImageUrlInput] = useState("");

  // 👤 멤버 추가 이벤트 핸들러
  const handleMemberSubmit = (e) => {
    e.preventDefault();
    const isSuccess = onAddMember(newMemberInput);
    if (isSuccess) {
      setNewMemberInput("");
    }
  };

  // 🍹 음료 추가 이벤트 핸들러
  const handleDrinkSubmit = (e) => {
    e.preventDefault();
    const isSuccess = onAddDrink(newDrinkInput, isCoffee, isIceOnly);
    if (isSuccess) {
      setNewDrinkInput("");
      setIsCoffee(false);
      setIsIceOnly(false);
    }
  };

  // 🖼️ 사진 주소 갱신 적용 버튼 클릭 핸들러
  const handleUpdateImageSubmit = (drinkName) => {
    const isSuccess = onUpdateDrinkImage(drinkName, newImageUrlInput);
    if (isSuccess) {
      setNewImageUrlInput("");
      setEditingDrinkName(null); // 입력 상자 닫기
    }
  };

  return (
    <div className="bg-slate-100/90 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-slate-200 shadow-inner select-none animate-fadeIn">
      
      {/* 어드민 대제목 */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
        <span className="text-xl">⚙️</span>
        <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
          제니트리 관리자 설정
        </h3>
        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          ☁️ 실시간 DB 동기화
        </span>
      </div>

      {/* 2열 레이아웃 분할 (멤버 vs 음료) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* =========================================
            👤 [왼쪽 컬럼] 멤버 목록 관리 (한글 오름차순 + Guest 꼴찌 보장)
            ========================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-700 flex items-center gap-1.5">
              <span>👤</span> 멤버 목록 관리 ({members.length}명)
            </h4>
            <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              가나다순 & Guest 최하단 고정 정렬 중
            </span>
          </div>

          {/* 멤버 신규 등록 폼 */}
          <form onSubmit={handleMemberSubmit} className="flex gap-2">
            <input
              type="text"
              value={newMemberInput}
              onChange={(e) => setNewMemberInput(e.target.value)}
              placeholder="추가할 직원 성함 입력"
              className="flex-grow bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
              maxLength={8}
            />
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all whitespace-nowrap"
            >
              추가 👤
            </button>
          </form>

          {/* 등록된 멤버 목록 보드 */}
          <div className="max-h-72 overflow-y-auto bg-white rounded-2xl border border-slate-200 p-3 space-y-1.5 scrollbar-thin">
            {members.map((name) => (
              <div
                key={name}
                className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors animate-fadeIn"
              >
                <span className="text-xs font-bold text-slate-700">{name}</span>
                
                {/* 즉각 삭제 버튼 */}
                <button
                  type="button"
                  onClick={() => onDeleteMember(name)}
                  className="w-5 h-5 bg-white text-slate-400 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center text-[10px] font-extrabold border border-slate-200 hover:border-red-500 transition-all"
                  title="멤버 제거"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================
            🍹 [오른쪽 컬럼] 음료 메뉴 관리 (사진 교체 에디터 탑재!)
            ========================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-700 flex items-center gap-1.5">
              <span>🍹</span> 음료 메뉴판 관리 ({drinks.length}종)
            </h4>
          </div>

          {/* 신규 음료 등록 폼 */}
          <form onSubmit={handleDrinkSubmit} className="space-y-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-200/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={newDrinkInput}
                onChange={(e) => setNewDrinkInput(e.target.value)}
                placeholder="추가할 신상 음료 이름 입력"
                className="flex-grow bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                maxLength={12}
              />
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all whitespace-nowrap"
              >
                추가 🍹
              </button>
            </div>

            {/* 세부 옵션 체크박스 */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 px-1 pt-1 justify-start">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={isCoffee}
                  onChange={(e) => setIsCoffee(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-[10px] font-black text-slate-600 group-hover:text-indigo-600 transition-colors">
                  ☕ 커피 계열 (카페인 활성화)
                </span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={isIceOnly}
                  onChange={(e) => setIsIceOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-[10px] font-black text-slate-600 group-hover:text-blue-600 transition-colors">
                  🧊 ICE 전용 (HOT 선택불가)
                </span>
              </label>
            </div>
          </form>

          {/* 등록된 음료 목록 보드 (🖼️ 사진변경 기능 퓨전 장착!) */}
          <div className="max-h-[300px] overflow-y-auto bg-white rounded-2xl border border-slate-200 p-3 space-y-2.5 scrollbar-thin">
            {drinks.map((drinkName) => {
              const isEditing = editingDrinkName === drinkName;

              return (
                <div
                  key={drinkName}
                  className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200/80 transition-all space-y-2.5 animate-fadeIn"
                >
                  {/* 상단: 음료 명칭 및 변경/삭제 액션 단추들 */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{drinkName}</span>
                    
                    <div className="flex items-center gap-1.5">
                      {/* 🖼️ [사진변경 토글 단추] (직접입력 제외하고 누구나 가능!) */}
                      {drinkName !== "직접입력" && (
                        <button
                          type="button"
                          onClick={() => {
                            if (isEditing) {
                              setEditingDrinkName(null);
                            } else {
                              setEditingDrinkName(drinkName);
                              setNewImageUrlInput(""); // 폼 청소
                            }
                          }}
                          className={`text-[9px] font-black px-2 py-1 rounded-lg border transition-all ${
                            isEditing 
                              ? "bg-slate-800 text-white border-slate-800" 
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {isEditing ? "닫기 ✕" : "🖼️ 사진변경"}
                        </button>
                      )}

                      {/* 단종 제거 단추 */}
                      {drinkName !== "직접입력" ? (
                        <button
                          type="button"
                          onClick={() => onDeleteDrink(drinkName)}
                          className="w-5 h-5 bg-white text-slate-400 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center text-[10px] font-extrabold border border-slate-200 hover:border-red-500 transition-all"
                          title="음료 제거"
                        >
                          ✕
                        </button>
                      ) : (
                        <span className="text-[8px] font-bold text-slate-400 bg-slate-200/80 px-1.5 py-0.5 rounded border border-slate-200">
                          필수
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 🖼️ [슬라이딩 사진 주소 입력 패널] (사진변경 단추 누를 때 뿅 생성!) */}
                  {isEditing && (
                    <div className="bg-white p-3 rounded-lg border border-slate-200/80 space-y-2 animate-slideDown">
                      <label className="text-[9px] font-extrabold text-slate-500 block">
                        🔗 새로운 이미지 인터넷 주소(URL) 입력
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="url"
                          value={newImageUrlInput}
                          onChange={(e) => setNewImageUrlInput(e.target.value)}
                          placeholder="인터넷 사진 주소(https://...) 붙여넣기"
                          className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateImageSubmit(drinkName)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9px] px-3 py-1.5 rounded-lg shadow-sm transition-colors whitespace-nowrap"
                        >
                          적용 🖼️
                        </button>
                      </div>
                      <p className="text-[8px] text-slate-400 leading-tight">
                        * Unsplash 또는 포털 사이트 이미지 위에서 마우스 우클릭 후 <strong>'이미지 주소 복사'</strong>를 눌러 여기에 붙여넣으시면 실시간으로 즉석 교체됩니다!
                      </p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 보안 알림 안내 가이드 */}
      <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-[10px] text-emerald-800 leading-relaxed font-medium">
        <strong>☁️ Supabase 실시간 DB 안내:</strong> 관리자가 음료를 추가/수정/삭제하면 <em>즉시 Supabase 데이터베이스에 반영</em>됩니다. 새로고침 없이도 모든 직원의 화면에 동일한 최신 데이터가 공유됩니다!
      </div>

    </div>
  );
}
