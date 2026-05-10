export const KSTEP_METADATA: Record<
  number,
  { action: string; learned: string; description: string; icon: string }
> = {
  1: {
    action: "숫자 키",
    learned: "숫자 키를 배웠어요!",
    description: "키보드 위쪽의 숫자를\n정확하게 찾아 누를 수 있어요.",
    icon: "🔢"
  },
  2: {
    action: "방향키",
    learned: "방향키를 배웠어요!",
    description: "↑↓←→ 방향키로\n캐릭터를 자유롭게 움직였어요.",
    icon: "🕹️"
  },
  3: {
    action: "단어 입력",
    learned: "단어 입력을 배웠어요!",
    description: "한영키로 언어를 바꾸고\n스페이스로 띄어쓰기를 했어요.",
    icon: "✍️"
  },
  4: {
    action: "키 반응",
    learned: "키 위치를 배웠어요!",
    description: "Enter, Space, Ctrl, Shift\n방향키 위치를 익혔어요.",
    icon: "⌨️"
  }
};
