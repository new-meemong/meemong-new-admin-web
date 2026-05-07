import {
  IUserReport,
  UserReportRoleFilter,
  UserReportStatus,
} from "@/models/userReports";
import { ReportManagementType } from "@/models/reports";

export type UserReportStatusWithAll = UserReportStatus | "ALL";
export type UserReportRoleWithAll = UserReportRoleFilter | "ALL";
export type UserReportReasonFilter =
  | "타플랫폼"
  | "허위기재"
  | "불건전 채팅"
  | "과도한 재료비"
  | "노쇼"
  | "지각/취소"
  | "초상권"
  | "불이행"
  | "촬영거부"
  | "기타";
export type UserReportReasonWithAll = UserReportReasonFilter | "ALL";

export const USER_REPORT_STATUS_OPTIONS: {
  value: UserReportStatusWithAll;
  label: string;
}[] = [
  { value: "ALL", label: "전체" },
  { value: "완료", label: "완료" },
  { value: "보류", label: "보류" },
  { value: "미열람", label: "미열람" },
];

export const USER_REPORT_STATUS_CHANGE_OPTIONS: {
  value: UserReportStatus;
  label: string;
}[] = [
  { value: "미열람", label: "미열람" },
  { value: "보류", label: "보류" },
  { value: "완료", label: "완료" },
];

export const USER_REPORT_ROLE_OPTIONS: {
  value: UserReportRoleWithAll;
  label: string;
}[] = [
  { value: "ALL", label: "전체" },
  { value: "2", label: "디자이너" },
  { value: "1", label: "모델" },
];

export const MODEL_REPORT_REASON_OPTIONS: {
  value: UserReportReasonWithAll;
  label: string;
}[] = [
  { value: "ALL", label: "전체" },
  { value: "타플랫폼", label: "타플랫폼" },
  { value: "허위기재", label: "허위기재" },
  { value: "불건전 채팅", label: "불건전 채팅" },
  { value: "과도한 재료비", label: "과도한 재료비" },
  { value: "노쇼", label: "노쇼" },
  { value: "지각/취소", label: "지각/취소" },
  { value: "초상권", label: "초상권" },
  { value: "기타", label: "기타" },
];

export const DESIGNER_REPORT_REASON_OPTIONS: {
  value: UserReportReasonWithAll;
  label: string;
}[] = [
  { value: "ALL", label: "전체" },
  { value: "타플랫폼", label: "타플랫폼" },
  { value: "허위기재", label: "허위기재" },
  { value: "불건전 채팅", label: "불건전 채팅" },
  { value: "노쇼", label: "노쇼" },
  { value: "지각/취소", label: "지각/취소" },
  { value: "불이행", label: "불이행" },
  { value: "촬영거부", label: "촬영거부" },
  { value: "기타", label: "기타" },
];

export const ALL_REPORT_REASON_OPTIONS: {
  value: UserReportReasonWithAll;
  label: string;
}[] = [
  { value: "ALL", label: "전체" },
  { value: "타플랫폼", label: "타플랫폼" },
  { value: "허위기재", label: "허위기재" },
  { value: "불건전 채팅", label: "불건전 채팅" },
  { value: "과도한 재료비", label: "과도한 재료비" },
  { value: "노쇼", label: "노쇼" },
  { value: "지각/취소", label: "지각/취소" },
  { value: "초상권", label: "초상권" },
  { value: "불이행", label: "불이행" },
  { value: "촬영거부", label: "촬영거부" },
  { value: "기타", label: "기타" },
];

export const USER_REPORT_REASON_LABEL_MAP: Record<
  string,
  UserReportReasonFilter
> = {
  "타 플랫폼 이용 유도": "타플랫폼",
  "가격, 프로필 등의 허위기재": "허위기재",
  "프로필 등의 허위기재": "허위기재",
  "불건전한 채팅": "불건전 채팅",
  "과도한 재료비 요구": "과도한 재료비",
  "노쇼(No-Show)": "노쇼",
  "지각, 일방적 예약취소": "지각/취소",
  "협의되지 않은 초상권 이미지 사용": "초상권",
  "사전 협의 내용 불이행": "불이행",
  "촬영 거부": "촬영거부",
  "기타 (직접입력)": "기타",
  기타: "기타",
};

export const USER_REPORT_MEMO_STORAGE_KEY = "meemong-user-report-memos";
export const CHATTING_ROOM_REPORT_MEMO_STORAGE_KEY =
  "meemong-chatting-room-report-memos";

export const REPORT_MANAGEMENT_OPTIONS: {
  value: ReportManagementType;
  label: string;
}[] = [
  { value: "MYPAGE", label: "마이페이지" },
  { value: "CHATTING_ROOM", label: "채팅방" },
];

export const CHATTING_ROOM_ADMIN_URL =
  "https://meemong-chat-admin.vercel.app/latest-model-matching-chat-list";

export function getUserReportReasonLabel(
  report?: Pick<IUserReport, "reason"> | { reason?: string },
): UserReportReasonFilter | string {
  if (!report?.reason) return "-";
  return USER_REPORT_REASON_LABEL_MAP[report.reason] ?? report.reason;
}

export function getChattingRoomAdminUrl(chattingRoomId?: string) {
  if (!chattingRoomId) return CHATTING_ROOM_ADMIN_URL;

  return `${CHATTING_ROOM_ADMIN_URL}/${encodeURIComponent(chattingRoomId)}`;
}

export function getUserReportReasonOptions(role: UserReportRoleWithAll) {
  if (role === "ALL") return ALL_REPORT_REASON_OPTIONS;
  return role === "1"
    ? MODEL_REPORT_REASON_OPTIONS
    : DESIGNER_REPORT_REASON_OPTIONS;
}
