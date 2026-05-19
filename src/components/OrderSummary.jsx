import React, { useState } from "react";

// 초보자 가이드: OrderSummary는 팀원들이 넣은 모든 주문서들을 분석해서 
// [음료+온도+옵션]이 100% 같은 주문들을 한 묶음으로 뭉쳐 총 개수를 보여주는 "자동 집계기"입니다!
// 각각의 주문 카드를 누르면 아래로 투표한 사람들의 실명이 스르륵 나타나는 아코디언 UX가 포함되어 있습니다.
export default function OrderSummary({ votes, drinkDetails, onDeleteVote }) {
  
  // 아코디언이 열린 주문 묶음 키(Group Key) 보관용 상태
  const [expandedGroupId, setExpandedGroupId] = useState(null);

  // -----------------------------------------
  // 🔮 [병합 및 카운팅 메인 엔진]
  // -----------------------------------------
  const groupOrders = () => {
    const groups = {};

    votes.forEach((vote) => {
      // ➔ 음료명 + 온도옵션 + 카페인옵션 3가지가 완전히 같아야 한 칸으로 뭉쳐집니다!
      const groupKey = `${vote.drinkName}||${vote.option}||${vote.caffeine}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          drinkName: vote.drinkName,
          option: vote.option,
          caffeine: vote.caffeine,
          count: 0,
          voters: [] // ➔ 뭉쳐진 주문자들 실명을 배열에 보관
        };
      }
      groups[groupKey].count += 1;
      groups[groupKey].voters.push(vote.memberName);
    });

    return Object.values(groups);
  };

  const aggregatedOrders = groupOrders();

  // -----------------------------------------
  // 🔄 아코디언 개방/폐쇄 토글 핸들러
  // -----------------------------------------
  const handleGroupClick = (groupId) => {
    setExpandedGroupId((prev) => (prev === groupId ? null : groupId));
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-md relative select-none">
      
      {/* 타이틀 및 전체 총량 표시 */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
          <span>■</span> 최종 주문 합계
        </h3>
        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-indigo-200">
          총 {votes.length}개
        </span>
      </div>

      {/* 아무도 투표 안 했을 때의 평온한 기본창 */}
      {votes.length === 0 ? (
        <div className="text-center py-10 space-y-2">
          <span className="text-3xl block filter saturate-50 animate-pulse">🪵</span>
          <p className="text-[11px] font-extrabold text-slate-400">
            아직 들어온 음료 투표표가 없습니다. 우측 폼에서 투표해 보세요!
          </p>
        </div>
      ) : (
        // 주문 집계 리스트 카드형 그리드
        <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto scrollbar-thin pr-1">
          {aggregatedOrders.map((group) => {
            const groupId = `${group.drinkName}-${group.option}-${group.caffeine}`;
            const isExpanded = expandedGroupId === groupId;

            // ⭐ 동적 drinkDetails 맵에서 음료 이모지를 실시간 조회합니다!
            // ✏️ 직접입력으로 생성된 수동 음료(예: ✏️ 자몽에이드)의 경우, 앞머리 유니코드를 그대로 사용합니다.
            let displayEmoji = "🥤";
            if (group.drinkName.startsWith("✏️")) {
              displayEmoji = "✏️";
            } else {
              const details = drinkDetails[group.drinkName];
              if (details) {
                displayEmoji = details.emoji;
              }
            }

            return (
              <div 
                key={groupId}
                className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden hover:border-slate-200 transition-all shadow-sm"
              >
                {/* ➔ 주문 뭉침 윗줄 요약 카드 (클릭 시 아코디언 작동) */}
                <div
                  onClick={() => handleGroupClick(groupId)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* 온도별 미세 온도 뱃지 아이콘 */}
                    <span className={`text-xs px-2 py-1 rounded-lg font-black ${
                      group.option === "ICE" 
                        ? "bg-blue-100 text-blue-700 border border-blue-200" 
                        : "bg-red-100 text-red-700 border border-red-200"
                    }`}>
                      {group.option === "ICE" ? "🧊 ICE" : "🔥 HOT"}
                    </span>
                    
                    {/* 음료 글씨 및 카페인 라벨 */}
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                        <span>{displayEmoji}</span>
                        {group.drinkName.replace("✏️ ", "")}
                      </span>
                      {group.caffeine !== "해당없음" && (
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-1.5 py-0.2 rounded mt-0.5 w-max">
                          ({group.caffeine})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 이 뭉치에 담긴 총 잔 수 뱃지 */}
                  <span className="bg-slate-200 text-slate-700 text-xs font-black w-8 h-8 rounded-full flex items-center justify-center border border-slate-300 shadow-inner">
                    {group.count}개
                  </span>
                </div>

                {/* ➔ [아코디언 실명 목록 박스] (펼쳤을 때 등장) */}
                {isExpanded && (
                  <div className="bg-white border-t border-slate-100 p-4 space-y-3 animate-slideDown">
                    <span className="text-[10px] font-bold text-slate-400 block tracking-tight">
                      주문자 명단 ({group.voters.length}명)
                    </span>
                    
                    {/* 사람 실명 뱃지들 그리드 */}
                    <div className="flex flex-wrap gap-2">
                      {group.voters.map((voterName) => (
                        <span
                          key={voterName}
                          className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200/60 rounded-full pl-3 pr-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors group"
                        >
                          {voterName}
                          {/* 개별 주문 취소(수거) 단독 ✕ 버튼 */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation(); // ➔ 아코디언이 도로 접히지 않도록 이벤트 전파 차단!
                              onDeleteVote(voterName);
                            }}
                            className="w-4 h-4 bg-white text-slate-400 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center text-[8px] font-black border border-slate-200 hover:border-red-500 transition-colors"
                            title="이 주문만 취소"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
