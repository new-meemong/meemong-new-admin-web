import { DeclarationStatusType } from "@/constants/declaration";

export interface IDeclaration {
  id: number;
  reporter: string; // 신고자
  respondent: string; // 피신고자
  content: string; // 신고내용
  status: DeclarationStatusType; // 처리상태
  declarationAt: string; // 신고일자
  reactAt?: string; // 처리일자
}

export interface IDeclarationForm extends IDeclaration {
  reporterName: string; // 신고자 이름
  reporterUid: string; // 신고자 uid
  respondentName: string; // 피신고자 이름
  respondentUid: string; // 피신고자 uid
  declarationImageUrlList?: string[]; // 신고 이미지 URL
  location: string; // 신고 위치
  memo?: string; // 메모
}
