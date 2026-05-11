import { useState, useEffect, useRef } from "react";
import { KSTEP3_LANG_MODE, KSTEP3_WORDS } from "../config/keyboardConfig";

interface WordItem {
  text: string;
  lang: "en" | "ko";
}

type LangMode = "ko" | "en" | "mix";

function buildWordList(mode: LangMode): WordItem[] {
  if (mode === "ko") return KSTEP3_WORDS.ko;
  if (mode === "en") return KSTEP3_WORDS.en;
  const ko = [...KSTEP3_WORDS.ko];
  const en = [...KSTEP3_WORDS.en];
  const result: WordItem[] = [];
  const len = Math.max(ko.length, en.length);
  for (let i = 0; i < len; i++) {
    if (i < ko.length) result.push(ko[i]);
    if (i < en.length) result.push(en[i]);
  }
  return result;
}

const isKorean = (ch: string) => /[가-힣ㄱ-ㆎ]/.test(ch);
const isEnglish = (ch: string) => /[a-zA-Z]/.test(ch);

interface Props {
  onComplete: () => void;
}

export default function KStep3({ onComplete }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);
  const [langMode, setLangMode] = useState<LangMode>(KSTEP3_LANG_MODE);
  const [words, setWords] = useState<WordItem[]>(() =>
    buildWordList(KSTEP3_LANG_MODE)
  );
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [showLangHint, setShowLangHint] = useState(false);
  const langHintTimer = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const TOTAL = words.length;
  const current = words[index];

  // 모드 변경 시 단어 목록·진행도 리셋
  const handleModeChange = (mode: LangMode) => {
    setLangMode(mode);
    setWords(buildWordList(mode));
    setIndex(0);
    setInput("");
    setMessage("");
    setShowLangHint(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

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
      3000
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (done) return;
    let val = e.target.value;

    // 영어 단어는 자동 대문자 변환
    if (current.lang === "en") val = val.toUpperCase();

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

  const MODE_LABELS: { value: LangMode; label: string }[] = [
    { value: "ko", label: "한글" },
    { value: "en", label: "영어" },
    { value: "mix", label: "혼합" }
  ];

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
      {/* 모드 선택 커스텀 드롭다운 — 우측 상단 */}
      <div
        ref={dropdownRef}
        style={{ position: "absolute", top: "8px", right: "12px", zIndex: 20 }}
      >
        <div
          onClick={() => setDropdownOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "#f5f3ff",
            borderRadius: "12px",
            padding: "5px 12px",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "#4c1d95",
            userSelect: "none"
          }}
        >
          {MODE_LABELS.find((m) => m.value === langMode)?.label}
          <span
            style={{
              fontSize: "0.6rem",
              color: "#a78bfa",
              transform: dropdownOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.15s",
              display: "inline-block"
            }}
          >
            ▼
          </span>
        </div>
        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              right: 0,
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 16px rgba(124,58,237,0.18)",
              overflow: "hidden",
              minWidth: "80px"
            }}
          >
            {MODE_LABELS.map(({ value, label }) => (
              <div
                key={value}
                onClick={() => {
                  handleModeChange(value);
                  setDropdownOpen(false);
                }}
                style={{
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: langMode === value ? "#7c3aed" : "#4c1d95",
                  background: langMode === value ? "#f5f3ff" : "white",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f5f3ff")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    langMode === value ? "#f5f3ff" : "white")
                }
              >
                {label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 한/영 전환 안내 — absolute로 레이아웃 영향 없음 */}
      {showLangHint && (
        <div
          style={{
            position: "absolute",
            top: "80px",
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
