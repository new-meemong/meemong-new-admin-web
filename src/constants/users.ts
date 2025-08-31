import { LoginType } from "@/models/users";

export const USER_TYPE_MAP: Record<number, string> = {
  1: "모델",
  2: "디자이너",
} as const;

export const LOGIN_TYPE_MAP: Record<LoginType, string> = {
  APPLE: "애플",
  KAKAO: "카카오",
  GOOGLE: "구글",
} as const;
