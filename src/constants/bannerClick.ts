export const BANNER_CLICK_PLACEMENT_LABELS = {
  model_home_carousel: "모델 홈 캐러셀",
  designer_home_carousel: "디자이너 홈 캐러셀",
  designer_general_unknown: "디자이너 일반 · 위치 미확인",
  thunder_matching_top: "번개매칭 상단",
  chat_list_top: "채팅 목록 상단",
  model_map_top: "모델 지도 상단",
  app_start_bottom_sheet: "앱 시작 바텀시트",
  unknown: "위치 미확인",
} as const;

export type BannerClickPlacementId = keyof typeof BANNER_CLICK_PLACEMENT_LABELS;

export const BANNER_CLICK_PERIOD_PRESETS = [
  { value: "7d", label: "최근 7일" },
  { value: "30d", label: "최근 30일" },
  { value: "custom", label: "직접 설정" },
  { value: "all", label: "전체" },
] as const;

export type BannerClickPeriodPreset =
  (typeof BANNER_CLICK_PERIOD_PRESETS)[number]["value"];

// 초과 시 잘린 통계를 표시하지 않고 기간 축소를 안내한다.
export const MAX_CLICK_DOCS = 50_000;
