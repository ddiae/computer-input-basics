import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const INTRO_TEXT = "우리 컴퓨터와 친해지는\n시간을 가져볼까요?";

export default function IntroPage() {
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState("");
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const run = (fn: () => void, ms: number) => {
      if (!cancelled) timer = setTimeout(fn, ms);
    };

    const type = (text: string, speed: number, onDone: () => void) => {
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        setDisplayText(text.slice(0, ++i));
        if (i < text.length) run(tick, speed);
        else onDone();
      };
      run(tick, speed);
    };

    type(INTRO_TEXT, 70, () => setTypingDone(true));

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const lines = displayText.split("\n");

  return (
    <div className="intro-screen">
      <div className="intro-content">
        <div className="intro-emoji">💻</div>
        <h1 className="intro-text text-xl font-black text-gray-800 leading-relaxed ">
          {lines.map((line, i) => (
            <span key={i}>
              {line}
              {i < lines.length - 1 && <br />}
            </span>
          ))}
          {!typingDone && <span className="intro-cursor" />}
        </h1>
        <div className="flex flex-col gap-4">
          <button
            className={`intro-start-btn ${typingDone ? "visible" : ""}`}
            onClick={() => navigate("/mouse-control")}
          >
            마우스와 친해지기
          </button>
          <button
            className={`intro-start-btn2 ${typingDone ? "visible" : ""}`}
            onClick={() => navigate("/keyboard")}
          >
            키보드와 친해지기
          </button>
        </div>
      </div>
    </div>
  );
}
