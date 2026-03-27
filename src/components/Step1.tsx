import { type FC, useState } from 'react';

interface Balloon {
  id: number;
  x: number;
  y: number;
  color: string;
  isPopped: boolean;
}

const BALLOON_COLORS = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ff9f43', '#a29bfe', '#55efc4'];

const Step1: FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [balloons, setBalloons] = useState<Balloon[]>(() => 
    Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: Math.random() * 85 + 5, // 5% ~ 90%
      y: Math.random() * 70 + 10, // 10% ~ 80%
      color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
      isPopped: false
    }))
  );

  const popBalloon = (id: number) => {
    setBalloons(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, isPopped: true } : b);
      if (updated.every(b => b.isPopped)) {
        setTimeout(onComplete, 500);
      }
      return updated;
    });
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {balloons.map(balloon => (
        !balloon.isPopped && (
          <div
            key={balloon.id}
            onClick={() => popBalloon(balloon.id)}
            style={{
              position: 'absolute',
              left: `${balloon.x}%`,
              top: `${balloon.y}%`,
              width: '80px',
              height: '100px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: 'float 3s ease-in-out infinite',
              animationDelay: `${balloon.id * 0.2}s`
            }}
          >
            {/* 풍선 본체 */}
            <div style={{
              width: '80px',
              height: '100px',
              backgroundColor: balloon.color,
              borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
              boxShadow: 'inset -10px -10px rgba(0,0,0,0.1)',
              position: 'relative'
            }}>
              {/* 반사광 */}
              <div style={{
                position: 'absolute',
                top: '15px',
                left: '15px',
                width: '15px',
                height: '25px',
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderRadius: '50%'
              }} />
            </div>
            {/* 실 */}
            <div style={{
              width: '2px',
              height: '40px',
              backgroundColor: '#666',
              marginTop: '-5px'
            }} />
          </div>
        )
      ))}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
};

export default Step1;
