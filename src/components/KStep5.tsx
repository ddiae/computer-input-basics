import { useState, useRef, useCallback, useEffect } from "react";

interface Pair {
  id: string;
  keyLabel: string;
  korean: string;
  isSpace: boolean;
}

const PAIRS: Pair[] = [
  { id: "ctrl", keyLabel: "Ctrl", korean: "컨트롤", isSpace: false },
  { id: "shift", keyLabel: "Shift", korean: "시프트", isSpace: false },
  { id: "enter", keyLabel: "Enter", korean: "엔터", isSpace: false },
  { id: "space", keyLabel: "Space", korean: "스페이스", isSpace: true }
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Pos {
  x: number;
  y: number;
}

interface Props {
  onComplete: () => void;
}

export default function KStep5({ onComplete }: Props) {
  const [rightOrder] = useState<Pair[]>(() => shuffle(PAIRS));
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<Pos>({ x: 0, y: 0 });
  const [leftPos, setLeftPos] = useState<Record<string, Pos>>({});
  const [rightPos, setRightPos] = useState<Record<string, Pos>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const leftElRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rightElRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toContainer = (clientX: number, clientY: number): Pos => {
    if (!containerRef.current) return { x: clientX, y: clientY };
    const r = containerRef.current.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };

  const updatePositions = useCallback(() => {
    if (!containerRef.current) return;
    const cr = containerRef.current.getBoundingClientRect();
    const lp: Record<string, Pos> = {};
    const rp: Record<string, Pos> = {};
    for (const p of PAIRS) {
      const le = leftElRefs.current[p.id];
      if (le) {
        const r = le.getBoundingClientRect();
        lp[p.id] = { x: r.right - cr.left, y: r.top + r.height / 2 - cr.top };
      }
      const re = rightElRefs.current[p.id];
      if (re) {
        const r = re.getBoundingClientRect();
        rp[p.id] = { x: r.left - cr.left, y: r.top + r.height / 2 - cr.top };
      }
    }
    setLeftPos(lp);
    setRightPos(rp);
  }, []);

  useEffect(() => {
    const t = setTimeout(updatePositions, 0);
    window.addEventListener("resize", updatePositions);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", updatePositions);
    };
  }, [updatePositions]);

  const startDrag = (id: string, e: React.MouseEvent) => {
    if (matched.has(id)) return;
    e.preventDefault();
    updatePositions();
    setDragging(id);
    setWrong(null);
    setDragPos(toContainer(e.clientX, e.clientY));
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setDragPos(toContainer(e.clientX, e.clientY));
  };

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      const hovered = Object.entries(rightElRefs.current).find(([, el]) => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return (
          e.clientX >= r.left &&
          e.clientX <= r.right &&
          e.clientY >= r.top &&
          e.clientY <= r.bottom
        );
      });
      if (hovered) {
        const [targetId] = hovered;
        if (targetId === dragging) {
          const next = new Set(matched).add(dragging);
          setMatched(next);
          if (next.size >= PAIRS.length) setTimeout(onComplete, 600);
        } else {
          setWrong(dragging);
          setTimeout(() => setWrong(null), 600);
        }
      }
      setDragging(null);
    },
    [dragging, matched, onComplete]
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        userSelect: "none"
      }}
    >
      <p
        style={{
          fontWeight: 800,
          color: "#4c1d95",
          fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
          margin: 0
        }}
      >
        키 이름을 드래그해서 읽는 방법과 연결해요!
      </p>

      {/* SVG 연결선 레이어 */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          overflow: "visible"
        }}
      >
        {PAIRS.map((p) => {
          if (!matched.has(p.id)) return null;
          const lc = leftPos[p.id];
          const rc = rightPos[p.id];
          if (!lc || !rc) return null;
          return (
            <line
              key={p.id}
              x1={lc.x}
              y1={lc.y}
              x2={rc.x}
              y2={rc.y}
              stroke="#10b981"
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.8}
            />
          );
        })}
        {dragging && leftPos[dragging] && (
          <line
            x1={leftPos[dragging].x}
            y1={leftPos[dragging].y}
            x2={dragPos.x}
            y2={dragPos.y}
            stroke="#a78bfa"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="8 5"
            opacity={0.7}
          />
        )}
      </svg>

      {/* 메인 두 컬럼 */}
      <div
        style={{
          display: "flex",
          gap: "clamp(80px, 18vw, 200px)",
          alignItems: "center"
        }}
      >
        {/* 왼쪽: 키 라벨 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 3vh, 28px)" }}>
          {PAIRS.map((p) => {
            const isMatched = matched.has(p.id);
            const isWrong = wrong === p.id;
            return (
              <div
                key={p.id}
                ref={(el) => {
                  leftElRefs.current[p.id] = el;
                }}
                onMouseDown={(e) => startDrag(p.id, e)}
                style={{
                  width: p.isSpace
                    ? "clamp(120px, 18vw, 160px)"
                    : "clamp(72px, 11vw, 100px)",
                  height: p.isSpace
                    ? "clamp(36px, 5vw, 48px)"
                    : "clamp(52px, 8vw, 72px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: p.isSpace ? "10px" : "12px",
                  background: isMatched
                    ? "linear-gradient(135deg, #10b981, #34d399)"
                    : "linear-gradient(135deg, #7c3aed, #a78bfa)",
                  boxShadow: isMatched
                    ? "0 4px 0 #059669"
                    : isWrong
                      ? "0 0 0 3px #f87171"
                      : "0 4px 0 #5b21b6",
                  cursor: isMatched ? "default" : "grab",
                  animation: isWrong ? "kshake 0.4s ease" : "none",
                  transition: "background 0.2s, box-shadow 0.2s",
                  fontWeight: 900,
                  fontSize: p.isSpace
                    ? "clamp(0.85rem, 2vw, 1rem)"
                    : "clamp(1rem, 2.5vw, 1.3rem)",
                  color: "white",
                  flexShrink: 0
                }}
              >
                {p.keyLabel}
              </div>
            );
          })}
        </div>

        {/* 오른쪽: 한글 이름 (셔플) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 3vh, 28px)" }}>
          {rightOrder.map((p) => {
            const isMatched = matched.has(p.id);
            return (
              <div
                key={p.id}
                ref={(el) => {
                  rightElRefs.current[p.id] = el;
                }}
                style={{
                  minWidth: "clamp(72px, 11vw, 100px)",
                  height: "clamp(52px, 8vw, 72px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "14px",
                  background: isMatched
                    ? "rgba(16,185,129,0.12)"
                    : "rgba(255,255,255,0.85)",
                  border: isMatched
                    ? "2.5px solid #10b981"
                    : "2.5px solid #a78bfa",
                  fontWeight: 800,
                  fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                  color: isMatched ? "#059669" : "#4c1d95",
                  transition: "all 0.2s",
                  padding: "0 16px",
                  boxShadow: isMatched
                    ? "0 2px 8px rgba(16,185,129,0.2)"
                    : "0 2px 8px rgba(124,58,237,0.1)"
                }}
              >
                {p.korean}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes kshake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
