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
