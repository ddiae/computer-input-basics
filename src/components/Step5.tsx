import { type FC, useState } from 'react';

interface Point {
  id: number;
  x: number;
  y: number;
}

const STAR_POINTS: Point[] = [
  { id: 1, x: 300, y: 50 },
  { id: 2, x: 380, y: 180 },
  { id: 3, x: 530, y: 180 },
  { id: 4, x: 410, y: 280 },
  { id: 5, x: 460, y: 430 },
  { id: 6, x: 300, y: 340 },
  { id: 7, x: 140, y: 430 },
  { id: 8, x: 190, y: 280 },
  { id: 9, x: 70, y: 180 },
  { id: 10, x: 220, y: 180 },
];

const Step5: FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [lastClickedId, setLastClickedId] = useState<number>(0);
  const [hint, setHint] = useState<string>('');

  const handlePointClick = (id: number) => {
    // 이미 클릭한 점은 무시
    if (id <= lastClickedId) return;

    if (id === lastClickedId + 1) {
      setLastClickedId(id);
      setHint('');
      if (id === STAR_POINTS.length) {
        setTimeout(onComplete, 1000);
      }
    } else {
      setHint(`${lastClickedId + 1}번을 눌러보세요!`);
      setTimeout(() => setHint(''), 1500);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {hint && (
          <div style={{
            position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: '#ff7675', color: 'white', padding: '8px 16px', borderRadius: '20px',
            fontWeight: 'bold', zIndex: 10, fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}>
            {hint}
          </div>
        )}

        <svg viewBox="0 0 600 500" style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', backgroundColor: '#fff', borderRadius: '20px', border: '4px solid #f1f2f6', overflow: 'visible' }}>
          {/* 선 그리기 */}
          {STAR_POINTS.map((p, i) => {
            if (i >= lastClickedId - 1 || i === STAR_POINTS.length - 1) return null;
            const nextP = STAR_POINTS[i + 1];
            return (
              <line
                key={`line-${i}`}
                x1={p.x} y1={p.y}
                x2={nextP.x} y2={nextP.y}
                stroke="#ff6b6b" strokeWidth="10" strokeLinecap="round"
              />
            );
          })}
          
          {/* 마지막 연결선 */}
          {lastClickedId === 10 && (
            <line
              x1={STAR_POINTS[9].x} y1={STAR_POINTS[9].y}
              x2={STAR_POINTS[0].x} y2={STAR_POINTS[0].y}
              stroke="#ff6b6b" strokeWidth="10" strokeLinecap="round"
            />
          )}

          {/* 클릭 가능한 점들 */}
          {STAR_POINTS.map(p => (
            <g key={p.id} onClick={() => handlePointClick(p.id)} style={{ cursor: 'pointer' }}>
              {/* 클릭 범위를 넓히기 위한 투명 원 */}
              <circle cx={p.x} cy={p.y} r="35" fill="transparent" />
              {/* 실제 보이는 점 */}
              <circle
                cx={p.x} cy={p.y} r="22"
                fill={p.id <= lastClickedId ? '#ff6b6b' : '#f1f2f6'}
                stroke={p.id === lastClickedId + 1 ? '#4ecdc4' : 'none'}
                strokeWidth="5"
                className={p.id === lastClickedId + 1 ? 'pulse' : ''}
              />
              <text
                x={p.x} y={p.y} dy="7" textAnchor="middle"
                fill={p.id <= lastClickedId ? 'white' : '#adb5bd'}
                style={{ fontSize: '18px', fontWeight: 'bold', pointerEvents: 'none' }}
              >
                {p.id}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); stroke-width: 5; }
          50% { transform: scale(1.1); stroke-width: 8; }
          100% { transform: scale(1); stroke-width: 5; }
        }
        .pulse { transform-origin: center; animation: pulse 1.5s infinite; }
      `}</style>
    </div>
  );
};

export default Step5;
