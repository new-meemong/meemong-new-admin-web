// TODO: 실제 스키마 기준으로 변경 필요

export type UserType = "MODEL" | "DESIGNER"; // 유저 타입

export type BlockType = "0" | "1" | "2"; // 0: 전체, 1: 차단, 2: 탈퇴

export type JoinType = "0" | "1"; // 0: 일반 가입, 1: SNS 가입

export type BlockInfo = {
  isBlocked: boolean;
  blockedAt: string;
  description: string;
};

export interface IUser {
  id: number;
  userType: UserType; // 유형
  nickname: string; // 닉네임
  createdAt: string; // 가입일
  recentLoggedInAt: string; // 최근 접속일
  isWithdraw: boolean; // 탈퇴여부
  isBlocked: boolean; // 차단여부
}

export interface IUserForm extends IUser {
  userNumber: string; // 회원번호
  name: string; // 이름
  joinType: JoinType; // 가입형태
  profileUrl: string; // 프로필 url
  phoneNumber: string; // 전화번호
  email: string; // 이메일
  intro: string; // 소개
  pictureUrlList: { src: string; title: string }[]; // 사진 정보 목록
}

export interface IUserBlockDetail {
  isBlocked: boolean;
  blockInfoList: BlockInfo[];
}
