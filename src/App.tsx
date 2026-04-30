import { useState } from 'react';
import './App.css';
import Step1 from './components/Step1';
import Step10 from './components/Step10';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import Step5 from './components/Step5';
import Step6 from './components/Step6';
import Step7 from './components/Step7';
import Step8 from './components/Step8';
import Step9 from './components/Step9';
import { STEP_METADATA, STEP_PASSWORDS } from './config/gameConfig';

// 단계별 지시문
const INSTRUCTIONS: Record<number, string> = {
  1: "풍선을 모두 클릭해서 터뜨려요!",
  2: "꽃씨를 빠르게 눌러서 꽃을 피워요!",
  3: "동물을 끌어다 알맞은 집에 놓아줘요!",
  4: "점선을 따라 마우스를 움직여 그림을 완성해요!",
  5: "숫자 순서대로 점을 클릭해서 이어요!",
  6: "움직이는 동그라미를 클릭해요! 점점 작아져요!",
  7: "두더지가 나오면 빨리 클릭해요!",
  8: "공을 잡고 미로 끝까지 이동해요! 벽에 닿으면 안돼요!",
  9: "순서대로 따라해요! 재료 클릭 → 냄비 더블클릭 → 재료 드래그!",
  10: "방향키로 캐릭터를 움직여요! ↑키로 점프! 별에 도달하세요!",
};

function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [resetKey, setResetKey] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    const saved = localStorage.getItem('mcb_progress');
    if (saved) {
      const { completedSteps: savedCompleted } = JSON.parse(saved);
      return savedCompleted || [];
    }
    return [];
  });
  const [showFeedback, setShowFeedback] = useState<number | null>(null);
  const [showPasswordInput, setShowPasswordInput] = useState<number | null>(null);
  const [passwordValue, setPasswordValue] = useState('');

  // 단계 완료 처리
  const completeStep = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      const newCompleted = [...completedSteps, stepNumber];
      setCompletedSteps(newCompleted);
      localStorage.setItem('mcb_progress', JSON.stringify({ completedSteps: newCompleted }));
    }
    // 완료 피드백 보여주기
    setShowFeedback(stepNumber);
  };

  // 초기화 처리
  const resetProgress = () => {
    if (window.confirm('모든 기록을 지우고 처음부터 다시 시작할까요?')) {
      setCompletedSteps([]);
      setCurrentStep(1);
      localStorage.removeItem('mcb_progress');
    }
  };

  // 잠금 해제 확인 (엄격한 단계별 진행)
  const isUnlocked = (stepNum: number) => {
    if (stepNum === 1) return true;
    return completedSteps.includes(stepNum - 1);
  };

  // 단계 변경 시도
  const tryNavigate = (targetStep: number) => {
    if (targetStep === currentStep) return;
    
    // 이미 완료했거나 이전 단계면 바로 이동 (비밀번호 생략)
    if (completedSteps.includes(targetStep) || targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    // 아직 완료하지 않은 미래의 단계(잠금 해제 상태)는 비밀번호 필요
    setShowPasswordInput(targetStep);
    setPasswordValue('');
  };

  const handlePasswordSubmit = () => {
    if (!showPasswordInput) return;
    
    // 해당 단계의 비밀번호 확인
    const correctPassword = STEP_PASSWORDS[showPasswordInput];
    
    if (passwordValue === correctPassword) {
      setCurrentStep(showPasswordInput);
      setShowPasswordInput(null);
    } else {
      alert('비밀번호가 틀렸어요! 선생님께 도움을 요청하세요.');
      setPasswordValue('');
    }
  };

  return (
    <div className="app-container">
      {/* 상단 하트 시스템 */}
      <div className="heart-bar">
        {Array.from({ length: 10 }).map((_, i) => (
          <span 
            key={i} 
            className={`heart ${completedSteps.includes(i + 1) ? 'filled' : ''}`}
            title={`STEP ${i + 1}`}
          >
            {completedSteps.includes(i + 1) ? '❤️' : '🤍'}
          </span>
        ))}
        <button className="reset-button" onClick={resetProgress}>
          처음부터 다시하기
        </button>
      </div>

      {/* 지시문 영역 */}
      <div className="instruction-panel">
        <h1 className="instruction-text">{INSTRUCTIONS[currentStep]}</h1>
      </div>

      {/* 메인 미션 영역 */}
      <div className="mission-area">
        {currentStep === 1 && <Step1 key={`s1-${resetKey}`} onComplete={() => completeStep(1)} />}
        {currentStep === 2 && <Step2 key={`s2-${resetKey}`} onComplete={() => completeStep(2)} />}
        {currentStep === 3 && <Step3 key={`s3-${resetKey}`} onComplete={() => completeStep(3)} />}
        {currentStep === 4 && <Step4 key={`s4-${resetKey}`} onComplete={() => completeStep(4)} />}
        {currentStep === 5 && <Step5 key={`s5-${resetKey}`} onComplete={() => completeStep(5)} />}
        {currentStep === 6 && <Step6 key={`s6-${resetKey}`} onComplete={() => completeStep(6)} />}
        {currentStep === 7 && <Step7 key={`s7-${resetKey}`} onComplete={() => completeStep(7)} />}
        {currentStep === 8 && <Step8 key={`s8-${resetKey}`} onComplete={() => completeStep(8)} />}
        {currentStep === 9 && <Step9 key={`s9-${resetKey}`} onComplete={() => completeStep(9)} />}
        {currentStep === 10 && <Step10 key={`s10-${resetKey}`} onComplete={() => completeStep(10)} />}
        
        {/* 단계 완료 피드백 모달 */}
        {showFeedback && (
          <div className="modal-overlay">
            <div className="feedback-modal">
              <h2 style={{ color: '#6c5ce7', marginBottom: '10px' }}>{STEP_METADATA[showFeedback].learned}</h2>
              <div className="action-animation">
                <span className="mouse-icon">{STEP_METADATA[showFeedback].icon}</span>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.5', color: '#2d3436' }}>
                  {STEP_METADATA[showFeedback].description}
                </p>
              </div>
              <div className="modal-buttons" style={{ marginTop: '20px', gap: '15px' }}>
                <button 
                  className="cancel" 
                  onClick={() => {
                    setResetKey(prev => prev + 1);
                    setShowFeedback(null);
                  }}
                  style={{ backgroundColor: '#fab1a0' }}
                >
                  한번 더
                </button>
                {showFeedback < 10 && (
                  <button 
                    className="submit"
                    onClick={() => {
                      setShowFeedback(null);
                      tryNavigate(showFeedback + 1);
                    }}
                  >
                    다음 문제
                  </button>
                )}
                {showFeedback === 10 && (
                  <button className="submit" onClick={() => setShowFeedback(null)}>참 잘했어요! 🏆</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 비밀번호 입력 모달 */}
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
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                autoFocus
              />
              <div className="modal-buttons">
                <button className="cancel" onClick={() => setShowPasswordInput(null)}>뒤로가기</button>
                <button className="submit" onClick={handlePasswordSubmit}>열기</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <div className="navigation-bar">
        {Array.from({ length: 10 }).map((_, i) => {
          const stepNum = i + 1;
          const unlocked = isUnlocked(stepNum);
          return (
            <button
              key={stepNum}
              className={`nav-button ${currentStep === stepNum ? 'active' : ''} ${completedSteps.includes(stepNum) ? 'completed' : ''}`}
              onClick={() => unlocked && tryNavigate(stepNum)}
              disabled={!unlocked}
              title={unlocked ? `단계 ${stepNum}` : '잠겨있어요'}
            >
              {unlocked ? stepNum : '🔒'}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default App;
