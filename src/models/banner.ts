export type BannerLocationType = "0" | "1"; // 0: 일반, 1: 모델메인상단

export interface IBanner {
  id: number;
  companyName: string;
  bannerImageUrl: string;
  location: BannerLocationType;
  createdAt: string;
  endAt: string;
  clickCount: number;
}

export interface IBannerForm {
  id: number;
  companyName: string;
  createdAt: string;
  endAt: string;
  location: BannerLocationType;
  bannerImageUrl: string;
  linkUrl: string;
}
