import { UserRoleType } from "@/models/users";

export type ThunderAnnouncementType =
  | "NORMAL"
  | "PREMIUM"
  | "PREMIUM_APPROVED"
  | "PREMIUM_UNAPPROVED"
  | "PREMIUM_REJECTED";

export type ThunderAnnouncmentPremiumType = 0 | 1; // 0: 일반, 1: 프리미엄

export type ThunderAnnouncementUpdatePremiumType = 0 | 2; // 0: 일반, 2: 프리미엄 보류

export type ThunderAnnouncementPriceType =
  | "무료시술"
  | "페이 모델 (모델료 지급)"
  | "재료비 발생";

export type ThunderAnnouncementConditionType =
  | "평일 오전"
  | "평일 오후"
  | "주말 오후"
  | "주말 오전";

export type ThunderAnnouncementAreaType = {
  sido: string;
  siGunGu?: string;
};

export type ThunderAnnouncementImageType = {
  id: number;
  imgUrl: string;
};

export type ThunderAnnouncementImgListType = {
  id: number;
  imageURL: string;
};

export type ThunderAnnouncementLocationType = {
  id: number;
  upperRegion: string;
  lowerRegion: string;
};

export type ThunderAnnouncementTimeCondition = {
  id: number;
  conditionType: string;
};

export interface IThunderAnnouncement {
  id: number;
  title: string;
  isPremium: number;
  description: string;
  createdAt: string;
  deletedAt: string | null;
  userInfo: {
    userId: number;
    displayName: string;
    role: UserRoleType;
  };
}

export interface IThunderAnnouncementForm {
  id: number;
  title: string;
  isPremium: ThunderAnnouncmentPremiumType;
  selectedServices: string[];
  priceType: string;
  createdAt: string;
  description: string;
  images: ThunderAnnouncementImageType[];
  imgList?: ThunderAnnouncementImgListType[];
  locations: ThunderAnnouncementLocationType[];
  timeConditions: ThunderAnnouncementTimeCondition[];
}
