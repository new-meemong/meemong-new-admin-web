export interface IBanner {
  id: number;
  userType: string;
  company: string;
  bannerType: string;
  displayType: string;
  imageUrl: string;
  redirectUrl: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  endAt?: string;
}

export interface IBannerForm {
  id?: number;
  company: string;
  userType: string;
  bannerType: string;
  displayType?: string;
  imageUrl: string;
  redirectUrl: string;
  createdAt?: string;
  endAt?: string;
}
