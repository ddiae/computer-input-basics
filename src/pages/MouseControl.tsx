import { useState } from "react";
import "../App.css";
import Step1 from "../components/Step1";
import Step2 from "../components/Step2";
import Step3 from "../components/Step3";
import Step4 from "../components/Step4";
import ChallengeStep from "../components/ChallengeStep";
import { STEP_METADATA } from "../config/mouseConfig";
import { MOUSE_PASSWORDS, MOUSE_PASSWORD_STEPS, TEACHER_MODE_KEY } from "../config/passwords";

const isTeacherMode = () => !!sessionStorage.getItem(TEACHER_MODE_KEY);
import { useNavigate } from "react-router-dom";

const TOTAL_STEPS = 5;

const INSTRUCTIONS: Record<number, string> = {
  1: "풍선을 모두 클릭해서 터뜨려요!",
  2: "꽃씨를 빠르게 두번 눌러서 꽃을 피워요!",
  3: "동물을 끌어다 알맞은 집에 놓아줘요!",
  4: "점선을 따라 마우스를 움직여 그림을 완성해요!",
  5: "세 가지 미션을 모두 클리어해요! 🏆"
};

export default function MouseControlPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [resetKey, setResetKey] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    const saved = sessionStorage.getItem("mcb_progress");
    if (saved) {
      const { completedSteps: savedCompleted } = JSON.parse(saved);
      return savedCompleted || [];
    }
    return [];
  });
  const [firstUnlocked, setFirstUnlocked] = useState<boolean>(() => {
    const saved = sessionStorage.getItem("mcb_progress");
    if (saved) {
      const data = JSON.parse(saved);
      return data.firstUnlocked || data.completedSteps?.length > 0;
    }
    return false;
  });
  const [showFeedback, setShowFeedback] = useState<number | null>(null);
  const [showPasswordInput, setShowPasswordInput] = useState<number | null>(
    () => {
      if (isTeacherMode()) return null;
      if (!MOUSE_PASSWORD_STEPS.includes(1)) return null;
      const saved = sessionStorage.getItem("mcb_progress");
      if (!saved) return 1;
      const data = JSON.parse(saved);
      const unlocked = data.firstUnlocked || data.completedSteps?.length > 0;
      return unlocked ? null : 1;
    }
  );
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const navigate = useNavigate();

  const saveProgress = (completed: number[], unlocked: boolean) => {
    sessionStorage.setItem(
      "mcb_progress",
      JSON.stringify({ completedSteps: completed, firstUnlocked: unlocked })
    );
  };

  const completeStep = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      const newCompleted = [...completedSteps, stepNumber];
      setCompletedSteps(newCompleted);
      saveProgress(newCompleted, true);
    }
    setShowFeedback(stepNumber);
  };

  const confirmReset = () => {
    setCompletedSteps([]);
    setFirstUnlocked(false);
    setCurrentStep(1);
    setShowPasswordInput(MOUSE_PASSWORD_STEPS.includes(1) ? 1 : null);
    sessionStorage.removeItem("mcb_progress");
    setShowResetConfirm(false);
  };

  const isUnlocked = (stepNum: number) => {
    if (isTeacherMode()) return true;
    if (stepNum === 1)
      return MOUSE_PASSWORD_STEPS.includes(1) ? firstUnlocked : true;
    return completedSteps.includes(stepNum - 1);
  };

  const tryNavigate = (targetStep: number) => {
    if (targetStep === currentStep) return;
    if (isTeacherMode() || completedSteps.includes(targetStep) || targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }
    if (!MOUSE_PASSWORD_STEPS.includes(targetStep)) {
      setCurrentStep(targetStep);
      return;
    }
    setShowPasswordInput(targetStep);
    setPasswordValue("");
  };

  const handlePasswordSubmit = () => {
    if (!showPasswordInput) return;
    const correctPassword = MOUSE_PASSWORDS[showPasswordInput];
    if (passwordValue === correctPassword) {
      if (showPasswordInput === 1) {
        setFirstUnlocked(true);
        saveProgress(completedSteps, true);
      }
      setCurrentStep(showPasswordInput);
      setShowPasswordInput(null);
    } else {
      setPasswordError("비밀번호가 틀렸어요! 선생님께 도움을 요청하세요.");
      setPasswordValue("");
    }
  };

  return (
    <div className="app-container">
      <div className="heart-bar">
        <div style={{ position: "absolute", left: "12px" }}>
          <button
            className="reset-button"
            onClick={() => navigate("/")}
            style={{ position: "static" }}
          >
            홈으로
          </button>
        </div>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <span
            key={i}
            className={`heart ${completedSteps.includes(i + 1) ? "filled" : ""}`}
            title={`STEP ${i + 1}`}
          >
            {completedSteps.includes(i + 1) ? "❤️" : "🤍"}
          </span>
        ))}
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
          <Step1 key={`s1-${resetKey}`} onComplete={() => completeStep(1)} />
        )}
        {currentStep === 2 && (
          <Step2 key={`s2-${resetKey}`} onComplete={() => completeStep(2)} />
        )}
        {currentStep === 3 && (
          <Step3 key={`s3-${resetKey}`} onComplete={() => completeStep(3)} />
        )}
        {currentStep === 4 && (
          <Step4 key={`s4-${resetKey}`} onComplete={() => completeStep(4)} />
        )}
        {currentStep === 5 && (
          <ChallengeStep
            key={`s5-${resetKey}`}
            onComplete={() => completeStep(5)}
          />
        )}
      </div>

      {/* 피드백 모달 */}
      {showFeedback && (
        <div className="modal-overlay">
          <div className="feedback-modal">
            <h2 className="modal-title">
              <span className="modal-keyword">
                {STEP_METADATA[showFeedback].action}
              </span>
              {STEP_METADATA[showFeedback].learned.replace(
                STEP_METADATA[showFeedback].action,
                ""
              )}
            </h2>
            <div className="action-animation">
              <span className="mouse-icon">
                {STEP_METADATA[showFeedback].icon}
              </span>
              <p className="modal-desc">
                {STEP_METADATA[showFeedback].description}
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
              onChange={(e) => {
                setPasswordValue(e.target.value);
                setPasswordError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
              autoFocus
            />
            {passwordError && (
              <p
                style={{
                  color: "#dc2626",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  margin: "4px 0 0"
                }}
              >
                {passwordError}
              </p>
            )}
            <div className="modal-buttons">
              <button
                className="modal-btn modal-btn--secondary"
                onClick={() => {
                  if (showPasswordInput === 1) { navigate("/"); return; }
                  setShowPasswordInput(null);
                  setPasswordError("");
                }}
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
