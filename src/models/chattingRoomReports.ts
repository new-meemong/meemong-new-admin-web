import {
  IReportUserInfo,
  ReportRoleFilter,
  ReportStatus,
} from "@/models/reports";

export type ChattingRoomReportStatus = ReportStatus;
export type ChattingRoomReportRoleFilter = ReportRoleFilter;
export type IChattingRoomReportUserInfo = IReportUserInfo;

export interface IChattingRoomReportImage {
  id: number;
  chattingRoomReportId: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface IChattingRoomReport {
  id: number;
  chattingRoomId: string;
  reason: string;
  reasonOtherText: string | null;
  description: string | null;
  status: ChattingRoomReportStatus;
  createdAt: string;
  updatedAt: string;
  userInfo: IChattingRoomReportUserInfo;
  ChattingRoomReportsImages: IChattingRoomReportImage[];
}
