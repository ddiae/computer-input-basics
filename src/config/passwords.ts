// 선생님 모드 비밀번호 (Ctrl+Shift+T 로 활성화)
export const TEACHER_PASSWORD = "teacher";
export const TEACHER_MODE_KEY = "mcb_teacher_mode";

// 비밀번호가 필요한 단계 번호를 배열로 지정하세요.
// 예) 전체 잠금: [1, 2, 3, 4, 5]
//     첫 단계만: [1]
//     비밀번호 없음: []
export const MOUSE_PASSWORD_STEPS: number[] = [];
export const KEY_PASSWORD_STEPS: number[] = [];

export const MOUSE_PASSWORDS: Record<number, string> = {
  1: "사과",
  2: "나비",
  3: "포도",
  4: "바다",
  5: "기차"
};

export const KEY_PASSWORDS: Record<number, string> = {
  1: "나무",
  2: "하늘",
  3: "우주",
  4: "구름",
  5: "안녕"
};
