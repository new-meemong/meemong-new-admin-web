// TODO: 실제 스키마 기준으로 변경 필요

export type UserRoleType = 1 | 2; // 유저 타입

export type BlockType = "0" | "1" | "2"; // 0: 전체, 1: 차단, 2: 탈퇴

export type JoinType = "0" | "1"; // 0: 일반 가입, 1: SNS 가입

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
}

export interface IUserForm extends IUser {
  name: string; // 이름
  joinType: JoinType; // 가입형태
  profilePictureURL: string; // 프로필 url
  phone: string; // 전화번호
  email: string; // 이메일
  description: string; // 소개
  userPhotos: UserPhotoType[]; // 사진 정보 목록
}

export interface IUserBlockDetail {
  isBlocked: boolean;
  blockInfoList: BlockInfoType[];
}
