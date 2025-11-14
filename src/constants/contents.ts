import { ContentsCategoryType } from "@/models/contents";

export const CONTENTS_CATEGORY_MAP: Record<ContentsCategoryType, string> = {
  "0": "빠른일반",
  "1": "빠른프리미엄",
  "2": "구인공고",
  "3": "이력서",
  "4": "모집공고"
} as const;
