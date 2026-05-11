import { useEffect, useState, useCallback } from "react";

interface Props {
  onComplete: () => void;
}

export default function KStep1({ onComplete }: Props) {
  const [target, setTarget] = useState<number>(() =>
    Math.floor(Math.random() * 10)
  );
  const [progress, setProgress] = useState(0);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hint, setHint] = useState("");
  const TOTAL = 10;

  const nextTarget = useCallback(() => {
    setTarget(Math.floor(Math.random() * 10));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const pressed = e.key;
      if (!/^[0-9]$/.test(pressed)) return;
      if (parseInt(pressed) === target) {
        setSuccess(true);
        setHint("");
        setTimeout(() => {
          setSuccess(false);
          setProgress((prev) => {
            const next = prev + 1;
            if (next >= TOTAL) setTimeout(onComplete, 200);
            else nextTarget();
            return next;
          });
        }, 400);
      } else {
        setShake(true);
        setHint(`다시 ${target} 찾아보아요 👀`);
        setTimeout(() => setShake(false), 500);
        setTimeout(() => setHint(""), 1000);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [target, nextTarget, onComplete]);

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
      <p
        style={{
          fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
          fontWeight: 700,
          color: "#4c1d95",
          margin: 0
        }}
      >
        키보드에서 숫자를 찾아 눌러보세요!
      </p>

      <div
        style={{
          width: "clamp(140px, 22vw, 200px)",
          height: "clamp(140px, 22vw, 200px)",
          borderRadius: "24px",
          background: success
            ? "linear-gradient(135deg, #10b981, #34d399)"
            : "linear-gradient(135deg, #7c3aed, #a78bfa)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: success
            ? "0 8px 32px rgba(16,185,129,0.45)"
            : "0 8px 32px rgba(124,58,237,0.35)",
          animation: shake
            ? "kshake 0.4s ease"
            : success
              ? "kpop 0.35s ease"
              : "none",
          transition: "background 0.15s, box-shadow 0.15s"
        }}
      >
        <span
          style={{
            fontSize: "clamp(4rem, 12vw, 7rem)",
            fontWeight: 900,
            color: "white",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {target}
        </span>
      </div>

      <div
        style={{
          height: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {hint && (
          <p
            style={{
              color: "#dc2626",
              fontWeight: 700,
              fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
              margin: 0
            }}
          >
            {hint}
          </p>
        )}
      </div>

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
        {Math.min(progress, TOTAL)} / {TOTAL}
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
          40%  { transform: scale(1.18); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
