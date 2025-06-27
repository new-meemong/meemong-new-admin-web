import { UserRoleType } from "@/models/user";

export type ContentsCategoryType = "0" | "1" | "2" | "3" | "4"; // 0: 번개/일반, 1: 번개/프리미엄, 2: 구인공고, 3: 이력서, 4: 모집공고

export type ApproveType = "0" | "1" | "2"; // 0: 승인, 1: 미승인, 2: 승인거절

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
// 0: 펌, 1: 탈색, 2: 메이크업, 3: 속눈썹, 4: 커트, 5: 염색, 6: 클리닉, 7: 매직, 8: 드라이, 9: 붙임머리

export type CostType = "0" | "1" | "2"; // 0: 무료, 1: 재료비, 2: 모델료

export interface IContents {
  id: number;
  userId: number; // 작성자 ID
  nickname: string; // 닉네임
  role: UserRoleType; // 작성자 타입
  title: string; // 제목
  company?: string; // 업체명
  noticeId?: number; // 게시물 ID
  jobId?: number; // 구인공고 ID
  resumeId?: number; // 이력서 ID
  recruitmentId?: number; // 모집공고 ID
  jobCategory?: JobCategoryType; // 구직타입
  recruitment?: RecruitmentType; // 모집타입
  costType?: CostType; // 비용타입
  createdAt: string; // 작성일/시간
  isDeleted: boolean; // 삭제여부
  isApproved: boolean; // 승인여부
}
