export const BANNER_USER_TYPE = {
  MODEL: "모델",
  DESIGNER: "디자이너",
} as const;

export type BannerUserType =
  (typeof BANNER_USER_TYPE)[keyof typeof BANNER_USER_TYPE];

// 공통 타입
export interface BannerTypeOption {
  value: string;
  label: string;
}

export const DEFAULT_BANNER_USER_TYPE: BannerUserType = BANNER_USER_TYPE.MODEL; // 1
export const DEFAULT_BANNER_TYPE_BY_USER_TYPE: Record<BannerUserType, string> =
  {
    [BANNER_USER_TYPE.MODEL]: "메인상단",
    [BANNER_USER_TYPE.DESIGNER]: "메인상단",
  };

export const USER_TYPE_OPTIONS: { value: BannerUserType; label: string }[] = [
  { value: "모델", label: "모델" },
  { value: "디자이너", label: "디자이너" },
];

// userType별 bannerType 맵
export const BANNER_TYPE_OPTIONS: Record<BannerUserType, BannerTypeOption[]> = {
  [BANNER_USER_TYPE.MODEL]: [
    { value: "메인상단", label: "메인상단" },
    { value: "메인하단", label: "메인하단" },
    { value: "빠른매칭 중앙", label: "빠른매칭 중앙" },
    { value: "지도로보기 상단", label: "지도로보기 상단" },
  ],
  [BANNER_USER_TYPE.DESIGNER]: [
    { value: "메인상단", label: "메인상단" },
    { value: "메인하단", label: "메인하단" },
    { value: "빠른매칭 중앙", label: "빠른매칭 중앙" },
    { value: "구인구직 중앙", label: "구인구직 중앙" },
  ],
};

// 모든 bannerType value 합친 상수 (검증용)
export const ALL_BANNER_TYPE_VALUES = [
  ...BANNER_TYPE_OPTIONS[BANNER_USER_TYPE.MODEL].map((o) => o.value),
  ...BANNER_TYPE_OPTIONS[BANNER_USER_TYPE.DESIGNER].map((o) => o.value),
] as const;

export type BannerType = (typeof ALL_BANNER_TYPE_VALUES)[number];
