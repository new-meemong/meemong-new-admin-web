export type ResumeRoleType = "인턴" | "디자이너"

export interface IResume {
  id: number;
  shortDescription: string; // 제목
  displayName: string; // 닉네임
  appliedRole: ResumeRoleType;
  createdAt: string; // 가입일
  deletedAt: string; // 삭제일
}
