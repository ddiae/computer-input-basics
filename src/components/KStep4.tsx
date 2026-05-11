import { useEffect, useState, useRef, useCallback } from "react";

interface TargetKey {
  label: string;
  key: string;
}

const TARGETS: TargetKey[] = [
  { label: "↑", key: "ArrowUp" },
  { label: "↓", key: "ArrowDown" },
  { label: "←", key: "ArrowLeft" },
  { label: "→", key: "ArrowRight" },
  { label: "Enter ↵", key: "Enter" },
  { label: "Space", key: " " },
  { label: "Ctrl", key: "Control" },
  { label: "Shift", key: "Shift" }
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Props {
  onComplete: () => void;
}

export default function KStep4({ onComplete }: Props) {
  const [queue] = useState<TargetKey[]>(() => shuffle(TARGETS));
  const [round, setRound] = useState(0);
  const [status, setStatus] = useState<"waiting" | "correct" | "wrong">(
    "waiting"
  );
  const roundRef = useRef(round);
  const statusRef = useRef(status);

  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const goNext = useCallback(
    (wasCorrect: boolean) => {
      setStatus(wasCorrect ? "correct" : "wrong");
      setTimeout(() => {
        if (!wasCorrect) {
          // 틀리면 같은 키 다시 시도
          setStatus("waiting");
          return;
        }
        const next = roundRef.current + 1;
        if (next >= TARGETS.length) {
          setTimeout(onComplete, 200);
        } else {
          setRound(next);
          setStatus("waiting");
        }
      }, 600);
    },
    [onComplete]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const specialKeys = [
        "Enter",
        " ",
        "Control",
        "Shift",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight"
      ];
      if (specialKeys.includes(e.key)) e.preventDefault();
      if (statusRef.current !== "waiting") return;
      goNext(e.key === queue[roundRef.current].key);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [queue, goNext]);

  const current = queue[round];
  const isSpace = current.key === " ";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: "24px"
      }}
    >
      {/* 진행도 */}
      <p
        style={{
          fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
          fontWeight: 700,
          color: "#6d28d9",
          margin: 0,
          background: "#f5f3ff",
          padding: "6px 20px",
          borderRadius: "20px",
          border: "2px solid #c084fc"
        }}
      >
        {round + 1} / {TARGETS.length}
      </p>

      {/* 키 라벨 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: isSpace
            ? "clamp(180px, 30vw, 260px)"
            : "clamp(120px, 18vw, 180px)",
          minHeight: "clamp(90px, 14vw, 140px)",
          background:
            status === "correct"
              ? "linear-gradient(135deg, #10b981, #34d399)"
              : status === "wrong"
                ? "linear-gradient(135deg, #dc2626, #f87171)"
                : "linear-gradient(135deg, #7c3aed, #a78bfa)",
          borderRadius: "20px",
          boxShadow:
            status === "correct"
              ? "0 8px 30px rgba(16,185,129,0.4)"
              : "0 8px 30px rgba(124,58,237,0.3)",
          animation:
            status === "wrong"
              ? "kshake 0.4s ease"
              : status === "correct"
                ? "kpop 0.35s ease"
                : "none",
          transition: "background 0.2s, box-shadow 0.2s",
          padding: "0 24px"
        }}
      >
        <span
          style={{
            fontSize: isSpace
              ? "clamp(1.5rem, 4vw, 2.2rem)"
              : "clamp(2.5rem, 7vw, 4.5rem)",
            fontWeight: 900,
            color: "white",
            letterSpacing: "0.02em",
            textAlign: "center"
          }}
        >
          {status === "correct"
            ? "✅"
            : status === "wrong"
              ? "❌"
              : current.label}
        </span>
      </div>

      <p
        style={{
          fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
          fontWeight: 700,
          color: "#4c1d95",
          margin: 0
        }}
      >
        {status === "wrong"
          ? "다시 눌러봐요! 👀"
          : "이 키를 찾아서 눌러보세요!"}
      </p>

      <style>{`
        @keyframes kshake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-12px); }
          40% { transform: translateX(12px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
        @keyframes kpop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
