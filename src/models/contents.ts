export type ContentsCategoryType = "0" | "1" | "2" | "3" | "4"; // 0: 번개/일반, 1: 번개/프리미엄, 2: 구인공고, 3: 이력서, 4: 모집공고

export type JobCategoryType = "0" | "1" | "2"; // 0: 인턴, 1: 디자이너

export type RecruitmentType =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9";
// 0: 펌, 1: 탈색, 2: 메이크업, 3: 속눈썹, 4: 컷트, 5: 염색, 6: 클리닉, 7: 매직, 8: 드라이, 9: 붙임머리

export type CostType = "0" | "1" | "2"; // 0: 무료, 1: 재료비, 2: 모델료

export interface IContents {
  id: number;
  userInfo?: {
    userId: number; // 작성자 ID
    displayName: string; // 닉네임
    role?: string; // 유저의 직업 타입 (인턴, 디자이너)
  };
  jobPostingRole?: string; // 모집공고 구직 타입 (인턴, 디자이너)
  appliedRole?: string; // 이력서 구직 타입 (인턴, 디자이너)
  isPremium: number; // 게시물 승인 여부
  title?: string; // 제목
  postingTitle?: string; // 구인공고 제목
  shortDescription?: string; // 이력서 제목
  storeName?: string; // 업체명
  description?: string; // 모집공고 제목
  category?: string; // 모집공고 모집타입
  priceType?: string; // 모집공고 비용타입
  createdAt: string; // 작성일/시간
  deletedAt: string; // 삭제여부
}
