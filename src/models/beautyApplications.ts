import { UserRoleType } from "@/models/users";

export type BeautyApplicationCategoryType =
  | "드라이"
  | "매직"
  | "메이크업"
  | "반영구"
  | "붙임머리"
  | "속눈썹"
  | "스타일링"
  | "염색"
  | "컷트"
  | "클리닉"
  | "탈색"
  | "펌"
  | "두피케어"
  | "네일"
  | "두피문신";

export type BeautyApplicationPriceType =
  | "무료시술"
  | "재료비 발생"
  | "페이 모델 (모델료 지급)";

export type ReviewType =
  | "네이버 리뷰"
  | "카카오맵 리뷰"
  | "구글 맵 리뷰"
  | "인스타 사진 게시물 & 태그"
  | "인스타 릴스"
  | "틱톡 영상"
  | "유튜브 영상"
  | "블로그 후기";

export type RecruitGenderType = "성별 무관" | "여성모델" | "남성모델";
export type ShootingType =
  | "촬영 없음"
  | "헤어 촬영"
  | "모델 촬영"
  | "연출 촬영"
  | "상관 없음";
export type WorkType = "정규직" | "스페어(알바)" | "상관없음";

export type BeautyApplicationImgType = {
  id: number;
  imageURL: string;
};

export interface IBeautyApplication {
  id: number;
  title: string | null;
  category: string;
  categories: string[];
  reviewTypes: ReviewType[];
  exceptMinutes: number | null;
  recruitGender: RecruitGenderType | null;
  shootingType: ShootingType | null;
  workType: WorkType | null;
  priceType: BeautyApplicationPriceType;
  description: string;
  createdAt: string;
  userInfo: {
    userId: number;
    displayName: string;
    role: UserRoleType;
  };
  imgList: BeautyApplicationImgType[];
}

export interface IBeautyApplicationDetail {
  id: number;
  title: string | null;
  createdAt: string;
  category: string;
  categories: string[];
  reviewTypes: ReviewType[];
  exceptMinutes: number | null;
  recruitGender: RecruitGenderType | null;
  shootingType: ShootingType | null;
  workType: WorkType | null;
  price: number;
  description: string;
  priceType: BeautyApplicationPriceType;
  activated: boolean;
  appointmentTime: string;
  faceReveal: boolean;
  userInfo: {
    userId: number;
    displayName: string;
    role: UserRoleType;
    phone: string;
  };
  imgList: BeautyApplicationImgType[];
}
