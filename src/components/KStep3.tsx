import { useState, useEffect, useRef } from "react";

interface WordItem {
  text: string;
  lang: "en" | "ko";
}

const WORDS: WordItem[] = [
  { text: "사과", lang: "ko" },
  { text: "나비", lang: "ko" },
  { text: "cat", lang: "en" },
  { text: "dog", lang: "en" },
  { text: "sun", lang: "en" },
  { text: "happy", lang: "en" },
  { text: "고양이 밥", lang: "ko" },
  { text: "love you", lang: "en" }
];

const isKorean = (ch: string) => /[가-힣ㄱ-ㆎ]/.test(ch);
const isEnglish = (ch: string) => /[a-zA-Z]/.test(ch);

interface Props {
  onComplete: () => void;
}

export default function KStep3({ onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [showLangHint, setShowLangHint] = useState(false);
  const langHintTimer = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const TOTAL = WORDS.length;

  const current = WORDS[index];

  useEffect(() => {
    inputRef.current?.focus();
    if (langHintTimer.current) clearTimeout(langHintTimer.current);
    langHintTimer.current = window.setTimeout(() => setShowLangHint(false), 0);
  }, [index]);

  const triggerLangHint = () => {
    if (langHintTimer.current) clearTimeout(langHintTimer.current);
    setShowLangHint(true);
    langHintTimer.current = window.setTimeout(
      () => setShowLangHint(false),
      2000
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (done) return;
    const val = e.target.value;

    // 잘못된 언어 입력 감지
    const lastChar = val[val.length - 1];
    if (lastChar) {
      if (current.lang === "ko" && isEnglish(lastChar)) triggerLangHint();
      if (current.lang === "en" && isKorean(lastChar)) triggerLangHint();
    }

    setInput(val);
    if (val === current.text) {
      setMessage("");
      setShowLangHint(false);
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setInput("");
        if (index + 1 >= TOTAL) {
          onComplete();
        } else {
          setIndex((prev) => prev + 1);
        }
      }, 400);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input !== current.text && input.length > 0) {
      setShake(true);
      setMessage("다시 해봐요!");
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setMessage(""), 1200);
    }
  };

  const renderColored = () => {
    return current.text.split("").map((ch, i) => {
      const typed = input[i];
      let color = "#9ca3af";
      if (typed !== undefined) {
        color = typed === ch ? "#16a34a" : "#dc2626";
      }
      return (
        <span key={i} style={{ color, transition: "color 0.1s" }}>
          {ch}
        </span>
      );
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: "20px",
        position: "relative"
      }}
    >
      {/* 한/영 전환 안내 — absolute로 레이아웃 영향 없음 */}
      {showLangHint && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "clamp(0.85rem, 2vw, 1rem)",
            color: "#fff",
            fontWeight: 700,
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            padding: "7px 22px",
            borderRadius: "20px",
            whiteSpace: "nowrap",
            animation: "fadeInDown 0.25s ease",
            zIndex: 10,
            boxShadow: "0 4px 12px rgba(124,58,237,0.3)"
          }}
        >
          ⌨️ 한/영 키를 눌러 {current.lang === "en" ? "영어" : "한글"}로 바꿔요!
        </div>
      )}

      <p
        style={{
          fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
          color: "#6d28d9",
          fontWeight: 700,
          background: "#f5f3ff",
          padding: "6px 20px",
          borderRadius: "20px",
          border: "2px solid #c084fc",
          margin: 0
        }}
      >
        {current.lang === "en"
          ? "영어로 입력하세요 🔤"
          : "한글로 입력하세요 🇰🇷"}
      </p>

      <div
        style={{
          fontSize: "clamp(2.5rem, 7vw, 4rem)",
          fontWeight: 900,
          letterSpacing: "0.08em",
          color: "#4c1d95",
          background: "white",
          padding: "20px 40px",
          borderRadius: "20px",
          border: "3px solid #a78bfa",
          boxShadow: "0 4px 20px rgba(124,58,237,0.15)",
          minWidth: "200px",
          textAlign: "center"
        }}
      >
        {renderColored()}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={done}
        placeholder="여기에 입력하세요"
        style={{
          fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
          padding: "12px 24px",
          borderRadius: "14px",
          border: "2px solid #a78bfa",
          outline: "none",
          textAlign: "center",
          fontWeight: 700,
          color: "#4c1d95",
          width: "clamp(200px, 40vw, 360px)",
          boxShadow: shake ? "0 0 0 3px #fca5a5" : "0 0 0 3px transparent",
          animation: shake ? "kshake 0.4s ease" : "none",
          transition: "box-shadow 0.2s"
        }}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
      />

      <div style={{ height: "24px", display: "flex", alignItems: "center" }}>
        {message && (
          <p
            style={{
              color: "#dc2626",
              fontWeight: 700,
              fontSize: "clamp(0.9rem, 2vw, 1rem)",
              margin: 0
            }}
          >
            {message}
          </p>
        )}
      </div>

      <p
        style={{
          fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
          fontWeight: 700,
          color: "#6d28d9",
          margin: 0,
          background: "#f5f3ff",
          padding: "6px 20px",
          borderRadius: "20px",
          border: "2px solid #c084fc"
        }}
      >
        {index + 1} / {TOTAL}
      </p>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
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
