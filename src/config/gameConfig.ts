// 단계별 비밀번호 설정 (선생님께서 여기서 수정 가능합니다)
export const STEP_PASSWORDS: Record<number, string> = {
  1: "사과",
  2: "포도",
  3: "나비",
  4: "바다",
  5: "하늘",
  6: "구름",
  7: "나무",
  8: "기차",
  9: "우주",
  10: "햇살",
};

export const STEP_METADATA: Record<number, { action: string; learned: string; description: string; icon: string }> = {
  1: { action: "클릭", learned: "클릭을 배웠어요!", description: "마우스 왼쪽 버튼을 정확하게 누를 수 있게 되었어요.", icon: "☝️" },
  2: { action: "더블 클릭", learned: "더블 클릭을 배웠어요!", description: "손가락을 빠르게 두 번 움직여 꽃을 피워냈어요.", icon: "☝️☝️" },
  3: { action: "드래그 앤 드롭", learned: "드래그 앤 드롭을 배웠어요!", description: "물건을 꾹 눌러 원하는 곳으로 옮기는 방법을 익혔어요.", icon: "🤝" },
  4: { action: "마우스 이동", learned: "마우스 이동을 배웠어요!", description: "선을 따라 부드럽게 마우스를 움직이는 연습을 했어요.", icon: "〰️" },
  5: { action: "순서대로 클릭", learned: "순서대로 클릭하기를 배웠어요!", description: "숫자를 확인하며 차례대로 클릭하는 집중력을 길렀어요.", icon: "1️⃣" },
  6: { action: "정밀 클릭", learned: "정밀 클릭하기를 배웠어요!", description: "움직이는 작은 대상을 정확히 맞추는 연습을 했어요.", icon: "🎯" },
  7: { action: "순발력 클릭", learned: "순발력을 배웠어요!", description: "두더지처럼 빠르게 나타나는 대상을 놓치지 않고 눌러요.", icon: "⚡" },
  8: { action: "정밀 이동", learned: "정밀 이동하기를 배웠어요!", description: "좁은 길에서도 벽에 닿지 않게 섬세하게 움직였어요.", icon: "🧗" },
  9: { action: "복합 동작", learned: "복합 마우스 사용법을 배웠어요!", description: "클릭, 더블클릭, 드래그를 상황에 맞게 섞어서 사용했어요.", icon: "🎓" },
  10: { action: "키보드 조작", learned: "키보드 조작을 배웠어요!", description: "마우스뿐만 아니라 키보드 방향키로 캐릭터를 움직였어요.", icon: "⌨️" },
};
