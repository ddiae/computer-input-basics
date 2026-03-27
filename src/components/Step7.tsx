import { type FC, useState, useEffect, useCallback, useRef } from 'react';

const HOLE_COUNT = 9;

const Step7: FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activeHole, setActiveHole] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const moleTimeoutRef = useRef<number | null>(null);

  const spawnMole = useCallback(() => {
    if (moleTimeoutRef.current) {
      window.clearTimeout(moleTimeoutRef.current);
    }
    
    const hole = Math.floor(Math.random() * HOLE_COUNT);
    setActiveHole(hole);
    
    // 두더지가 머무는 시간 (1.2초)
    moleTimeoutRef.current = window.setTimeout(() => {
      setActiveHole(null);
    }, 1200);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameStarted(true);
    setActiveHole(null);
  };

  // 게임 시간 관리 (1초마다 감소)
  useEffect(() => {
    let timer: number | null = null;
    if (gameStarted && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameStarted) {
      window.setTimeout(() => {
        setGameStarted(false);
        setActiveHole(null);
        if (score >= 15) {
          onComplete();
        }
      }, 0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, timeLeft, score, onComplete]);

  // 두더지 생성 관리 (1.5초마다 생성 시도)
  useEffect(() => {
    let spawner: number | null = null;
    if (gameStarted) {
      spawner = window.setInterval(() => {
        spawnMole();
      }, 1500);
      window.setTimeout(spawnMole, 0); // 시작하자마자 하나 생성
    }
    return () => {
      if (spawner) clearInterval(spawner);
      if (moleTimeoutRef.current) clearTimeout(moleTimeoutRef.current);
    };
  }, [gameStarted, spawnMole]);

  const handleMoleClick = (index: number) => {
    if (index === activeHole) {
      setScore(prev => prev + 1);
      setActiveHole(null);
      if (moleTimeoutRef.current) {
        window.clearTimeout(moleTimeoutRef.current);
        moleTimeoutRef.current = null;
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', boxSizing: 'border-box' }}>
      {!gameStarted ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 'bold' }}>30초 동안 두더지 15마리를 잡으세요!</p>
          <button
            onClick={startGame}
            style={{
              padding: 'clamp(10px, 2vh, 20px) clamp(20px, 4vw, 40px)',
              fontSize: 'clamp(1.2rem, 3vh, 1.8rem)',
              backgroundColor: '#4ecdc4', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            게임 시작!
          </button>
        </div>
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
          <div style={{ width: '100%', marginBottom: '10px', display: 'flex', justifyContent: 'space-around', fontSize: '1.2rem', fontWeight: 'bold', color: '#6c5ce7', flexShrink: 0 }}>
            <span>⏰ {timeLeft}초</span>
            <span>🎯 {score} / 15</span>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            gap: '15px',
            backgroundColor: '#a29bfe',
            padding: '20px',
            borderRadius: '25px',
            width: 'min(90vw, 400px)',
            height: 'min(90vw, 400px)',
            boxSizing: 'border-box'
          }}>
            {Array.from({ length: HOLE_COUNT }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '100%', height: '100%', backgroundColor: '#6c5ce7', borderRadius: '50% 50% 20% 20%',
                  position: 'relative', overflow: 'hidden', cursor: 'pointer', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.3)'
                }}
              >
                <div
                  onMouseDown={() => handleMoleClick(i)}
                  onTouchStart={(e) => {
                    e.preventDefault(); // 더블 탭 확대 방지 등
                    handleMoleClick(i);
                  }}
                  style={{
                    position: 'absolute',
                    bottom: i === activeHole ? '0' : '-100%',
                    left: '10%', width: '80%', height: '85%', backgroundColor: '#795548', borderRadius: '50% 50% 0 0',
                    transition: 'bottom 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {/* 눈 */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ width: '6px', height: '6px', backgroundColor: '#333', borderRadius: '50%' }} />
                    <div style={{ width: '6px', height: '6px', backgroundColor: '#333', borderRadius: '50%' }} />
                  </div>
                  {/* 코 */}
                  <div style={{ width: '12px', height: '8px', backgroundColor: '#ff6b6b', borderRadius: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Step7;

