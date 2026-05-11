// ── KStep3 단어 입력 설정 ──────────────────────────────────────
// "ko"  : 한글 단어만
// "en"  : 영어 단어만
// "mix" : 한글 + 영어 혼합
export const KSTEP3_LANG_MODE: "ko" | "en" | "mix" = "ko";

export const KSTEP3_WORDS: Record<
  "ko" | "en",
  { text: string; lang: "ko" | "en" }[]
> = {
  ko: [
    { text: "사과", lang: "ko" },
    { text: "나비", lang: "ko" },
    { text: "고양이", lang: "ko" },
    { text: "토끼", lang: "ko" },
    { text: "안녕하세요", lang: "ko" },
    { text: "즐거운 하루", lang: "ko" },
    { text: "아기새의 발자국", lang: "ko" },
    { text: "강아지와 함께 산책해요", lang: "ko" }
  ],
  en: [
    { text: "CAT", lang: "en" },
    { text: "DOG", lang: "en" },
    { text: "SUN", lang: "en" },
    { text: "MOON", lang: "en" },
    { text: "HAPPY", lang: "en" },
    { text: "APPLE", lang: "en" },
    { text: "SCHOOL", lang: "en" },
    { text: "LOVE YOU", lang: "en" }
  ]
};

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
    action: "키 위치",
    learned: "키 위치를 배웠어요!",
    description: "Enter, Space, Ctrl, Shift\n방향키 위치를 익혔어요.",
    icon: "⌨️"
  },
  5: {
    action: "키 이름",
    learned: "키 이름을 배웠어요!",
    description: "Ctrl·Shift·Enter·Space\n각 키를 어떻게 읽는지 알았어요.",
    icon: "🔤"
  }
};
