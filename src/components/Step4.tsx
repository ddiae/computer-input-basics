import { type FC, useRef, useState, useEffect, type MouseEvent, type TouchEvent } from 'react';

const Step4: FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const containerRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [progress, setProgress] = useState(0);
  const isReadyToComplete = useRef(false);
  const [userPath, setUserPath] = useState<string>('');
  const [targetPoints, setTargetPoints] = useState<{x: number, y: number, hit: boolean}[]>([]);

  useEffect(() => {
    // 하트 경로 생성 (600x500 기준 좌표)
    const points = [];
    for (let t = 0; t <= Math.PI * 2; t += 0.1) {
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      points.push({ x: x * 12 + 300, y: y * 12 + 220, hit: false });
    }
    setTargetPoints(points);
  }, []);

  const getCoordinates = (e: MouseEvent | TouchEvent) => {
    if (!containerRef.current) return null;
    const svg = containerRef.current;
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

  const startDrawing = (e: MouseEvent | TouchEvent) => {
    const coords = getCoordinates(e);
    if (!coords) return;
    setIsDrawing(true);
    setUserPath(`M ${coords.x} ${coords.y}`);
  };

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    if (!coords) return;

    setUserPath(prev => `${prev} L ${coords.x} ${coords.y}`);

    // 근접도 확인
    setTargetPoints(prev => {
      let hits = 0;
      const updated = prev.map(p => {
        const dist = Math.sqrt(Math.pow(p.x - coords.x, 2) + Math.pow(p.y - coords.y, 2));
        const isHit = p.hit || dist < 20;
        if (isHit) hits++;
        return { ...p, hit: isHit };
      });
      
      const newProgress = Math.floor((hits / updated.length) * 100);
      setProgress(newProgress);
      if (newProgress >= 100) isReadyToComplete.current = true;
      
      return updated;
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (isReadyToComplete.current) onComplete();
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
      <svg
        ref={containerRef}
        viewBox="0 0 600 500"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{ 
          width: '100%', 
          height: 'auto', 
          maxHeight: '70vh', 
          backgroundColor: '#fff', 
          borderRadius: '20px', 
          border: '4px solid #f1f2f6',
          touchAction: 'none',
          cursor: 'crosshair'
        }}
      >
        {/* 가이드 점선 */}
        <path
          d={targetPoints.length > 0 ? `M ${targetPoints[0].x} ${targetPoints[0].y} ${targetPoints.map(p => `L ${p.x} ${p.y}`).join(' ')} Z` : ''}
          fill="none"
          stroke="#eee"
          strokeWidth="15"
          strokeDasharray="10,10"
          strokeLinecap="round"
        />
        {/* 사용자 그림 */}
        <path
          d={userPath}
          fill="none"
          stroke="#ff6b6b"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      
      <div style={{ marginTop: '20px', width: 'min(80%, 400px)', textAlign: 'center' }}>
        <div style={{ height: '20px', backgroundColor: '#f1f2f6', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#4ecdc4', transition: 'width 0.2s' }} />
        </div>
        <p style={{ margin: '10px 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#4ecdc4' }}>진행도: {progress}%</p>
      </div>
    </div>
  );
};

export default Step4;
