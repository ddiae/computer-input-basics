import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import KStep1 from "../components/KStep1";
import KStep2 from "../components/KStep2";
import KStep3 from "../components/KStep3";
import KStep4 from "../components/KStep4";
import { KSTEP_METADATA } from "../config/keyboardConfig";
import { KEY_PASSWORDS } from "../config/passwords";

const TOTAL_STEPS = 4;

const INSTRUCTIONS: Record<number, string> = {
  1: "숫자 키를 찾아 눌러봐요!",
  2: "방향키로 캐릭터를 움직여요!",
  3: "단어를 보고 따라 입력해요!",
  4: "화면에 나오는 키를 빠르게 눌러요!"
};

const STORAGE_KEY = "mcb_keyboard_progress";

export default function KeyboardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [resetKey, setResetKey] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { completedSteps: savedCompleted } = JSON.parse(saved);
      return savedCompleted || [];
    }
    return [];
  });
  const [showFeedback, setShowFeedback] = useState<number | null>(null);
  const [showPasswordInput, setShowPasswordInput] = useState<number | null>(
    null
  );
  const [passwordValue, setPasswordValue] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const completeStep = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      const newCompleted = [...completedSteps, stepNumber];
      setCompletedSteps(newCompleted);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ completedSteps: newCompleted })
      );
    }
    setShowFeedback(stepNumber);
  };

  const confirmReset = () => {
    setCompletedSteps([]);
    setCurrentStep(1);
    localStorage.removeItem(STORAGE_KEY);
    setShowResetConfirm(false);
  };

  const isUnlocked = (stepNum: number) => {
    if (stepNum === 1) return true;
    return completedSteps.includes(stepNum - 1);
  };

  const tryNavigate = (targetStep: number) => {
    if (targetStep === currentStep) return;
    if (completedSteps.includes(targetStep) || targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }
    setShowPasswordInput(targetStep);
    setPasswordValue("");
  };

  const handlePasswordSubmit = () => {
    if (!showPasswordInput) return;
    const correctPassword = KEY_PASSWORDS[showPasswordInput];
    if (passwordValue === correctPassword) {
      setCurrentStep(showPasswordInput);
      setShowPasswordInput(null);
    } else {
      alert("비밀번호가 틀렸어요! 선생님께 도움을 요청하세요.");
      setPasswordValue("");
    }
  };

  return (
    <div className="app-container">
      <div className="heart-bar">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <span
            key={i}
            className={`heart ${completedSteps.includes(i + 1) ? "filled" : ""}`}
            title={`STEP ${i + 1}`}
          >
            {completedSteps.includes(i + 1) ? "❤️" : "🤍"}
          </span>
        ))}
        <div style={{ position: "absolute", left: "12px" }}>
          <button
            className="reset-button"
            onClick={() => navigate("/mouse-control")}
            style={{ position: "static" }}
          >
            ← 마우스 연습
          </button>
        </div>
        <button
          className="reset-button"
          onClick={() => setShowResetConfirm(true)}
        >
          처음부터 다시하기
        </button>
      </div>

      <div className="instruction-panel">
        <h1 className="instruction-text">{INSTRUCTIONS[currentStep]}</h1>
      </div>

      <div className="mission-area">
        {currentStep === 1 && (
          <KStep1 key={`ks1-${resetKey}`} onComplete={() => completeStep(1)} />
        )}
        {currentStep === 2 && (
          <KStep2 key={`ks2-${resetKey}`} onComplete={() => completeStep(2)} />
        )}
        {currentStep === 3 && (
          <KStep3 key={`ks3-${resetKey}`} onComplete={() => completeStep(3)} />
        )}
        {currentStep === 4 && (
          <KStep4 key={`ks4-${resetKey}`} onComplete={() => completeStep(4)} />
        )}
      </div>

      {/* 피드백 모달 */}
      {showFeedback && (
        <div className="modal-overlay">
          <div className="feedback-modal">
            <h2 className="modal-title">
              <span className="modal-keyword">
                {KSTEP_METADATA[showFeedback].action}
              </span>
              {KSTEP_METADATA[showFeedback].learned.replace(
                KSTEP_METADATA[showFeedback].action,
                ""
              )}
            </h2>
            <div className="action-animation">
              <span className="mouse-icon">
                {KSTEP_METADATA[showFeedback].icon}
              </span>
              <p className="modal-desc">
                {KSTEP_METADATA[showFeedback].description}
              </p>
            </div>
            <div className="modal-buttons">
              <button
                className="modal-btn modal-btn--secondary"
                onClick={() => {
                  setResetKey((prev) => prev + 1);
                  setShowFeedback(null);
                }}
              >
                한번 더
              </button>
              {showFeedback < TOTAL_STEPS && (
                <button
                  className="modal-btn modal-btn--primary"
                  onClick={() => {
                    setShowFeedback(null);
                    tryNavigate(showFeedback + 1);
                  }}
                >
                  다음 문제
                </button>
              )}
              {showFeedback === TOTAL_STEPS && (
                <button
                  className="modal-btn modal-btn--primary"
                  onClick={() => setShowFeedback(null)}
                >
                  참 잘했어요!
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 모달 */}
      {showPasswordInput && (
        <div className="modal-overlay">
          <div className="password-modal">
            <h3>🔒 {showPasswordInput}단계 열기</h3>
            <p>선생님께서 알려주신 비밀번호를 입력하세요.</p>
            <input
              type="text"
              value={passwordValue}
              placeholder="한글 단어 입력"
              onChange={(e) => setPasswordValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
              autoFocus
            />
            <div className="modal-buttons">
              <button
                className="modal-btn modal-btn--secondary"
                onClick={() => setShowPasswordInput(null)}
              >
                뒤로가기
              </button>
              <button
                className="modal-btn modal-btn--primary"
                onClick={handlePasswordSubmit}
              >
                열기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 초기화 확인 모달 */}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="feedback-modal">
            <div className="modal-emoji">🗑️</div>
            <h2 className="modal-title">처음부터 다시할까요?</h2>
            <p className="modal-desc">모든 기록이 사라져요!</p>
            <div className="modal-buttons" style={{ marginTop: "20px" }}>
              <button
                className="modal-btn modal-btn--secondary"
                onClick={() => setShowResetConfirm(false)}
              >
                취소
              </button>
              <button
                className="modal-btn modal-btn--danger"
                onClick={confirmReset}
              >
                다시 시작
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="navigation-bar">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
          const stepNum = i + 1;
          const unlocked = isUnlocked(stepNum);
          return (
            <button
              key={stepNum}
              className={`nav-button ${currentStep === stepNum ? "active" : ""} ${completedSteps.includes(stepNum) ? "completed" : ""}`}
              onClick={() => unlocked && tryNavigate(stepNum)}
              disabled={!unlocked}
              title={unlocked ? `단계 ${stepNum}` : "잠겨있어요"}
            >
              {unlocked ? stepNum : "🔒"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
