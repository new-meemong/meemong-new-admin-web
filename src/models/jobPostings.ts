export type JobPostingRoleType = "인턴" | "디자이너"

export interface IJobPosting {
  id: number;
  title: string;
  displayName: string; // 닉네임
  role: JobPostingRoleType;
  createdAt: string; // 가입일
  deletedAt: string; // 삭제일
}
