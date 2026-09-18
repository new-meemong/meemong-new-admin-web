export type TimeSaleMenuOrderBy =
  | "latest"
  | "viewCountDesc"
  | "reservationRequestCountDesc"
  | "reservationAcceptedCountDesc"
  | "reservationRateDesc";

export const TIME_SALE_MENU_TREATMENT_TYPES = [
  "컷트",
  "펌",
  "매직",
  "염색",
  "탈색",
  "블랙빼기",
  "클리닉",
  "컨설팅",
  "드라이",
  "두피케어",
  "헤드스파",
  "붙임머리",
  "업스타일",
  "반영구",
  "속눈썹",
  "메이크업",
  "두피문신",
  "네일",
  "에스테틱",
] as const;
export type TimeSaleMenuTreatmentType =
  (typeof TIME_SALE_MENU_TREATMENT_TYPES)[number];

export type TimeSaleMenuSearchType =
  | "NICKNAME"
  | "NAME"
  | "PHONE"
  | "TITLE"
  | "CONTENT";

export interface ITimeSaleMenuImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

export interface ITimeSaleMenuReservationSlot {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface ITimeSaleMenuDesigner {
  id: number;
  userId: number;
  displayName: string;
  sex: string | null;
  companyName: string | null;
  address: string | null;
  address2: string | null;
  lat: number | null;
  lng: number | null;
  storeReservationNotice: string | null;
  storeReservationUrl: string | null;
  naverDesignerName: string | null;
  profilePictureURL: string | null;
  portfolioImages: unknown[];
  storeImages: unknown[];
  storeHours: unknown[];
}

export interface ITimeSaleMenuUserInfo {
  userId: number;
  displayName: string;
  role: number;
  phone: string | null;
  email: string | null;
  loginType: string | null;
  sex: string | null;
  profilePictureURL: string | null;
  cacheProfilePictureURL: string | null;
  isDeleted: boolean;
  createdAt: string;
  recentLoginTime: string | null;
  recentRealLoginTime: string | null;
  lastLoginAt: string | null;
  deletedAt: string | null;
}

export interface ITimeSaleMenu {
  id: number;
  designerInfoId: number;
  name: string;
  treatmentType: string | null;
  targetGender: string | null;
  reviewRequirement: string | null;
  cutOption: string | null;
  reservationName: string | null;
  naverReservationUrl: string | null;
  naverDesignerName: string | null;
  naverReservationNotice: string | null;
  originalPrice: number;
  discountPrice: number;
  description: string | null;
  isActive: boolean;
  viewCount: number;
  // Older server deployments omit analytics fields; missing is not zero.
  reservationRequestCount?: number;
  reservationAcceptedCount?: number;
  reservationRate?: number;
  reservationLinkClickCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  designerUserId: number;
  isReservationLinkWritten: boolean;
  favoriteCount: number;
  weeklyViewCount: number | null;
  weeklyReservationLinkClickCount: number | null;
  thumbnailImageUrl: string | null;
  images: ITimeSaleMenuImage[];
  reservationSlots: ITimeSaleMenuReservationSlot[];
  designer: ITimeSaleMenuDesigner | null;
  isFavorite: boolean;
  distance: number | null;
  userInfo: ITimeSaleMenuUserInfo | null;
}
