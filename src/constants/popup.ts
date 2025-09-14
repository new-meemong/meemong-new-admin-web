export const POPUP_USER_TYPE = {
  MODEL: "모델",
  DESIGNER: "디자이너",
} as const;

export type PopupUserType =
  (typeof POPUP_USER_TYPE)[keyof typeof POPUP_USER_TYPE];

// 공통 타입
export interface PopupTypeOption {
  value: string;
  label: string;
}

export const DEFAULT_POPUP_USER_TYPE: PopupUserType = POPUP_USER_TYPE.MODEL; // 1
export const DEFAULT_POPUP_TYPE_BY_USER_TYPE: Record<PopupUserType, string> = {
  [POPUP_USER_TYPE.MODEL]: "메인",
  [POPUP_USER_TYPE.DESIGNER]: "메인",
};

export const USER_TYPE_OPTIONS: { value: PopupUserType; label: string }[] = [
  { value: "모델", label: "모델" },
  { value: "디자이너", label: "디자이너" },
];

// userType별 bannerType 맵
export const POPUP_TYPE_OPTIONS: Record<PopupUserType, PopupTypeOption[]> = {
  [POPUP_USER_TYPE.MODEL]: [
    { value: "메인", label: "메인" },
    { value: "빠른매칭", label: "빠른매칭" },
    { value: "헤어컨설팅", label: "헤어컨설팅" },
  ],
  [POPUP_USER_TYPE.DESIGNER]: [
    { value: "메인", label: "메인" },
    { value: "빠른매칭", label: "빠른매칭" },
    { value: "헤어컨설팅", label: "헤어컨설팅" },
  ],
};

// 모든 bannerType value 합친 상수 (검증용)
export const ALL_POPUP_TYPE_VALUES = [
  ...POPUP_TYPE_OPTIONS[POPUP_USER_TYPE.MODEL].map((o) => o.value),
  ...POPUP_TYPE_OPTIONS[POPUP_USER_TYPE.DESIGNER].map((o) => o.value),
] as const;

export type PopupType = (typeof ALL_POPUP_TYPE_VALUES)[number];

export const HIDE_TYPE_OPTIONS: {
  value: string;
  label: string;
  shortLabel: string;
}[] = [
  {
    value: "일주일간 보지 않기",
    label: "일주일간 보지 않기",
    shortLabel: "일주일",
  },
  {
    value: "오늘 하루 보지 않기",
    label: "오늘 하루 보지 않기",
    shortLabel: "오늘하루",
  },
  {
    value: "다시 보지 않기",
    label: "다시 보지 않기",
    shortLabel: "다시보지않기",
  },
];

export const HIDE_TYPE_SHORT_LABELS: Record<string, string> = {
  "일주일간 보지 않기": "일주일",
  "오늘 하루 보지 않기": "오늘하루",
  "다시 보지 않기": "다시보지않기",
};
