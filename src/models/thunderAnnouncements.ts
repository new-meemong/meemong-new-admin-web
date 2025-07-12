import { UserRoleType } from "@/models/users";

export type ThunderAnnouncementType =
  | "NORMAL"
  | "PREMIUM"
  | "PREMIUM_APPROVED"
  | "PREMIUM_UNAPPROVED"
  | "PREMIUM_REJECTED";

export interface IThunderAnnouncement {
  id: number;
  title: string;
  displayName: string; // 닉네임
  role: UserRoleType;
  createdAt: string; // 가입일
  deletedAt: string; // 삭제일
}
