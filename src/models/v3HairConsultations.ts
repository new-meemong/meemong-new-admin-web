export type V3ConsultationType = "QUICK" | "DEEP";
export type V3Visibility = "ALL" | "VISIBLE" | "WITHDRAWN";
export interface V3ConsultationUser {
  id: number;
  displayName: string | null;
  phone: string | null;
  deletedAt: string | null;
}
export interface V3RatingStatistics {
  ratedAnswerCount: number;
  averageRating: number | null;
  ratingCountList: { rating: number; count: number }[];
}
export type V3PaymentType = "STORE" | "MONG";
export interface V3Purchase {
  id: number;
  paymentType: V3PaymentType;
  /** 구매 당시 답변 수 */
  answerCount: number;
  paymentAmountKRW: number | null;
  mongAmount: number | null;
  answerIdList: number[];
}
export interface V3DeepStatistics {
  payment: {
    isPaid: boolean;
    payableAnswerCount: number;
    paidAnswerCount: number;
    paymentRate: number | null;
    /** 검증 성공·미환불 구매, ID 내림차순 */
    purchaseList: V3Purchase[];
  };
  /** 작성자의 실제 열람 집계(구매 여부와 독립, 무료·숨김 답변 포함) */
  read: {
    answerCount: number;
    readAnswerCount: number;
    isAllRead: boolean;
  };
  rating: V3RatingStatistics;
}
/** 상담 전체 또는 개별 답변의 실제 몽 차감 내역(페이지와 무관). */
export interface V3QuickStatistics {
  totalUsedMongAmount: number;
  refundedUsedMongAmount: number;
  netUsedMongAmount: number;
  historyList: {
    mongOrderId: number;
    v3HairConsultationAnswerId: number;
    designerUserId: number;
    usedMongAmount: number;
    refundAt: string | null;
    createdAt: string;
  }[];
}
export interface V3ConsultationListItem {
  id: number;
  userId: number;
  consultationType: V3ConsultationType;
  customerType: string;
  /** 전체 회차의 유료·무료·숨김 답변 수(페이지 크기와 무관) */
  answerCount: number;
  createdAt: string;
  updatedAt: string;
  withdrawnAt: string | null;
  user: V3ConsultationUser | null;
  deepStatistics: V3DeepStatistics | null;
  quickStatistics: V3QuickStatistics | null;
}
export interface V3ConsultationEditable {
  aspirationDescription: string | null;
  additionalInquiry: string | null;
  treatmentHistoryDescription: string | null;
  extensionPiecesDescription: string | null;
  desiredDateDescription: string | null;
  isAllowedStyleVoting: boolean;
}
export interface V3ConsultationImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
  type?: string;
  subType?: string | null;
  source?: string;
}
export interface V3ConsultationDetail
  extends V3ConsultationListItem,
    V3ConsultationEditable {
  desiredDateType: string;
  styleCertainty: string | null;
  treatmentCategory: string | null;
  wantedTreatmentList: string[];
  additionalTreatmentList: string[];
  unwantedTreatmentList: string[];
  aspirationImageTypeList: string[];
  hairConcernList: string[];
  concernedAreaList: string[];
  stylingMethodList: string[];
  preferredRegionList: string[];
  anyTreatment: boolean;
  noAdditionalTreatment: boolean;
  noUnwantedTreatment: boolean;
  hasExtensionPieces: boolean | null;
  sex: string;
  hairLength: string | null;
  hairTexture: string;
  hairThickness: string | null;
  skinBrightness: string | null;
  personalColor?: string | null;
  imageList: V3ConsultationImage[];
  treatmentHistoryList: {
    id: number;
    treatmentType: string;
    treatmentDate: string;
    isSelf: boolean;
    treatmentArea: string | null;
    decolorizationCount: number | null;
  }[];
  roundList: {
    id: number;
    roundNumber: number;
    targetAnswerCount: number;
    acceptedAnswerCount: number;
    openedAt: string;
    expiresAt: string;
    closedAt: string | null;
    closeReason: string | null;
  }[];
}
export interface V3AnswerReview {
  rating: number;
  content: string | null;
  ratedAt: string;
}
export interface V3ConsultationAnswer {
  id: number;
  v3HairConsultationId: number;
  designerUserId: number;
  answerType: string;
  title: string;
  description: string;
  faceShape: string | null;
  bangsTypeList: string[];
  hairLengthList: string[];
  hairLayerList: string[];
  hairCurlList: string[];
  priceType: "SINGLE" | "RANGE";
  price: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  accessType: string;
  submittedAt: string;
  hiddenAt: string | null;
  quickStatistics: V3QuickStatistics | null;
  deepStatus: {
    isPaid: boolean;
    /** 유효 구매 수단(중복 없음), 미구매 시 빈 배열 */
    paymentTypeList: V3PaymentType[];
    /** 작성자의 실제 열람 여부(미몽패스 무료 열람 포함) */
    isRead: boolean;
    firstReadAt: string | null;
    lastReadAt: string | null;
    review: V3AnswerReview | null;
  } | null;
}
export interface V3ConsultationAnswerDetail extends V3ConsultationAnswer {
  imageList: V3ConsultationImage[];
  reviewList: (V3AnswerReview & { id: number; hiddenAt: string | null })[];
  designerUser: V3ConsultationUser | null;
}
