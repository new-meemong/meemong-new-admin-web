import { UserRoleType } from "@/models/users";

export type ThunderAnnouncementType =
  | "NORMAL"
  | "PREMIUM"
  | "PREMIUM_APPROVED"
  | "PREMIUM_UNAPPROVED"
  | "PREMIUM_REJECTED";

export type ThunderAnnouncmentPremiumType = 0 | 1; // 0: 일반, 1: 프리미엄

export type ThunderAnnouncementImageType = {
  id: number;
  imgUrl: string;
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
  displayName: string; // 닉네임
  role: UserRoleType;
  createdAt: string; // 가입일
  deletedAt: string; // 삭제일
}

export interface IThunderAnnouncementForm {
  id: number;
  title: string;
  isPremium: ThunderAnnouncmentPremiumType;
  selectedServices: string;
  priceType: string;
  createdAt: string;
  description: string;
  images: ThunderAnnouncementImageType[];
  locations: ThunderAnnouncementLocationType[];
  timeConditions: ThunderAnnouncementTimeCondition[];
}
