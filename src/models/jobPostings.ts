export type JobPostingRoleType = "인턴" | "디자이너";

export interface IJobPosting {
  id: number;
  title: string;
  displayName: string; // 닉네임
  role: JobPostingRoleType;
  createdAt: string; // 가입일
  deletedAt: string; // 삭제일
}

export interface IJobPostingForm {
  // 공통
  id: number;
  createdAt?: string;

  // 기본정보
  role?: string;
  postingTitle?: string;
  storeAddress?: string;
  postingRegions?: string;
  monthlyEducationCount?: number;
  availableOffDays?: string;
  internSalary?: string;
  settlementAllowance?: number;
  incentive?: number;

  // 구인정보
  sex?: string;
  age?: string;
  designerLicense?: boolean;
  workType?: string;
  workCycleTypes?: string;
  designerExperienceYearNumber?: string;
  internExperienceYearNumber?: string;
  isExistedFourInsurances?: boolean;
  isExistedRetirementPay?: boolean;
  salesLast3MonthsAvg?: number;

  // 매장정보
  storeTypes?: string;
  employeeCount?: number;
  isExistedInternSystem?: boolean;
  storeInteriorRenovationAgo?: string;
  isExistedEducationSupport?: boolean;
  designerPromotionPeriod?: string;
  isExistedMealSupport?: boolean;
  mealTime?: string;
  isExistedProductSupport?: boolean;
  isExistedDormitorySupport?: boolean;
  salesCommission?: number;
  subwayAccessibility?: string;
  adminSex?: string;
  adminAge?: string;
  leaveDayCount?: number;
  parkingSpotCount?: number;
  isExistedCleaningSupplier?: boolean;
  isExistedTowelSupplier?: boolean;
  isOnsiteManager?: boolean;
  basicCutPrice?: number;

  // 기타
  startWorkTime?: string;
  endWorkTime?: string;
  storeUrl?: string;
  mainHairDye?: string;
  description?: string;
  storeImages?: { id: number; uri: string }[];
}
