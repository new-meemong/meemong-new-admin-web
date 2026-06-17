export const SALON_PICK_PRODUCT_CURSOR_ORDER = {
  ID_DESC: "idDesc",
} as const;

export type SalonPickProductCursorOrder =
  (typeof SALON_PICK_PRODUCT_CURSOR_ORDER)[keyof typeof SALON_PICK_PRODUCT_CURSOR_ORDER];

export const SALON_PICK_PRODUCT_PAGE_SIZE = 50;

export const SALON_PICK_PRODUCT_MAX_FETCH_PAGE_COUNT = 100;

export const MIN_ACTIVE_SALON_PICK_PRODUCT_COUNT = 2;

export const SALON_PICK_PRODUCT_LINK_URL_PREFIX =
  "https://beauty8891.cafe24.com/product/detail.html?product_no=";

export const SALON_PICK_PRODUCT_HAIR_CONCERNS = [
  "어울리는 스타일",
  "어울리는 컬러",
  "탈모",
  "적은 숱",
  "얇은 모발",
  "볼륨 부족",
  "스타일링 어려움",
  "펌이 금방풀림",
  "심한 곱슬",
  "심한 직모",
  "모발손상",
  "지성두피",
  "건조한 두피",
] as const;

export type SalonPickProductHairConcern =
  (typeof SALON_PICK_PRODUCT_HAIR_CONCERNS)[number];

export const SALON_PICK_PRODUCT_SEX = {
  ALL: "전체",
  MALE: "남자",
  FEMALE: "여자",
} as const;

export type SalonPickProductSex =
  (typeof SALON_PICK_PRODUCT_SEX)[keyof typeof SALON_PICK_PRODUCT_SEX];

export const SALON_PICK_PRODUCT_BEAUTY_TREATMENT_TYPES = [
  "반영구",
  "속눈썹",
  "메이크업",
  "두피문신",
  "네일",
  "에스테틱",
] as const;

export const SALON_PICK_PRODUCT_HAIR_TREATMENT_TYPES = [
  "컷트",
  "펌",
  "매직",
  "염색",
  "탈색",
  "블랙빼기",
  "클리닉",
  "드라이",
  "헤드스파",
  "업스타일",
  "붙임머리",
] as const;

export const SALON_PICK_PRODUCT_TREATMENT_TYPES = [
  ...SALON_PICK_PRODUCT_BEAUTY_TREATMENT_TYPES,
  ...SALON_PICK_PRODUCT_HAIR_TREATMENT_TYPES,
] as const;

export type SalonPickProductTreatmentType =
  (typeof SALON_PICK_PRODUCT_TREATMENT_TYPES)[number];
