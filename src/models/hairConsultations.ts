export interface IHairConsultationListItem {
  id: number;
  title: string;
  content: string;
  desiredCostPrice: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  contentUpdatedAt: string;
  isFavorited: boolean;
  isRead: boolean;
  hairConsultationCreateUserRegion: string | null;
  hairConsultationCreateUserId: number;
}

export interface IHairConsultationImage {
  imageUrl: string;
}

export interface IHairConsultationMyImage {
  imageUrl: string;
  subType: string;
}

export interface IHairConsultationDetail {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  contentUpdatedAt: string;
  desiredCostPrice: number | null;
  texture: string | null;
  personalColor: string | null;
  aspirationImageTypes: string[];
  aspirationImageDescription: string | null;
  hairConsultTreatmentDescription: string | null;
  treatment: {
    id: number;
    treatmentType: string;
    treatmentDate: string | null;
    isSelf: boolean;
    treatmentArea: string | null;
    decolorizationCount: number | null;
    displayOrder: number;
  } | null;
  aspirationImages: IHairConsultationImage[];
  myImages: IHairConsultationMyImage[];
  isFavorited: boolean;
  isRead: boolean;
  hairConsultationCreateUserRegion: string | null;
  hairConsultationCreateUserId: number;
}

export interface IHairConsultationCommentUser {
  userId: number;
  name: string;
  profilePictureURL: string | null;
  address: string | null;
  companyName: string | null;
  role: number;
}

export interface IHairConsultationReply {
  id: number;
  content: string;
  commentType: string;
  createdAt: string;
  updatedAt: string;
  user: IHairConsultationCommentUser;
}

export interface IHairConsultationComment {
  id: number;
  content: string;
  commentType: string;
  createdAt: string;
  updatedAt: string;
  user: IHairConsultationCommentUser;
  replies: IHairConsultationReply[];
}

export interface IHairConsultationAnswerUser {
  id: number;
  displayName: string;
  profilePictureURL: string | null;
  role: number;
}

export interface IHairConsultationAnswer {
  id: number;
  faceShape: string | null;
  isFaceShapeAdvice: boolean;
  bangsTypes: string[];
  isBangsTypeAdvice: boolean;
  hairLengths: string[];
  isHairLengthAdvice: boolean;
  hairLayers: string[];
  isHairLayerAdvice: boolean;
  hairCurls: string[];
  isHairCurlAdvice: boolean;
  title: string;
  minPrice: number | null;
  maxPrice: number | null;
  price: number | null;
  priceType: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  hairConsultationId: number;
  userId: number;
  styleImages: string[];
  user: IHairConsultationAnswerUser;
  mongConsumePreset?: null;
}
