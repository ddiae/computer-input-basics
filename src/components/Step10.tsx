import { type FC, useEffect, useRef, useState, useCallback } from "react";

interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Player extends Entity {
  vx: number;
  vy: number;
  isJumping: boolean;
  facingRight: boolean;
}

const PLATFORMS: Entity[] = [
  { x: 50, y: 400, width: 150, height: 20 },
  { x: 300, y: 320, width: 150, height: 20 },
  { x: 450, y: 220, width: 100, height: 20 },
  { x: 200, y: 150, width: 150, height: 20 },
  { x: 50, y: 80, width: 100, height: 20 }
];

const STAR: Entity = { x: 70, y: 30, width: 40, height: 40 };

const Step10: FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [player, setPlayer] = useState<Player>({
    x: 100,
    y: 350,
    width: 40,
    height: 40,
    vx: 0,
    vy: 0,
    isJumping: false,
    facingRight: true
  });
  const [isCleared, setIsCleared] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const requestRef = useRef<number>(null);
  const keys = useRef<{ [key: string]: boolean }>({});
  const isClearedRef = useRef(false);
  const updateRef = useRef<() => void>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
      setPressedKeys((prev) => new Set([...prev, e.key]));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
      setPressedKeys((prev) => {
        const s = new Set(prev);
        s.delete(e.key);
        return s;
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const update = useCallback(() => {
    if (isClearedRef.current) return;

    setPlayer((prev) => {
      let { x, y, vx, vy, isJumping, facingRight } = prev;

      // 이전 버전의 부드러운 물리 가속도 복구
      if (keys.current["ArrowLeft"]) {
        vx = -6;
        facingRight = false;
      } else if (keys.current["ArrowRight"]) {
        vx = 6;
        facingRight = true;
      } else vx *= 0.8;

      if (keys.current["ArrowUp"] && !isJumping) {
        vy = -14;
        isJumping = true;
      }

      vy += 0.7; // 중력 가속도 복구
      x += vx;
      y += vy;

      // 플랫폼 충돌 판정
      let onPlatform = false;
      for (const plat of PLATFORMS) {
        if (x + 30 > plat.x && x + 10 < plat.x + plat.width) {
          if (prev.y + 40 <= plat.y && y + 40 >= plat.y && vy >= 0) {
            y = plat.y - 40;
            vy = 0;
            isJumping = false;
            onPlatform = true;
          }
        }
      }

      if (!onPlatform && vy > 1) isJumping = true;

      // 경계 처리
      if (x < 0) x = 0;
      if (x > 560) x = 560;
      if (y > 500) {
        x = 100;
        y = 350;
        vy = 0;
      }

      // 별 충돌 판정 (거리 기반)
      const dist = Math.sqrt(
        Math.pow(STAR.x + 20 - (x + 20), 2) +
          Math.pow(STAR.y + 20 - (y + 20), 2)
      );
      if (dist < 40 && !isClearedRef.current) {
        isClearedRef.current = true;
        setIsCleared(true);
        setTimeout(onComplete, 1500);
      }

      return { ...prev, x, y, vx, vy, isJumping, facingRight };
    });

    if (updateRef.current) {
      requestRef.current = requestAnimationFrame(updateRef.current);
    }
  }, [onComplete]);

  useEffect(() => {
    updateRef.current = update;
  }, [update]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px",
        boxSizing: "border-box",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 0,
          position: "relative"
        }}
      >
        <svg
          viewBox="0 0 600 500"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            backgroundColor: "#87CEEB",
            display: "block",
            borderRadius: "20px",
            border: "5px solid white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
          }}
        >
          {/* 배경 장식 */}
          <text x="50" y="60" style={{ fontSize: "30px", opacity: 0.4 }}>
            ☁️
          </text>
          <text x="400" y="100" style={{ fontSize: "50px", opacity: 0.4 }}>
            ☁️
          </text>
          <text x="520" y="300" style={{ fontSize: "40px", opacity: 0.4 }}>
            ☁️
          </text>

          {/* 발판 */}
          {PLATFORMS.map((plat, i) => (
            <rect
              key={i}
              x={plat.x}
              y={plat.y}
              width={plat.width}
              height={plat.height}
              fill="#5d4037"
              rx="8"
            />
          ))}

          {/* 별 (목표) */}
          {!isCleared && (
            <g
              style={{
                transformOrigin: `${STAR.x + 20}px ${STAR.y + 20}px`,
                animation: "spin 2s linear infinite"
              }}
            >
              <text x={STAR.x} y={STAR.y + 35} style={{ fontSize: "45px" }}>
                ⭐
              </text>
            </g>
          )}

          {/* 플레이어 */}
          <g transform={`translate(${player.x}, ${player.y})`}>
            <text
              x="0"
              y="35"
              style={{
                fontSize: "40px",
                transform: player.facingRight ? "scaleX(-1)" : "scaleX(1)",
                transformBox: "fill-box",
                transformOrigin: "center",
                transition: "transform 0.1s"
              }}
            >
              🐈
            </text>
          </g>

          {/* 성공 효과 */}
          {isCleared && (
            <g transform="translate(300, 250)">
              <text
                x="-150"
                y="0"
                style={{
                  fontSize: "40px",
                  fontWeight: "bold",
                  fill: "#f1c40f",
                  filter: "drop-shadow(0 0 10px rgba(0,0,0,0.3))"
                }}
              >
                MISSION CLEAR! ⭐
              </text>
            </g>
          )}
        </svg>

        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "12px",
            right: "12px",
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            flexWrap: "wrap"
          }}
        >
          {[
            { arrowKey: "ArrowLeft", symbol: "←", desc: "왼쪽 이동" },
            { arrowKey: "ArrowRight", symbol: "→", desc: "오른쪽 이동" },
            { arrowKey: "ArrowUp", symbol: "↑", desc: "점프" }
          ].map(({ arrowKey, symbol, desc }) => {
            const active = pressedKeys.has(arrowKey);
            return (
              <div
                key={arrowKey}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: active
                    ? "rgba(250,204,21,0.9)"
                    : "rgba(255,255,255,0.85)",
                  padding: "6px 10px",
                  borderRadius: "12px",
                  fontSize: "min(3vw, 0.85rem)",
                  fontWeight: 700,
                  color: active ? "#78350f" : "#4c1d95",
                  boxShadow: active
                    ? "0 0 0 2px #fbbf24, 0 4px 12px rgba(251,191,36,0.5)"
                    : "0 2px 6px rgba(0,0,0,0.1)",
                  transition: "all 0.08s"
                }}
              >
                <span
                  style={{
                    background: active ? "#f59e0b" : "#7c3aed",
                    color: "white",
                    borderRadius: "6px",
                    padding: "1px 7px",
                    fontWeight: 900,
                    fontSize: "min(3.2vw, 0.95rem)",
                    transition: "background 0.08s"
                  }}
                >
                  {symbol}
                </span>
                {desc}
              </div>
            );
          })}
        </div>
      </div>
      <p style={{ marginTop: "10px", fontWeight: "bold", color: "#2d3436" }}>
        발판을 딛고 올라가 가장 높은 곳의 별을 잡으세요!
      </p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Step10;
