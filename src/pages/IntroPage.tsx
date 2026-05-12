import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { TEACHER_PASSWORD, TEACHER_MODE_KEY } from "../config/passwords";

const INTRO_TEXT = "우리 컴퓨터와 친해지는\n시간을 가져볼까요?";

export default function IntroPage() {
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherError, setTeacherError] = useState("");
  const [teacherActive] = useState(
    () => !!sessionStorage.getItem(TEACHER_MODE_KEY)
  );

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

  // 선생님 모드 단축키: Shift + T
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "T") {
        e.preventDefault();
        e.stopPropagation();
        setTeacherPassword("");
        setTeacherError("");
        setShowTeacherModal((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTeacherSubmit = () => {
    if (teacherPassword === TEACHER_PASSWORD) {
      sessionStorage.setItem(TEACHER_MODE_KEY, "1");
      setShowTeacherModal(false);
      // 페이지 새로고침 없이 상태 반영을 위해 navigate 활용
      window.location.reload();
    } else {
      setTeacherError("비밀번호가 틀렸어요!");
      setTeacherPassword("");
    }
  };

  const lines = displayText.split("\n");

  return (
    <div className="intro-screen">
      <div className="intro-content">
        {/* 임시 테스트 버튼 */}
        <button
          onClick={() => setShowTeacherModal(true)}
          style={{
            position: "fixed",
            bottom: 8,
            right: 8,
            opacity: 0.3,
            fontSize: "0.7rem"
          }}
        >
          T
        </button>
        <div className="intro-emoji">💻</div>
        {teacherActive && (
          <div
            style={{
              fontSize: "0.8rem",
              color: "#10b981",
              fontWeight: 700,
              marginBottom: 4
            }}
          >
            선생님 모드
          </div>
        )}
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

      {/* 선생님 모드 비밀번호 모달 */}
      {showTeacherModal && (
        <div className="modal-overlay">
          <div className="password-modal">
            <h3>선생님 모드</h3>
            <p>비밀번호를 입력하세요.</p>
            <input
              type="password"
              value={teacherPassword}
              placeholder="비밀번호 입력"
              onChange={(e) => {
                setTeacherPassword(e.target.value);
                setTeacherError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleTeacherSubmit()}
              autoFocus
            />
            {teacherError && (
              <p
                style={{
                  color: "#dc2626",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  margin: "4px 0 0"
                }}
              >
                {teacherError}
              </p>
            )}
            <div className="modal-buttons">
              <button
                className="modal-btn modal-btn--secondary"
                onClick={() => setShowTeacherModal(false)}
              >
                취소
              </button>
              <button
                className="modal-btn modal-btn--primary"
                onClick={handleTeacherSubmit}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
