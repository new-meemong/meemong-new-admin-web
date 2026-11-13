import type { UserBrandInfoType } from "./users";

export type UserProfileImage = { id: number; imageURL: string };
export type UserProfilePost = {
  id: number;
  consultationType: "DEEP" | "QUICK";
  customerType: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  withdrawnAt: string | null;
  detailUrl: string;
};
export type UserModelInfo = {
  id: number | null;
  userId: number;
  address: string | null;
  paymodel: string | null;
  modelImageList: UserProfileImage[];
  isHairReserving: boolean | null;
  isBeautyReserving: boolean | null;
  hairLength: string | null;
  hairTexture: string | null;
  hairConcernList: string[];
  skinBrightness: string | null;
  personalColor: string | null;
  lastHairInfoUpdatedAt: string | null;
  modelInfoShootingType: {
    id: number;
    shootingType: string | null;
    shootingRange: string | null;
    description: string | null;
  } | null;
  modelInfoTreatmentHistoryList: {
    id: number;
    treatmentType: string | null;
    treatmentDate: string | null;
    isSelf: boolean | number | null;
    treatmentArea: string | null;
    decolorizationCount: number | null;
    displayOrder: number;
  }[];
  modelInfoWantedStyle: {
    id: number;
    description: string | null;
    updatedAt: string | null;
    imageList: { id: number; imageUrl: string; displayOrder: number }[];
  } | null;
  styleList: string[];
  facialList: string[];
  modelInfoHopePrice: {
    id: number;
    priceType: string | null;
    price: number | null;
  } | null;
  modelInfoReviewType: {
    id: number;
    reviewTypeList: string[];
    reviewTypeDescription: string | null;
    description: string | null;
  } | null;
  hairConsultationList: UserProfilePost[];
  quickMatchingList: UserProfilePost[];
};
export type UserModelTreatmentMenu = {
  id: number;
  title: string | null;
  category: string | null;
  categoryList: string[];
  price: number | null;
  priceType: string | null;
  shootingType: string | null;
  shootingUseType: string | null;
  reviewTypeList: string[];
  reviewTypeDescription: string | null;
  description: string | null;
  activated: boolean | number | null;
  imageList: (UserProfileImage & {
    displayOrder?: number;
    source: "BeautyApplicationImages" | "UserFiles";
  })[];
  detailUrl: string;
};
export type UserTimeSaleMenu = {
  id: number;
  name: string | null;
  treatmentType: string | null;
  originalPrice: number | null;
  discountPrice: number | null;
  description: string | null;
  isActive: boolean | null;
  detailUrl: string;
};
export type UserDesignerInfo = {
  id: number | null;
  userId: number;
  description: string | null;
  brandId: number | null;
  Brand: UserBrandInfoType | null;
  companyName: string | null;
  storeTypeList: string[];
  address: string | null;
  address2: string | null;
  lat: number | null;
  lng: number | null;
  storelink: string | null;
  storeReservationNotice: string | null;
  storeReservationPlatformName: string | null;
  storeReservationUrl: string | null;
  portfolioImageList: UserProfileImage[];
  shopImageList: UserProfileImage[];
  designerInfoStoreHourList: {
    id: number;
    dayOfWeek: string;
    isOpen: boolean;
    openTime: string | null;
    closeTime: string | null;
  }[];
  designerInfoReservationSlotList: {
    id: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
  modelTreatmentMenuList: UserModelTreatmentMenu[];
  timeSaleMenuList: UserTimeSaleMenu[];
};
export type UserProfileDetailTarget = {
  kind: "model-treatment" | "time-sale" | "consultation";
  id: number;
};
