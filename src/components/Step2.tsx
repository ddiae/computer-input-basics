import { type FC, useState } from 'react';

interface Seed {
  id: number;
  x: number;
  y: number;
  isBloomed: boolean;
  hint: boolean;
}

const Step2: FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [seeds, setSeeds] = useState<Seed[]>(() => 
    Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      x: 10 + i * 11, // 가로로 더 촘촘히 배치
      y: 60 + Math.random() * 15,
      isBloomed: false,
      hint: false
    }))
  );

  const handleSingleClick = (id: number) => {
    setSeeds(prev => prev.map(s => {
      if (s.id === id && !s.isBloomed) {
        return { ...s, hint: true };
      }
      return s;
    }));
    setTimeout(() => {
      setSeeds(prev => prev.map(s => s.id === id ? { ...s, hint: false } : s));
    }, 500);
  };

  const handleDoubleClick = (id: number) => {
    setSeeds(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, isBloomed: true, hint: false } : s);
      if (updated.every(s => s.isBloomed)) {
        setTimeout(onComplete, 1000);
      }
      return updated;
    });
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#e1f5fe' }}>
      {/* 바닥 (잔디) */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '30%',
        backgroundColor: '#81c784',
        borderRadius: '50% 50% 0 0 / 20% 20% 0 0'
      }} />

      {seeds.map(seed => (
        <div
          key={seed.id}
          onClick={() => handleSingleClick(seed.id)}
          onDoubleClick={() => handleDoubleClick(seed.id)}
          className={seed.hint ? 'shake' : ''}
          style={{
            position: 'absolute',
            left: `${seed.x}%`,
            top: `${seed.y}%`,
            cursor: 'pointer',
            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {seed.isBloomed ? (
            /* 활짝 피어난 꽃 */
            <div style={{ position: 'relative', animation: 'bloom 0.6s ease-out' }}>
              {/* 꽃잎 */}
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#ff80ab',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 0 10px rgba(255, 128, 171, 0.5)'
              }}>
                {/* 꽃술 */}
                <div style={{ width: '25px', height: '25px', backgroundColor: '#ffd54f', borderRadius: '50%' }} />
              </div>
              {/* 줄기 */}
              <div style={{
                width: '6px',
                height: '40px',
                backgroundColor: '#4caf50',
                margin: '0 auto'
              }} />
            </div>
          ) : (
            /* 꽃씨 (갈색 작은 원) */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {seed.hint && (
                <div style={{
                  position: 'absolute',
                  top: '-40px',
                  backgroundColor: 'white',
                  padding: '5px 10px',
                  borderRadius: '15px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  whiteSpace: 'nowrap'
                }}>
                  "두 번 눌러봐요!"
                </div>
              )}
              <div style={{
                width: '30px',
                height: '20px',
                backgroundColor: '#795548',
                borderRadius: '50% 50% 40% 40%',
                boxShadow: 'inset 0 -3px rgba(0,0,0,0.2)'
              }} />
            </div>
          )}
        </div>
      ))}
      
      <style>{`
        @keyframes bloom {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Step2;
