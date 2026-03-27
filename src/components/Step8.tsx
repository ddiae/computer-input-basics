import { type FC, useEffect, useRef, useState, useCallback, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent } from 'react';

const Step8: FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [ballPos, setBallPos] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const getCoordinates = (e: MouseEvent | TouchEvent | ReactMouseEvent | ReactTouchEvent) => {
    if (!svgRef.current) return null;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    if ('touches' in e) {
      pt.x = e.touches[0].clientX;
      pt.y = e.touches[0].clientY;
    } else {
      pt.x = e.clientX;
      pt.y = e.clientY;
    }
    const cursorpt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x: cursorpt.x, y: cursorpt.y };
  };

  const checkCollision = useCallback((x: number, y: number) => {
    // 미로 경로를 제외한 영역 검사 (단순화를 위해 경로의 허용 범위를 좌표 기반으로 체크)
    // 600x500 기준
    const inPath1 = (x >= 20 && x <= 460 && y >= 20 && y <= 100);
    const inPath2 = (x >= 380 && x <= 460 && y >= 20 && y <= 220);
    const inPath3 = (x >= 100 && x <= 460 && y >= 160 && y <= 240);
    const inPath4 = (x >= 100 && x <= 180 && y >= 160 && y <= 460);
    const inPath5 = (x >= 100 && x <= 580 && y >= 400 && y <= 480);

    const isInsidePath = inPath1 || inPath2 || inPath3 || inPath4 || inPath5;
    
    // 출구 도달 확인
    if (x >= 540 && y >= 400 && y <= 480) {
      onComplete();
      return false;
    }

    return !isInsidePath;
  }, [onComplete]);

  const handleStart = (e: ReactMouseEvent | ReactTouchEvent) => {
    const coords = getCoordinates(e);
    if (!coords) return;
    const dist = Math.sqrt(Math.pow(coords.x - ballPos.x, 2) + Math.pow(coords.y - ballPos.y, 2));
    if (dist < 40) setIsDragging(true);
  };

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !svgRef.current) return;
    
    // getCoordinates와 동일한 로직을 직접 구현 (window 이벤트이므로)
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    if ('touches' in e) {
      pt.x = e.touches[0].clientX;
      pt.y = e.touches[0].clientY;
    } else {
      pt.x = e.clientX;
      pt.y = e.clientY;
    }
    const cursorpt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    if (checkCollision(cursorpt.x, cursorpt.y)) {
      setBallPos({ x: 50, y: 50 });
      setIsDragging(false);
      return;
    }

    setBallPos({ x: cursorpt.x, y: cursorpt.y });
  }, [isDragging, checkCollision]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', () => setIsDragging(false));
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', () => setIsDragging(false));
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', () => setIsDragging(false));
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', () => setIsDragging(false));
    };
  }, [handleMove]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
        <svg
          ref={svgRef}
          viewBox="0 0 600 500"
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          style={{ maxWidth: '100%', maxHeight: 'calc(100% - 40px)', width: 'auto', height: 'auto', backgroundColor: '#dfe6e9', borderRadius: '20px', touchAction: 'none' }}
        >
        {/* 미로 길 */}
        <path
          d="M 20 60 H 420 V 200 H 140 V 440 H 580"
          fill="none" stroke="white" strokeWidth="80" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* 출구 표시 */}
        <rect x="540" y="400" width="60" height="80" fill="#27ae60" rx="10" />
        <text x="570" y="445" textAnchor="middle" fill="white" style={{ fontSize: '14px', fontWeight: 'bold' }}>EXIT</text>
        
        {/* 플레이어 공 */}
        <circle
          cx={ballPos.x} cy={ballPos.y} r="20"
          fill="#ff6b6b" stroke="white" strokeWidth="4"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        />
      </svg>
      <p style={{ marginTop: '20px', fontWeight: 'bold', color: '#ff6b6b', fontSize: '1.2rem' }}>벽에 닿지 않게 조심조심! 🎱</p>
    </div>
    </div>
  );
};

export default Step8;
