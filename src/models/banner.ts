export interface IBanner {
  id: number;
  userType: string;
  company: string;
  bannerType: string;
  displayType: string;
  imageUrl: string;
  redirectUrl: string;
  createdAt: string;
  endAt?: string;
}

export interface IBannerForm {
  id: number;
  userType: string;
  company: string;
  bannerType: string;
  displayType: string;
  imageUrl: string;
  redirectUrl: string;
  createdAt: string;
  endAt?: string;
}
