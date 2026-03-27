import { type FC, useState } from 'react';

const Step6: FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [count, setCount] = useState(0);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState(80);

  const handleClick = () => {
    const nextCount = count + 1;
    if (nextCount >= 10) {
      onComplete();
      return;
    }

    setCount(nextCount);
    // 위치 랜덤 변경
    setPos({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80
    });
    // 크기 감소 (80 -> 70 -> 60 -> 50 -> 40 -> 30 -> 25 -> 20 -> 15 -> 10)
    setSize(prev => Math.max(10, prev - 7));
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        onClick={handleClick}
        style={{
          position: 'absolute',
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: '#ff6b6b',
          borderRadius: '50%',
          cursor: 'pointer',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <div style={{ width: '40%', height: '40%', backgroundColor: 'white', borderRadius: '50%' }} />
      </div>
      
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', fontSize: '1.5rem', fontWeight: 'bold' }}>
        맞춘 개수: {count} / 10
      </div>
    </div>
  );
};

export default Step6;
