import { JoinType, UserType } from "@/models/user";

export const USER_TYPE_MAP: Record<UserType, string> = {
  "0": "전체",
  "1": "모델",
  "2": "디자이너",
} as const;

export const JOIN_TYPE_MAP: Record<JoinType, string> = {
  "0": "일반 가입",
  "1": "SNS 가입",
} as const;
