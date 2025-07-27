import { UserRoleType } from "@/models/users";

export interface IAnnouncement {
  id: number;
  title: string;
  displayName: string; // 닉네임
  role: UserRoleType;
  createdAt: string; // 가입일
  deletedAt: string; // 삭제일
}

export interface IAnnouncementForm {
  id: number;
  category: string;
  priceType: string;
  price: number;
  description: string;
  createdAt: string;
  images: AnnouncementImageType[];
}

export type AnnouncementImageType = {
  id: number;
  image: string;
};
