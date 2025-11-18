import { UserRoleType } from "@/models/users";

export interface IAnnouncement {
  id: number;
  category: string;
  priceType: string;
  description: string;
  createdAt: string;
  userInfo: {
    userId: number;
    displayName: string;
    role: UserRoleType;
  };
  imgList?: AnnouncementImgListType[];
}

export interface IAnnouncementForm {
  id: number;
  category: string;
  priceType: string;
  price: number;
  description: string;
  createdAt: string;
  images: AnnouncementImageType[];
  imgList?: AnnouncementImgListType[];
}

export type AnnouncementImageType = {
  id: number;
  image: string;
};

export type AnnouncementImgListType = {
  id: number;
  imageURL: string;
};

export type AnnouncementPriceType =
  | "무료작업"
  | "무료시술"
  | "페이 모델 (모델료 지급)"
  | "재료비 발생";
