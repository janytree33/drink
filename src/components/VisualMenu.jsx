import React from "react";

// 초보자 가이드: VisualMenu는 화면 왼쪽에 배치되는 화려하고 맛있는 그림 메뉴판입니다.
// 기존의 임의 SVG 로고를 사용자님이 전송해 주신 진짜 "j+ 로고(logo.png)" 이미지로 수정했습니다!
export default function VisualMenu({ drinks, drinkDetails }) {
  
  // 💡 '직접입력'을 제외한 실제 사진 카드로 노출할 음료 필터링
  const visualDrinks = drinks.filter((d) => d !== "직접입력");

  return (
    <div className="bg-gradient-to-b from-blue-50/90 to-indigo-100/90 backdrop-blur-md p-6 rounded-[32px] border border-white/50 shadow-lg text-center select-none h-full flex flex-col items-center justify-between min-h-[750px] relative overflow-hidden">
      
      {/* ❄️ 감성적인 배경 눈송이 장식들 */}
      <div className="absolute top-4 left-4 text-white/40 text-lg animate-bounce duration-1000">❄️</div>
      <div className="absolute top-10 right-8 text-white/30 text-2xl animate-pulse">❄️</div>
      <div className="absolute bottom-20 left-10 text-white/20 text-xl">❄️</div>

      {/* =========================================
          🔝 [메뉴판 상단] 3D 입체형 제니트리 브랜드 보드
          ========================================= */}
      <div className="flex flex-col items-center gap-3 mt-4 mb-6 z-10">
        <div className="relative group">
          {/* 로고 빛 방사 백라이트 효과 */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          
          {/* 📸 사용자님이 보내주신 오리지널 png 로고 장착! */}
          <img
            src="/logo.png"
            alt="Janytree Logo"
            className="relative w-16 h-16 object-contain rounded-full shadow-md border-2 border-white/80 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 ease-out"
          />
        </div>
        
        <div>
          <h2 className="text-xl font-black text-indigo-950 tracking-wider">Janytree</h2>
          <div className="w-12 h-0.5 bg-indigo-900 mx-auto my-1 rounded-full"></div>
          <p className="text-[9px] text-indigo-700/80 font-bold uppercase tracking-widest">
            Premium Menu Board
          </p>
        </div>
      </div>

      {/* =========================================
          🍽️ [메뉴판 중단] 맛있는 음료 3x3 원형 그리드 보드
          ========================================= */}
      <div className="grid grid-cols-3 gap-y-6 gap-x-4 w-full my-auto z-10">
        {visualDrinks.map((drinkName) => {
          // ⭐ 부모로부터 받은 동적 상태 맵(drinkDetails)에서 정보를 동적으로 꺼내옵니다!
          // 없으면 임시 디폴트 값을 대입하여 화면 깨짐을 완벽히 방어합니다.
          const details = drinkDetails[drinkName] || {
            emoji: "🥤",
            image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80",
            iceOnly: false
          };

          return (
            <div 
              key={drinkName}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              {/* 원형 사진 컵 프레임 */}
              <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-white shadow-md transform group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 ease-out">
                <img 
                  src={details.image} 
                  alt={drinkName} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* 🧊 [ICE ONLY] 오버레이 빨간 뱃지 
                    ➔ 사장님이 신메뉴에 ICE Only를 체크하고 출시하면 실시간으로 감지되어 예쁘게 노출됩니다! */}
                {details.iceOnly && (
                  <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-[0.5px] flex items-center justify-center">
                    <span className="bg-red-500/90 text-[8px] font-black text-white px-1.5 py-0.5 rounded-full border border-red-400 shadow-sm scale-90 sm:scale-100 tracking-tighter">
                      ICE ONLY
                    </span>
                  </div>
                )}
              </div>

              {/* 음료 라벨 명칭 */}
              <span className="text-[10px] font-extrabold text-indigo-950/90 group-hover:text-indigo-600 transition-colors leading-tight">
                {details.emoji} {drinkName}
              </span>
            </div>
          );
        })}
      </div>

      {/* =========================================
          🏁 [메뉴판 하단] 풋내기 바닥 장식 글귀
          ========================================= */}
      <div className="mt-6 mb-2 z-10">
        <p className="text-[9px] text-indigo-800/60 font-semibold tracking-wide">
          ✦ PREMIUM COFFEE & TEA HOUSE ✦
        </p>
      </div>

    </div>
  );
}
