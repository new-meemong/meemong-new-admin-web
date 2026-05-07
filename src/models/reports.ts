import { UserRoleType } from "@/models/users";

export type ReportStatus = "미열람" | "보류" | "완료";
export type ReportRoleFilter = "1" | "2";
export type ReportManagementType = "MYPAGE" | "CHATTING_ROOM";

export interface IReportUserInfo {
  userId: number;
  displayName: string;
  role: UserRoleType;
}

export interface IReportAdminMemo {
  id: string;
  memo: string;
  status: ReportStatus;
  createdAt: string;
}
