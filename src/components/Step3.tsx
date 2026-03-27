import { type FC, useCallback, useEffect, useRef, useState } from 'react';

interface Animal {
  id: string;
  name: string;
  icon: string;
  targetId: string;
  currentPos: { x: number, y: number }; // % 단위
  startPos: { x: number, y: number };   // 초기 위치 저장
  isPlaced: boolean;
  isHappy: boolean;
}

interface House {
  id: string;
  icon: string;
}

const ANIMALS_DATA = [
  { id: 'dog', name: '강아지', icon: '🐶', targetId: 'house' },
  { id: 'cat', name: '고양이', icon: '🐱', targetId: 'house' },
  { id: 'fish', name: '물고기', icon: '🐟', targetId: 'water' },
  { id: 'otter', name: '해달', icon: '🦦', targetId: 'water' },
  { id: 'rabbit', name: '토끼', icon: '🐰', targetId: 'grass' },
  { id: 'bird', name: '새', icon: '🐦', targetId: 'nest' },
];

const HOUSES: House[] = [
  { id: 'house', icon: '🏠'  },
  { id: 'water', icon: '💧' },
  { id: 'grass', icon: '🌿' },
  { id: 'nest', icon: '🪺' },
];

const Step3: FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [animals, setAnimals] = useState<Animal[]>(() => 
    ANIMALS_DATA.map((a, i) => {
      // 상단 가로 배치 (중앙 정렬을 위해 약간의 여백 추가)
      const startPos = { x: 10 + (i * 14), y: 15 };
      return {
        ...a,
        currentPos: { ...startPos },
        startPos: { ...startPos },
        isPlaced: false,
        isHappy: false
      };
    })
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (id: string) => {
    if (animals.find(a => a.id === id)?.isPlaced) return;
    setDraggingId(id);
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!draggingId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * 100 - 5; // 중앙 정렬 보정
    const y = ((clientY - rect.top) / rect.height) * 100 - 5;

    setAnimals(prev => prev.map(a => 
      a.id === draggingId ? { ...a, currentPos: { x, y } } : a
    ));
  }, [draggingId]);

  const handleMouseUp = useCallback(() => {
    if (!draggingId || !containerRef.current) return;

    const animal = animals.find(a => a.id === draggingId);
    if (!animal) {
      setDraggingId(null);
      return;
    }

    const targetHouse = HOUSES.find(h => h.id === animal.targetId);
    if (!targetHouse) {
      // 정답 영역이 아예 없는 경우 (그럴 일은 거의 없지만 안전을 위해) 원위치
      setAnimals(prev => prev.map(a => 
        a.id === draggingId ? { ...a, currentPos: { ...a.startPos } } : a
      ));
      setDraggingId(null);
      return;
    }

    const houseEl = document.getElementById(targetHouse.id);
    if (houseEl) {
      const hRect = houseEl.getBoundingClientRect();
      const cRect = containerRef.current.getBoundingClientRect();
      
      const targetX = ((hRect.left - cRect.left + hRect.width / 2) / cRect.width) * 100;
      const targetY = ((hRect.top - cRect.top + hRect.height / 2) / cRect.height) * 100;

      const dist = Math.sqrt(
        Math.pow(animal.currentPos.x + 5 - targetX, 2) + 
        Math.pow(animal.currentPos.y + 5 - targetY, 2)
      );

      if (dist < 10) { // 성공
        setAnimals(prev => {
          const updated = prev.map(a => 
            a.id === draggingId ? { ...a, isHappy: true, currentPos: { x: targetX - 5, y: targetY - 5 } } : a
          );
          
          // 1초 뒤에 사라지게 함
          setTimeout(() => {
            setAnimals(current => {
              const disappeared = current.map(a => 
                a.id === draggingId ? { ...a, isPlaced: true, isHappy: false } : a
              );
              if (disappeared.every(u => u.isPlaced)) setTimeout(onComplete, 500);
              return disappeared;
            });
          }, 1000);

          return updated;
        });
      } else {
        // 거리 멀어서 실패 -> 원위치
        setAnimals(prev => prev.map(a => 
          a.id === draggingId ? { ...a, currentPos: { ...a.startPos } } : a
        ));
      }
    } else {
      // 집 엘리먼트 못 찾은 경우 원위치
      setAnimals(prev => prev.map(a => 
        a.id === draggingId ? { ...a, currentPos: { ...a.startPos } } : a
      ));
    }
    setDraggingId(null);
  }, [draggingId, animals, onComplete]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', touchAction: 'none', backgroundColor: '#f0f9ff' }}>
      {/* 집 영역 (하단 배치, 더 크게) */}
      <div style={{ 
        position: 'absolute', 
        left: '5%', 
        right: '5%', 
        bottom: '10%', 
        display: 'flex', 
        justifyContent: 'space-around',
        alignItems: 'flex-end'
      }}>
        {HOUSES.map(house => (
          <div
            key={house.id}
            id={house.id}
            style={{
              width: 'min(20vw, 180px)',
              height: 'min(20vw, 180px)',
              backgroundColor: 'white',
              border: '4px dashed #a5d6a7',
              borderRadius: '30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: 'min(4vw, 1.5rem)',
              color: '#4caf50',
              boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
              transition: 'transform 0.3s ease'
            }}
          >
            <span style={{ fontSize: 'min(12vw, 5rem)', marginBottom: '10px' }}>{house.icon}</span>
          </div>
        ))}
      </div>

      {/* 동물 카드 */}
      {animals.map(animal => (
        !animal.isPlaced && (
          <div
            key={animal.id}
            onMouseDown={() => handleMouseDown(animal.id)}
            onTouchStart={() => handleMouseDown(animal.id)}
            style={{
              position: 'absolute',
              left: `${animal.currentPos.x}%`,
              top: `${animal.currentPos.y}%`,
              width: 'min(12vw, 110px)',
              height: 'min(12vw, 110px)',
              backgroundColor: 'white',
              boxShadow: draggingId === animal.id ? '0 15px 30px rgba(0,0,0,0.2)' : '0 4px 15px rgba(0,0,0,0.1)',
              borderRadius: '25px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: 'min(9vw, 4.5rem)',
              cursor: animal.isPlaced || animal.isHappy ? 'default' : 'grab',
              zIndex: draggingId === animal.id || animal.isHappy ? 100 : 1,
              transition: draggingId === animal.id ? 'none' : 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: draggingId === animal.id ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {animal.icon}
            {animal.isHappy && (
              <div style={{
                position: 'absolute',
                top: '-60px',
                backgroundColor: '#ff7675',
                color: 'white',
                padding: '8px 15px',
                borderRadius: '20px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                whiteSpace: 'nowrap',
                animation: 'bounce 0.5s infinite alternate',
                zIndex: 110
              }}>
                고마워~ ❤️
              </div>
            )}
          </div>
        )
      ))}
      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default Step3;
