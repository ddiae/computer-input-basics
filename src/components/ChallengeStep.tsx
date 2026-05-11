import { type FC, useState, useEffect, useCallback, useRef } from "react";

// ── 라운드 1: 드래그로 별 잇기 ──────────────────────────────
const STAR_POINTS = [
  { id: 1, x: 300, y: 50 },
  { id: 2, x: 380, y: 180 },
  { id: 3, x: 530, y: 180 },
  { id: 4, x: 410, y: 280 },
  { id: 5, x: 460, y: 430 },
  { id: 6, x: 300, y: 340 },
  { id: 7, x: 140, y: 430 },
  { id: 8, x: 190, y: 280 },
  { id: 9, x: 70, y: 180 },
  { id: 10, x: 220, y: 180 }
];
const TOTAL_SEGMENTS = STAR_POINTS.length; // 10 (마지막은 10→1 로 닫힘)

const Round1: FC<{ onDone: () => void }> = ({ onDone }) => {
  // connected: 완성된 선분 수 (0~10)
  const [connected, setConnected] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const fromPt = STAR_POINTS[connected % TOTAL_SEGMENTS];
  const toPt = STAR_POINTS[(connected + 1) % TOTAL_SEGMENTS];

  const toSVG = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 600,
      y: ((clientY - rect.top) / rect.height) * 500
    };
  };

  const onMouseDown = (id: number, e: React.MouseEvent) => {
    if (connected >= TOTAL_SEGMENTS) return;
    if (id !== fromPt.id) return;
    e.preventDefault();
    setDragging(true);
    setDragPos(toSVG(e.clientX, e.clientY));
  };

  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging) return;
    setDragPos(toSVG(e.clientX, e.clientY));
  };

  const onMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging) return;
    setDragging(false);
    const pos = toSVG(e.clientX, e.clientY);
    const dist = Math.hypot(pos.x - toPt.x, pos.y - toPt.y);
    if (dist < 55) {
      const next = connected + 1;
      setConnected(next);
      if (next >= TOTAL_SEGMENTS) setTimeout(onDone, 600);
    }
  };

  const isDotFilled = (id: number) =>
    connected >= TOTAL_SEGMENTS || id < fromPt.id;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 8
      }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 600 500"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          width: "auto",
          height: "auto",
          overflow: "visible",
          cursor: dragging ? "grabbing" : "default",
          userSelect: "none"
        }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={() => setDragging(false)}
      >
        {/* 완성된 선분 */}
        {Array.from({ length: connected }).map((_, i) => {
          const a = STAR_POINTS[i % TOTAL_SEGMENTS];
          const b = STAR_POINTS[(i + 1) % TOTAL_SEGMENTS];
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#a78bfa"
              strokeWidth={9}
              strokeLinecap="round"
            />
          );
        })}

        {/* 드래그 중 미리보기 선 */}
        {dragging && (
          <line
            x1={fromPt.x}
            y1={fromPt.y}
            x2={dragPos.x}
            y2={dragPos.y}
            stroke="#c084fc"
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray="10 5"
            opacity={0.7}
          />
        )}

        {/* 점들 */}
        {STAR_POINTS.map((p) => {
          const isFrom = connected < TOTAL_SEGMENTS && p.id === fromPt.id;
          const isTo = connected < TOTAL_SEGMENTS && p.id === toPt.id;
          const filled = isDotFilled(p.id);
          return (
            <g
              key={p.id}
              onMouseDown={(e) => onMouseDown(p.id, e)}
              style={{ cursor: isFrom ? "grab" : "default" }}
            >
              {/* 클릭 영역 확장 */}
              <circle cx={p.x} cy={p.y} r={34} fill="transparent" />
              {/* 목표 점 강조 링 */}
              {isTo && !dragging && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={28}
                  fill="none"
                  stroke="#fde68a"
                  strokeWidth={4}
                  opacity={0.8}
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={22}
                fill={filled ? "#a78bfa" : isFrom ? "#ede9fe" : "#f5f3ff"}
                stroke={isFrom ? "#7c3aed" : "none"}
                strokeWidth={3.5}
              />
              <text
                x={p.x}
                y={p.y}
                dy={7}
                textAnchor="middle"
                fill={filled ? "white" : "#6d28d9"}
                style={{ fontSize: 17, fontWeight: 800, pointerEvents: "none" }}
              >
                {p.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ── 라운드 2: 클릭 + 더블클릭 혼합 ──────────────────────────
const R2_TOTAL = 10;

type Target = { id: number; x: number; y: number; type: "click" | "dblclick" };

const makeTarget = (id: number): Target => ({
  id,
  x: 12 + Math.random() * 74,
  y: 12 + Math.random() * 74,
  type: Math.random() < 0.5 ? "click" : "dblclick"
});

// 별 모양 SVG path (중심 0,0 기준 size=1)
const starPath = (cx: number, cy: number, r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.42;
    pts.push(
      `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`
    );
  }
  return `M ${pts.join(" L ")} Z`;
};

const Round2: FC<{ onDone: () => void }> = ({ onDone }) => {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState<Target>(() => makeTarget(0));
  const [shake, setShake] = useState(false);
  const [hint, setHint] = useState("");
  const clickTimer = useRef<number | null>(null);

  const triggerShake = (msg: string) => {
    setShake(true);
    setHint(msg);
    setTimeout(() => {
      setShake(false);
      setHint("");
    }, 600);
  };

  const advance = () => {
    const next = count + 1;
    if (next >= R2_TOTAL) {
      onDone();
      return;
    }
    setCount(next);
    setTarget(makeTarget(next));
  };

  // 단순 클릭 처리: dblclick 방지를 위해 짧은 딜레이 후 실행
  const handleClick = () => {
    if (clickTimer.current) return; // 더블클릭 중이면 무시
    clickTimer.current = window.setTimeout(() => {
      clickTimer.current = null;
      if (target.type === "click") {
        advance();
      } else {
        triggerShake("두 번 클릭해요! ☝️☝️");
      }
    }, 220);
  };

  const handleDblClick = () => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    if (target.type === "dblclick") {
      advance();
    } else {
      triggerShake("한 번만 클릭해요! ☝️");
    }
  };

  const size = 72;
  const isCircle = target.type === "click";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* 그라디언트 정의 — 항상 마운트 */}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="r2g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>

      {/* 범례 */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 20,
          zIndex: 2
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#6d28d9"
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#a78bfa,#c084fc)",
              flexShrink: 0
            }}
          />
          한 번 클릭
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#db2777"
          }}
        >
          <svg width={28} height={28} viewBox="-1 -1 2 2">
            <path d={starPath(0, 0, 1)} fill="url(#r2g)" />
          </svg>
          두 번 클릭
        </div>
      </div>

      {/* 힌트 메시지 */}
      {hint && (
        <div
          style={{
            position: "absolute",
            top: 44,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#f87171",
            color: "white",
            padding: "5px 16px",
            borderRadius: 20,
            fontWeight: 700,
            fontSize: "0.9rem",
            zIndex: 3,
            whiteSpace: "nowrap"
          }}
        >
          {hint}
        </div>
      )}

      {/* 타겟 */}
      <div
        key={target.id}
        onClick={handleClick}
        onDoubleClick={handleDblClick}
        className={shake ? "shake" : ""}
        style={{
          position: "absolute",
          left: `${target.x}%`,
          top: `${target.y}%`,
          width: size,
          height: size,
          transform: "translate(-50%, -50%)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "targetPop 0.25s cubic-bezier(0.175,0.885,0.32,1.275)"
        }}
      >
        {isCircle ? (
          // 클릭 타겟: 동그라미
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #a78bfa, #c084fc)",
              boxShadow: "0 5px 0 #7c3aed, 0 6px 16px rgba(124,58,237,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <div
              style={{
                width: "35%",
                height: "35%",
                background: "rgba(255,255,255,0.6)",
                borderRadius: "50%"
              }}
            />
          </div>
        ) : (
          // 더블클릭 타겟: 별
          <svg
            width={size}
            height={size}
            viewBox="-1 -1 2 2"
            style={{
              overflow: "visible",
              filter:
                "drop-shadow(0 5px 0 #be185d) drop-shadow(0 4px 10px rgba(219,39,119,0.4))"
            }}
          >
            <defs>
              <linearGradient id="r2g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <path d={starPath(0, 0, 0.88)} fill="url(#r2g)" />
            {/* 더블클릭 힌트 표시 */}
            <text
              y={0.08}
              textAnchor="middle"
              fill="white"
              style={{ fontSize: "0.55px", fontWeight: 900 }}
            >
              ×2
            </text>
          </svg>
        )}
      </div>

      {/* 진행 */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: "1rem",
          fontWeight: 800,
          color: "#6d28d9"
        }}
      >
        {count} / {R2_TOTAL}
      </div>

      <style>{`
        @keyframes targetPop {
          0%   { transform: translate(-50%,-50%) scale(0.5); opacity: 0; }
          100% { transform: translate(-50%,-50%) scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// ── 라운드 3: 당근 드래그 ────────────────────────────────────
const R3_HOLES = 9;
const R3_TARGET = 8;
const R3_TIME = 30;
const CARROT_STAY = 3000; // 당근이 머무는 시간(ms)

const Round3: FC<{ onDone: () => void }> = ({ onDone }) => {
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(R3_TIME);
  const [activeHole, setActiveHole] = useState<number | null>(null);
  // 드래그 상태
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [basketGlow, setBasketGlow] = useState(false);

  const carrotTimer = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const basketRef = useRef<HTMLDivElement>(null);
  const spawnCarrotRef = useRef<() => void>(() => {});

  const spawnCarrot = useCallback(() => {
    if (carrotTimer.current) clearTimeout(carrotTimer.current);
    setActiveHole(Math.floor(Math.random() * R3_HOLES));
    carrotTimer.current = window.setTimeout(() => {
      setActiveHole(null);
      setTimeout(() => spawnCarrotRef.current(), 400);
    }, CARROT_STAY);
  }, []);

  useEffect(() => {
    spawnCarrotRef.current = spawnCarrot;
  }, [spawnCarrot]);

  useEffect(() => {
    if (!started) return;
    const t = window.setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [started]);

  useEffect(() => {
    if (timeLeft === 0 && started) {
      setTimeout(() => {
        setStarted(false);
        setActiveHole(null);
        setDragging(false);
        if (score >= R3_TARGET) setTimeout(onDone, 300);
      }, 0);
    }
  }, [timeLeft, started, score, onDone]);

  useEffect(() => {
    if (!started) return;
    const first = setTimeout(spawnCarrot, 300);
    return () => clearTimeout(first);
  }, [started, spawnCarrot]);

  // 컨테이너 기준 좌표 변환 (backdrop-filter 때문에 fixed 사용 불가)
  const toContainerPos = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: clientX, y: clientY };
    const rect = containerRef.current.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  // 마우스 드래그 전역 이벤트
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDragPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    const onUp = (e: MouseEvent) => {
      setDragging(false);
      if (!basketRef.current) return;
      const r = basketRef.current.getBoundingClientRect();
      const inBasket =
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom;
      if (inBasket) {
        setBasketGlow(true);
        setTimeout(() => setBasketGlow(false), 400);
        setScore((p) => {
          const next = p + 1;
          if (next >= R3_TARGET) setTimeout(onDone, 400);
          else setTimeout(spawnCarrot, 400);
          return next;
        });
      } else {
        setTimeout(spawnCarrot, 400);
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, spawnCarrot, onDone]);

  const startDrag = (e: React.MouseEvent, hole: number) => {
    if (hole !== activeHole) return;
    e.preventDefault();
    if (carrotTimer.current) clearTimeout(carrotTimer.current);
    setActiveHole(null);
    setDragging(true);
    setDragPos(toContainerPos(e.clientX, e.clientY));
  };

  if (!started) {
    const failed = timeLeft === 0 && score < R3_TARGET;
    return (
      <div style={{ textAlign: "center", padding: 16 }}>
        {failed && (
          <p style={{ color: "#f87171", fontWeight: 800, marginBottom: 8 }}>
            아쉬워요! 다시 도전해봐요 💪
          </p>
        )}
        <p
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            marginBottom: 6,
            color: "#4c1d95"
          }}
        >
          구멍에서 올라온 당근을 🥕
        </p>
        <p
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            marginBottom: 16,
            color: "#4c1d95"
          }}
        >
          바구니로 드래그해서 담아요! 🧺
        </p>
        <button
          onClick={() => {
            setScore(0);
            setTimeLeft(R3_TIME);
            setStarted(true);
          }}
          style={{
            padding: "12px 36px",
            fontSize: "1.1rem",
            fontWeight: 900,
            background: "linear-gradient(135deg,#a78bfa,#c084fc)",
            color: "white",
            border: "none",
            borderRadius: 50,
            cursor: "pointer",
            boxShadow: "0 4px 0 #7c3aed"
          }}
        >
          시작!
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
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
      {/* 상태바 */}
      <div
        style={{
          display: "flex",
          gap: 36,
          fontWeight: 800,
          color: "#6d28d9",
          fontSize: "1.2rem"
        }}
      >
        <span>⏰ {timeLeft}초</span>
        <span>
          🥕 {score} / {R3_TARGET}
        </span>
      </div>

      {/* 게임 영역: 구멍 그리드 + 바구니 */}
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        {/* 3×3 구멍 그리드 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gridTemplateRows: "repeat(3,1fr)",
            gap: 12,
            background: "#ede9fe",
            padding: 16,
            borderRadius: 26,
            width: "min(72vw, 360px)",
            height: "min(72vw, 360px)"
          }}
        >
          {Array.from({ length: R3_HOLES }).map((_, i) => (
            <div
              key={i}
              style={{
                borderRadius: "50% 50% 18% 18%",
                background: "#c4b5fd",
                position: "relative",
                overflow: "hidden",
                boxShadow: "inset 0 5px 10px rgba(0,0,0,0.2)",
                cursor: i === activeHole ? "grab" : "default"
              }}
              onMouseDown={(e) => startDrag(e, i)}
            >
              {/* 당근 */}
              <div
                style={{
                  position: "absolute",
                  bottom: i === activeHole && !dragging ? "6%" : "-120%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "clamp(2rem,5vw,2.8rem)",
                  transition:
                    "bottom 0.2s cubic-bezier(0.175,0.885,0.32,1.275)",
                  lineHeight: 1,
                  pointerEvents: "none"
                }}
              >
                🥕
              </div>
            </div>
          ))}
        </div>

        {/* 바구니 */}
        <div
          ref={basketRef}
          style={{
            width: "clamp(72px,12vw,100px)",
            height: "clamp(72px,12vw,100px)",
            fontSize: "clamp(3rem,7vw,4rem)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 24,
            background: basketGlow
              ? "rgba(250,204,21,0.4)"
              : "rgba(255,255,255,0.6)",
            boxShadow: basketGlow
              ? "0 0 0 5px #fbbf24"
              : "0 0 0 2px rgba(167,139,250,0.3)",
            transition: "all 0.2s",
            flexShrink: 0
          }}
        >
          🧺
        </div>
      </div>

      {/* 드래그 중인 당근 — 컨테이너 기준 absolute */}
      {dragging && (
        <div
          style={{
            position: "absolute",
            left: dragPos.x,
            top: dragPos.y,
            transform: "translate(-50%, -50%)",
            fontSize: "clamp(2.2rem,5vw,3rem)",
            pointerEvents: "none",
            zIndex: 100,
            filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.3))"
          }}
        >
          🥕
        </div>
      )}
    </div>
  );
};

// ── 메인: 라운드 래퍼 ────────────────────────────────────────
const ROUNDS = [
  { label: "드래그로 별 잇기", emoji: "⭐" },
  { label: "클릭 구별하기", emoji: "🎯" },
  { label: "당근 드래그", emoji: "🥕" }
];

const ChallengeStep: FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [round, setRound] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const nextRound = () => {
    if (round + 1 >= ROUNDS.length) {
      onComplete();
      return;
    }
    setTransitioning(true);
    setTimeout(() => {
      setRound((r) => r + 1);
      setTransitioning(false);
    }, 900);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* 라운드 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "8px 0 4px",
          flexShrink: 0
        }}
      >
        {ROUNDS.map((_r, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  i < round
                    ? "#10b981"
                    : i === round
                      ? "linear-gradient(135deg,#a78bfa,#c084fc)"
                      : "#e9d5ff",
                fontSize: 13,
                fontWeight: 900,
                color: i <= round ? "white" : "#a78bfa",
                boxShadow:
                  i === round ? "0 2px 8px rgba(124,58,237,0.3)" : "none",
                transition: "all 0.3s"
              }}
            >
              {i < round ? "✓" : i + 1}
            </div>
            {i < ROUNDS.length - 1 && (
              <div
                style={{
                  width: 20,
                  height: 2,
                  background: i < round ? "#10b981" : "#e9d5ff",
                  borderRadius: 2,
                  transition: "background 0.3s"
                }}
              />
            )}
          </div>
        ))}
        <span
          style={{
            marginLeft: 8,
            fontWeight: 800,
            color: "#6d28d9",
            fontSize: "0.9rem"
          }}
        >
          {ROUNDS[round].emoji} {ROUNDS[round].label}
        </span>
      </div>

      {/* 라운드 콘텐츠 */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: transitioning ? 0 : 1,
          transition: "opacity 0.4s",
          position: "relative"
        }}
      >
        {round === 0 && <Round1 onDone={nextRound} />}
        {round === 1 && <Round2 onDone={nextRound} />}
        {round === 2 && <Round3 onDone={nextRound} />}
      </div>
    </div>
  );
};

export default ChallengeStep;
