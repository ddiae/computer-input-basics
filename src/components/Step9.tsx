import { type FC, useState, useRef } from 'react';

type CookingPhase = 'PREPARE' | 'HEAT' | 'COOK' | 'DONE';

interface Ingredient {
  id: string;
  icon: string;
  name: string;
  isClicked: boolean;
  isCooked: boolean;
  pos: { x: number, y: number };
}

const Step9: FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<CookingPhase>('PREPARE');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 'carrot', icon: '🥕', name: '당근', isClicked: false, isCooked: false, pos: { x: 50, y: 150 } },
    { id: 'onion', icon: '🧅', name: '양파', isClicked: false, isCooked: false, pos: { x: 150, y: 150 } },
    { id: 'meat', icon: '🥩', name: '고기', isClicked: false, isCooked: false, pos: { x: 100, y: 250 } },
  ]);
  const [heatOn, setHeatOn] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const potRef = useRef<HTMLDivElement>(null);

  // 1단계: 재료 클릭
  const handleIngredientClick = (id: string) => {
    if (phase !== 'PREPARE') return;
    setIngredients(prev => {
      const updated = prev.map(ing => ing.id === id ? { ...ing, isClicked: true } : ing);
      if (updated.every(ing => ing.isClicked)) {
        setTimeout(() => setPhase('HEAT'), 800);
      }
      return updated;
    });
  };

  // 2단계: 냄비 더블클릭
  const handlePotDoubleClick = () => {
    if (phase !== 'HEAT') return;
    setHeatOn(true);
    setTimeout(() => setPhase('COOK'), 800);
  };

  // 3단계: 드래그 로직
  const handleStartDrag = (id: string) => {
    if (phase !== 'COOK') return;
    setDraggingId(id);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!draggingId || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left - 30; // 30 is half of icon size approx
    const y = clientY - rect.top - 30;
    
    setIngredients(prev => prev.map(ing => 
      ing.id === draggingId ? { ...ing, pos: { x, y } } : ing
    ));
  };

  const handleEndDrag = () => {
    if (!draggingId || !potRef.current || !containerRef.current) {
      setDraggingId(null);
      return;
    }

    const potRect = potRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const ing = ingredients.find(i => i.id === draggingId);

    if (ing) {
      // 냄비 영역 내부에 있는지 확인 (브라우저 좌표 기준)
      const ingScreenX = containerRect.left + ing.pos.x + 30;
      const ingScreenY = containerRect.top + ing.pos.y + 30;

      const isInsidePot = 
        ingScreenX >= potRect.left && 
        ingScreenX <= potRect.right && 
        ingScreenY >= potRect.top && 
        ingScreenY <= potRect.bottom;

      if (isInsidePot) {
        setIngredients(prev => {
          const updated = prev.map(i => i.id === draggingId ? { ...i, isCooked: true } : i);
          if (updated.every(i => i.isCooked)) {
            setPhase('DONE');
            setTimeout(onComplete, 2000);
          }
          return updated;
        });
      }
    }
    setDraggingId(null);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEndDrag}
      onMouseLeave={handleEndDrag}
      onTouchMove={(e) => {
        if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchEnd={handleEndDrag}
      style={{ 
        width: '100%', height: '100%', position: 'relative', overflow: 'hidden', 
        backgroundColor: '#fffbe6', touchAction: 'none', userSelect: 'none' 
      }}
    >
      <div style={{ 
        position: 'absolute', top: '20px', width: '100%', textAlign: 'center', 
        fontSize: 'clamp(1rem, 4vw, 1.5rem)', fontWeight: 'bold', color: '#f39c12', zIndex: 10 
      }}>
        {phase === 'PREPARE' && "🥕 재료를 하나씩 눌러서 준비해요!"}
        {phase === 'HEAT' && "♨️ 냄비를 두 번 빠르게 눌러서 불을 켜요!"}
        {phase === 'COOK' && "🍳 재료를 냄비 안으로 드래그하세요!"}
        {phase === 'DONE' && "🍲 맛있는 요리 완성! 참 잘했어요!"}
      </div>

      {/* 냄비 */}
      <div
        ref={potRef}
        onDoubleClick={handlePotDoubleClick}
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '15%',
          transform: 'translateX(-50%)',
          width: 'clamp(150px, 40%, 250px)',
          aspectRatio: '1.5 / 1',
          backgroundColor: '#95a5a6',
          borderRadius: '10px 10px 60px 60px',
          borderBottom: '15px solid #7f8c8d',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: phase === 'HEAT' ? 'pointer' : 'default',
          zIndex: 5,
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
        }}
      >
        {/* 불꽃 */}
        {heatOn && (
          <div style={{ 
            position: 'absolute', bottom: '-50px', fontSize: '3rem', 
            animation: 'flicker 0.4s infinite alternate' 
          }}>🔥</div>
        )}
        <div style={{ fontSize: 'clamp(3rem, 10vw, 5rem)' }}>🍲</div>
      </div>

      {/* 재료들 */}
      {ingredients.map(ing => (
        !ing.isCooked && (
          <div
            key={ing.id}
            onMouseDown={() => handleStartDrag(ing.id)}
            onTouchStart={() => handleStartDrag(ing.id)}
            onClick={() => handleIngredientClick(ing.id)}
            style={{
              position: 'absolute',
              left: ing.pos.x,
              top: ing.pos.y,
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              cursor: phase === 'COOK' ? 'grab' : (phase === 'PREPARE' ? 'pointer' : 'default'),
              opacity: (phase === 'PREPARE' && ing.isClicked) ? 0.4 : 1,
              zIndex: draggingId === ing.id ? 20 : 15,
              filter: (phase === 'PREPARE' && ing.isClicked) ? 'grayscale(100%)' : 'none',
              transition: draggingId === ing.id ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: draggingId === ing.id ? 'scale(1.2)' : 'scale(1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px'
            }}
          >
            {ing.icon}
          </div>
        )
      ))}

      <style>{`
        @keyframes flicker {
          from { transform: scale(1); opacity: 0.8; }
          to { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Step9;

