export const STEP_METADATA: Record<
  number,
  { action: string; learned: string; description: string; icon: string }
> = {
  1: {
    action: "클릭",
    learned: "클릭을 배웠어요!",
    description: "마우스 왼쪽 버튼을\n정확하게 누를 수 있게 되었어요.",
    icon: "☝️"
  },
  2: {
    action: "더블 클릭",
    learned: "더블 클릭을 배웠어요!",
    description: "손가락을 빠르게 두 번 움직여\n꽃을 피워냈어요.",
    icon: "☝️☝️"
  },
  3: {
    action: "드래그 앤 드롭",
    learned: "드래그 앤 드롭을 배웠어요!",
    description: "물건을 꾹 눌러\n원하는 곳으로 옮기는 방법을 익혔어요.",
    icon: "🤝"
  },
  4: {
    action: "클릭하여 선 그리기",
    learned: "클릭하여 선 그리기를 배웠어요!",
    description: "마우스 왼쪽 버튼을 누른 채로\n선을 그리는 연습을 했어요.",
    icon: "〰️"
  },
  5: {
    action: "응용 도전",
    learned: "응용 도전을 완료했어요!",
    description: "마우스를 이용한 \n응용 미션을 모두 해냈어요!",
    icon: "🏆"
  }
};
