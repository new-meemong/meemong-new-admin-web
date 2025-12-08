export type UserRoleType = 1 | 2 | 3 | 4; // 유저 타입

export type BlockType = "0" | "1" | "2"; // 0: 전체, 1: 차단, 2: 탈퇴

export type LoginType = "APPLE" | "KAKAO" | "GOOGLE";

export type BlockInfoType = {
  isBlocked: boolean;
  blockedAt: string;
  description: string;
};

export type UserPhotoType = {
  id: number;
  s3Path: string;
  fileType: string;
};

export interface IUser {
  id: number;
  role: UserRoleType; // 유형
  displayName: string; // 닉네임
  createdAt: string; // 가입일
  recentLoginTime: string; // 최근 접속일
  isWithdraw: boolean; // 탈퇴여부
  isBlocked: boolean; // 차단여부
  profilePictureURL: string; // 프로필 사진
  cacheProfilePictureURL?: string; // 캐시된 프로필 사진
  isBreakTime: boolean; // 휴식 시간 여부
  isRecommended: boolean; // 추천 여부
}

export interface IUserForm extends IUser {
  name: string; // 이름
  loginType: LoginType; // 가입형태
  profilePictureURL: string; // 프로필 url
  phone: string; // 전화번호
  email: string; // 이메일
  description: string; // 소개
  userPhotos: UserPhotoType[]; // 사진 정보 목록
}

export interface IUserBlockInfo {
  isBlocked: boolean;
  description: string;
  createdAt: string;
}
