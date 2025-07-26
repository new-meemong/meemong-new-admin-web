export type ResumeRoleType = "인턴" | "디자이너"

export interface IResume {
  id: number;
  shortDescription: string; // 제목
  displayName: string; // 닉네임
  appliedRole: ResumeRoleType;
  createdAt: string; // 가입일
  deletedAt: string; // 삭제일
}


export interface IResumeForm {
  // 공통
  id: number
  createdAt?: string

  // 필수
  profileImageUri?: string
  shortDescription?: string
  userName?: string
  preferredStoreRegions?: string
  birthday?: string
  sex?: string
  appliedRole?: string
  workType?: string
  settlementAllowance?: string
  designerLicenses?: string

  // 선택
  designerExperienceYearNumber?: string
  designerMajorExperienceCompanyName?: string
  designerMajorExperienceDuration?: string
  designerMajorExperienceRole?: string
  internMajorExperienceCompanyName?: string
  internExperienceYearNumber?: string
  internMajorExperienceDuration?: string
  internMajorExperienceRole?: string
  salesLast3MonthsAvg?: string
  completedEducationLevels?: string
  preferredOffDays?: string
  isPreferredDormitorySupport?: boolean
  preferredMonthlyEducationCount?: string
  workCycleTypes?: string
  isPreferredMealSupport?: boolean
  isPreferredParking?: boolean
  mbti?: string
  description?: string
}
