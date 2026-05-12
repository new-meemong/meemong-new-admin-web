import { BannerType, BannerUserType } from "@/constants/banner";

export interface IBanner {
  id: number;
  userType: BannerUserType;
  bannerType: BannerType;
  displayType: string;
  imageUrl: string;
  redirectUrl?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  endAt?: string;
}

export interface IBannerForm {
  id?: number;
  userType: BannerUserType;
  bannerType: BannerType;
  displayType?: string;
  imageUrl: string;
  redirectUrl?: string;
  createdAt?: string;
  endAt?: string;
}
