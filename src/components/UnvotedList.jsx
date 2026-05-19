import React from "react";

export default function UnvotedList({ members, votes }) {
  
  // -----------------------------------------
  // 🧮 [스마트 필터링] 미투표자 및 Guest 제외 연산
  // -----------------------------------------
  const unvotedMembers = members.filter((memberName) => {
    
    // 1. 이미 투표한 사람인지 검사합니다.
    const hasVoted = votes.some((v) => v.memberName === memberName);
    
    // 2. 예외 처리: Guest1, Guest2, Guest3, Guest4 는 미투표자 명단에서 완전히 뺍니다!
    // 이름이 'Guest' 로 시작하는 임시 게스트들은 제외합니다.
    const isGuest = memberName.startsWith("Guest");

    // 투표하지 않았고(!hasVoted), 동시에 게스트가 아닐 때(!isGuest)만 필터 통과!
    return !hasVoted && !isGuest;
  });

  return (
    <div className="space-y-4">
      
      {/* ⏳ 상단 미투표자 타이틀 영역 (모래시계 이모지와 예쁜 테두리) */}
      <div className="flex items-center justify-between pb-3 border-b border-pink-100 select-none">
        <h3 className="text-lg font-bold text-pink-900 flex items-center gap-1.5">
          <span>⏳</span>
          아직 투표하지 않은 사람
        </h3>
        
        {/* 남은 인원수 뱃지 */}
        {unvotedMembers.length > 0 && (
          <span className="bg-pink-100 text-pink-700 text-xs font-extrabold px-2.5 py-1 rounded-full border border-pink-200">
            남은 인원: {unvotedMembers.length}명
          </span>
        )}
      </div>

      {/* 🌸 미투표 멤버 그리드 노출 */}
      {unvotedMembers.length > 0 ? (
        // 이름들이 한 줄에 3~4개씩 이쁘게 모이도록 반응형 그리드를 배치합니다. (사용자 캡쳐 시안 레이아웃 100% 동일)
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 select-none">
          {unvotedMembers.map((name) => (
            <div
              key={name}
              // 사용자 시안에 나온 둥글고 이쁜 핑크 카드 캡슐 태그 재현
              className="bg-white hover:bg-pink-50/50 text-slate-800 text-xs font-bold px-3 py-2.5 rounded-2xl border border-pink-100 flex items-center justify-center gap-1 shadow-sm hover:scale-[1.02] transition-all duration-150"
            >
              <span className="text-pink-400">🌸</span>
              <span>{name}</span>
            </div>
          ))}
        </div>
      ) : (
        // 🎉 전원 투표 완료 축하 세레머니!
        <div className="text-center py-4 bg-white/60 rounded-2xl border border-pink-100/50 shadow-inner select-none animate-bounce">
          <span className="text-2xl">❤️</span>
          <h4 className="text-indigo-900 font-extrabold mt-1 text-sm">와우! 모든 팀원이 투표를 완료했습니다!</h4>
          <p className="text-slate-500 text-[10px] mt-0.5">이제 아래 집계표를 보며 주문 전화를 하시면 됩니다. 😊</p>
        </div>
      )}
      
    </div>
  );
}
