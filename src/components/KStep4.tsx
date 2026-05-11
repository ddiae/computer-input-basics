import { useEffect, useState, useRef, useCallback } from "react";

interface TargetKey {
  label: string;
  key: string;
  koreanHint: string;
}

const TARGETS: TargetKey[] = [
  {
    label: "↑",
    key: "ArrowUp",
    koreanHint: "위쪽 방향키예요.\n화살표가 위를 가리키고 있어요!"
  },
  {
    label: "↓",
    key: "ArrowDown",
    koreanHint: "아래쪽 방향키예요.\n화살표가 아래를 가리키고 있어요!"
  },
  {
    label: "←",
    key: "ArrowLeft",
    koreanHint: "왼쪽 방향키예요.\n화살표가 왼쪽을 가리키고 있어요!"
  },
  {
    label: "→",
    key: "ArrowRight",
    koreanHint: "오른쪽 방향키예요.\n화살표가 오른쪽을 가리키고 있어요!"
  },
  {
    label: "Enter ↵",
    key: "Enter",
    koreanHint: "엔터키라고 불러요.\n줄을 바꾸거나 확인할 때 눌러요!"
  },
  {
    label: "Space",
    key: " ",
    koreanHint: "스페이스라고 읽어요.\n아무것도 적혀있지 않은 가장 긴 키예요!"
  },
  {
    label: "Ctrl",
    key: "Control",
    koreanHint: "컨트롤키라고 불러요.\n다른 키와 함께 쓰는 특별한 키예요!"
  },
  {
    label: "Shift",
    key: "Shift",
    koreanHint: "시프트키라고 불러요.\n쌍자음을 쓸 때 함께 눌러요!"
  }
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
      {/* 안내 텍스트 */}
      <p
        style={{
          fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
          fontWeight: 700,
          color: "#4c1d95",
          margin: 0
        }}
      >
        {status === "wrong"
          ? "다시 눌러봐요! 👀"
          : "이 키를 찾아서 눌러보세요!"}
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
          borderRadius: "24px",
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
              : "clamp(3rem, 9vw, 5.5rem)",
            fontWeight: 900,
            color: "white",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            letterSpacing: "0.02em",
            whiteSpace: "nowrap"
          }}
        >
          {status === "correct"
            ? "✅"
            : status === "wrong"
              ? "❌"
              : current.label}
        </span>
      </div>

      {/* 힌트 영역 (KStep1의 hint 영역과 동일한 높이 확보) */}
      <div
        style={{
          minHeight: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {status === "waiting" && (
          <p
            style={{
              fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
              fontWeight: 600,
              color: "#7c3aed",
              margin: 0,
              background: "#f5f3ff",
              padding: "8px 20px",
              borderRadius: "14px",
              border: "1.5px solid #e9d5ff",
              maxWidth: "clamp(260px, 50vw, 420px)",
              textAlign: "center",
              lineHeight: 1.6,
              whiteSpace: "pre-line"
            }}
          >
            {current.koreanHint}
          </p>
        )}
      </div>

      {/* 진행도 */}
      <p
        style={{
          fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
          fontWeight: 700,
          color: "#6d28d9",
          margin: 0,
          background: "#f5f3ff",
          padding: "8px 24px",
          borderRadius: "20px",
          border: "2px solid #c084fc"
        }}
      >
        {round + 1} / {TARGETS.length}
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
