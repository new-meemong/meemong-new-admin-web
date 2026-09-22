import { LoginType, UserListRoleType } from "@/models/users";

export const USER_LIST_ROLE = {
  MODEL: 1,
  DESIGNER: 2,
} as const satisfies Record<string, UserListRoleType>;

export const USER_TYPE_MAP: Record<number, string> = {
  [USER_LIST_ROLE.MODEL]: "모델",
  [USER_LIST_ROLE.DESIGNER]: "디자이너",
} as const;

export const LOGIN_TYPE_MAP: Record<LoginType, string> = {
  APPLE: "애플",
  KAKAO: "카카오",
  GOOGLE: "구글",
} as const;
