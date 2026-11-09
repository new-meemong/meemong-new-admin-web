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
export interface V3DeepStatistics {
  payment: {
    isPaid: boolean;
    payableAnswerCount: number;
    paidAnswerCount: number;
    paymentRate: number | null;
  };
  rating: V3RatingStatistics;
}
export interface V3ConsultationStatistics {
  consultationCount: number;
  paidConsultationCount: number;
  paymentRate: number | null;
  rating: V3RatingStatistics;
}
export interface V3ConsultationListItem {
  id: number;
  userId: number;
  consultationType: V3ConsultationType;
  customerType: string;
  createdAt: string;
  updatedAt: string;
  withdrawnAt: string | null;
  user: V3ConsultationUser | null;
  deepStatistics: V3DeepStatistics | null;
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
  deepStatus: { isPaid: boolean; review: V3AnswerReview | null } | null;
}
export interface V3ConsultationAnswerDetail extends V3ConsultationAnswer {
  imageList: V3ConsultationImage[];
  reviewList: (V3AnswerReview & { id: number; hiddenAt: string | null })[];
  designerUser: V3ConsultationUser | null;
}
