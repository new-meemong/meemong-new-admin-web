export type BeautyApplicationImageSearchType = "NAME" | "PHONE";

export type BeautyApplicationImageOrderBy = "updatedAt" | "createdAt";

export type BeautyApplicationImageSort = "ASC" | "DESC";

export interface IBeautyApplicationImageBeautyApplicationInfo {
  beautyApplicationId: number;
  title: string;
}

export interface IBeautyApplicationImageUserInfo {
  userId: number;
  displayName: string;
  phone: string;
}

export interface IBeautyApplicationImage {
  id: number;
  image: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  beautyApplicationInfo: IBeautyApplicationImageBeautyApplicationInfo;
  userInfo: IBeautyApplicationImageUserInfo;
}
