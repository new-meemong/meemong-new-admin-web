import {
  IReportAdminMemo,
  IReportUserInfo,
  ReportRoleFilter,
  ReportStatus,
} from "@/models/reports";

export type UserReportStatus = ReportStatus;
export type UserReportRoleFilter = ReportRoleFilter;
export type IUserReportUserInfo = IReportUserInfo;

export interface IUserReportImage {
  id: number;
  userReportId: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUserReport {
  id: number;
  reportedUserId: number;
  reason: string;
  reasonOtherText: string | null;
  description: string | null;
  status: UserReportStatus;
  createdAt: string;
  updatedAt: string;
  userInfo: IUserReportUserInfo;
  UserReportsImages: IUserReportImage[];
  reportedUserInfo?: IUserReportUserInfo;
}

export type IUserReportAdminMemo = IReportAdminMemo;
