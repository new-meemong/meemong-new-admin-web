import { UserRoleType } from "@/models/users";

export interface IThunderAnnouncement {
  id: number;
  title: string;
  displayName: string; // 닉네임
  role: UserRoleType;
  createdAt: string; // 가입일
  deletedAt: string; // 삭제일
}
