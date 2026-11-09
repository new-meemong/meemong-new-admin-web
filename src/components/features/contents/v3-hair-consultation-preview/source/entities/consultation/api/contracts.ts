export type HairThickness =
  | '매우 가는 모발'
  | '가는 모발'
  | '보통'
  | '굵은 모발'
  | '매우 굵은 모발';
export type FaceShape =
  | '계란형'
  | '긴 얼굴형'
  | '네모형'
  | '둥근형'
  | '땅콩형'
  | '마름모형'
  | '육각형'
  | '하트형';
export type HairCurl = '스트레이트' | 'J컬' | 'C컬' | 'CS컬' | 'S컬' | 'SS컬';
export type HairLayer = '원랭스' | '로우 레이어드' | '미디엄 레이어드' | '하이 레이어드';
export type CustomerType =
  | 'CONSULTING'
  | 'PARTIAL_STYLE'
  | 'PARTIAL_COLOR'
  | 'QUOTE_EXTENSION'
  | 'QUOTE_OTHER';
export type DesiredDateType = 'ASAP' | 'WITHIN_WEEK' | 'NEGOTIABLE' | 'CUSTOM';
export type TreatmentHistory = {
  treatmentType: string;
  treatmentDate: string;
  isSelf?: boolean;
  treatmentArea?: string;
  decolorizationCount?: number;
};
export type CurrentImageSubType = 'FRONT' | 'SIDE' | 'HAIR';
export type CurrentImageInput = string | { imageUrl: string; subType?: CurrentImageSubType | null };
export type RequestSettings = {
  enabled: boolean;
  sex: '남자' | '여자' | null;
  treatments: string[];
  localOnly: boolean;
};
export type ConsultationCustomer = {
  displayName: string | null;
  profilePictureURL: string | null;
  region: string | null;
  distanceM: number | null;
  profileImages: { imageUrl: string }[];
};
export type QuestionInput = {
  consultationType: 'QUICK' | 'DEEP';
  isAllowedStyleVoting?: boolean; // DEEP 스타일 투표 동의. false도 유효한 선택
  customerType?: CustomerType; // 생략 권장. 서버가 분류하며 불일치 시 400
  desiredDateType: DesiredDateType;
  desiredDateDescription?: string; // CUSTOM 필수, 1~30자
  styleCertainty?: 'FIXED' | 'PARTIAL'; // QUICK 필수. UNKNOWN은 DEEP로 전환 후 제출
  treatmentCategory?: 'STYLE' | 'COLOR' | 'EXTENSION'; // QUICK 필수
  wantedTreatments?: string[];
  anyTreatment?: boolean;
  additionalTreatments?: string[];
  noAdditionalTreatment?: boolean;
  unwantedTreatments?: string[];
  noUnwantedTreatment?: boolean;
  aspirationImageTypes?: string[];
  aspirationDescription?: string;
  hairConcerns?: string[];
  concernedAreas?: string[];
  stylingMethods?: string[];
  hairThickness: HairThickness; // metadata.questionOptions.hairThickness
  preferredRegions: string[]; // 최소 1개
  currentImages?: CurrentImageInput[]; // 최대 3개
  desiredImages?: (string | { imageUrl: string })[]; // 최대 6개
  hasExtensionPieces?: boolean;
  extensionPiecesDescription?: string;
  treatmentHistories?: TreatmentHistory[]; // 최대 30개, 날짜 YYYY-MM-DD·미래 불가
  treatmentHistoryDescription?: string;
  additionalInquiry?: string;
};
/** PUT /:id는 투표 동의만 수정하며 다른 상담 필드는 유지한다. */
export type StyleVotingConsentInput = { isAllowedStyleVoting: boolean };
export type StyleVotingConsentResult = StyleVotingConsentInput & { id: number };
export type AnswerInput = {
  sessionToken: string;
  title: string; // 1~20자
  description: string; // 1~1,000자
  priceType: 'SINGLE' | 'RANGE';
  price?: number; // SINGLE 필수, minPrice/maxPrice 함께 전달 불가
  minPrice?: number;
  maxPrice?: number; // RANGE 필수, minPrice <= maxPrice, price 전달 불가
  faceShape?: FaceShape; // 심층 필수, 단일 선택
  bangsTypes?: string[];
  hairLengths?: string[]; // 심층 필수·각 최소 1개. 배열 순서가 추천 순위(첫 번째 = 1순위)
  hairCurls?: HairCurl[]; // 심층 필수·최소 1개. 순위 없는 다중선택
  hairLayers?: HairLayer[]; // 여성 심층 필수·최소 1개. 순위 없는 다중선택, 남성은 제외
  images?: (
    | string
    | { source?: 'UPLOAD'; imageUrl: string }
    | { source: 'PORTFOLIO'; sourcePortfolioId: number }
  )[];
};
// 가격은 모두 10,000~1,000,000 정수. 이미지는 최대 6장, PARTIAL/CONSULTING 답변 최소 1장.
// PORTFOLIO는 본인 포트폴리오만 선택할 수 있으며 sourcePortfolioId를 전달합니다.

export type ConsultationType = 'QUICK' | 'DEEP';
export type StorePlatform = 'ios' | 'android';
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };
// Preserve response fields that are not yet consumed by screens; never coerce unknown states into permissions.
export type ResponseRecord = Record<string, unknown>;
export type QuestionListQuery = {
  type?: ConsultationType;
  scope?: 'mine';
  state?: 'OPEN' | 'CLOSED' | 'NEW' | 'UNANSWERED' | 'COMPLETED';
  limit?: number;
  offset?: number;
};
export type Pagination = { limit?: number; offset?: number };
export type Metadata = {
  paymentGuide?: { isMeemongPassFree: boolean; meemongPassNotice?: string };
  policy: JsonObject;
  questionOptions: JsonObject;
  analysisOptions: JsonObject;
  canVisitProfile: boolean;
};
export type Badges = {
  quick: number;
  deep: number;
  total: number;
  /** 디자이너 전용: 5점 평가 후 상세를 확인하지 않은 채팅 가능 답변 수. */
  chatAvailableAnswerCount?: number;
};
export type DraftInput = { revision: number; currentStep?: string; payload: JsonObject };
export type Draft = ResponseRecord & {
  consultationType: ConsultationType;
  schemaVersion: number;
  revision: number;
  currentStep: string | null;
  payload: JsonObject;
};
export type Round = ResponseRecord & {
  id: number;
  roundNumber: number;
  targetAnswerCount: number;
  acceptedAnswerCount: number;
  openedAt: string;
  expiresAt: string;
  closedAt: string | null;
  closeReason: string | null;
};
export type NewAnswer = {
  v3HairConsultationAnswerId: number;
  designerUserDisplayName: string | null;
  designerUserProfilePictureURL: string | null;
};
export type QuestionSummary = ResponseRecord & {
  /** Present on the author's question list; excludes inaccessible answers across all rounds. */
  totalAnswerCount?: number;
  unreadAnswerCount?: number;
  newAnswer?: NewAnswer | null;
  customer?: ConsultationCustomer;
  aspirationDescription?: string | null;
  additionalInquiry?: string | null;
  aspirationImageTypes?: string[];
  thumbnailUrl?: string | null;
  isAllowedStyleVoting?: boolean;
  id: number;
  consultationType: ConsultationType;
  customerType: CustomerType;
  round: Round | null;
};
export type QuestionDetail = QuestionSummary & {
  images: ResponseRecord[];
  treatmentHistories: ResponseRecord[];
  myAnswer: AnswerSummary | null;
};
export type AnswerSession = { token: string; roundId: number; expiresAt: string };
export type AnswerRecord = ResponseRecord & {
  id: number;
  answerType: 'QUOTE' | 'PARTIAL' | 'CONSULTING';
  title: string;
  description: string;
  accessType: string;
};
export type AnswerSummary = ResponseRecord & {
  id: number;
  title: string;
  answerType: 'QUOTE' | 'PARTIAL' | 'CONSULTING';
  accessType: string;
};
export type AnswerReview = Pick<Review, 'rating' | 'content' | 'ratedAt'> & {
  reward: { isPaid: boolean; mongAmount: number };
};
export type AnswerFeedback = {
  /** 유료: 유효한 결제, 무료: 실제 열람. 호출자의 canRead와 별개. */
  isRead: boolean;
  firstReadAt: string | null;
  reviewed: boolean;
  review: AnswerReview | null;
};
/** 받은/보낸 답변 카드의 공통 본문. 구응답의 선택 필드 누락을 허용한다. */
export type AnswerCardContent = ResponseRecord & {
  title: string;
  description?: string | null;
  images?: ResponseRecord[] | null;
  priceType?: string | null;
  price?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  faceShape?: string | null;
  bangsTypes?: string[] | null;
  hairLengths?: string[] | null;
  hairLayers?: string[] | null;
  hairCurls?: string[] | null;
};
export type AnswerPreview = AnswerSummary &
  AnswerCardContent &
  AnswerFeedback & {
    /** GET /:id/answers 공개 미리보기. 결제 전에도 반환하며 가격은 원 단위. */
    hairLengthList?: string[];
    /** QUICK 목록의 공개 추천사진. 서버 정렬(displayOrder, id)을 유지한다. */
    imageList?: {
      id: number;
      imageUrl: string;
      source: 'PORTFOLIO' | 'UPLOAD';
      sourcePortfolioId: number | null;
      displayOrder: number;
    }[];
    designer?: ConsultationDesigner | null;
    canVisitProfile?: false;
    canRead: boolean;
    canChat: boolean;
    chatParticipants: { customerUserId: number; designerUserId: number } | null;
  };
/** GET /answers/mine supplies the author's card content without recording a read. */
export type SentAnswer = AnswerSummary &
  AnswerCardContent &
  AnswerFeedback & {
    thumbnailUrl: string | null;
    canChat: boolean;
    chatParticipants: { customerUserId: number; designerUserId: number } | null;
    consultation: QuestionSummary;
  };
export type ConsultationDesigner = {
  /** 답변 작성자의 사용자 ID. 구응답에서는 생략될 수 있다. */
  userId?: number;
  /** DesignerInfos ID이며 사용자 ID 기반 프로필 조회에 사용하지 않는다. */
  designerInfoId?: number | null;
  userDisplayName: string | null;
  userProfilePictureURL: string | null;
  region: string | null;
  distanceM: number | null;
};
export type ReadAnswer = AnswerRecord &
  AnswerFeedback & {
    images: ResponseRecord[];
    canVisitProfile: boolean;
    designer?: ConsultationDesigner | null;
  };
export type ReviewInput = { rating: 1 | 2 | 3 | 4 | 5; content?: string };
export type Review = ResponseRecord & {
  id: number;
  rating: number;
  content: string | null;
  ratedAt: string;
};
export type StorePreset = ResponseRecord & {
  id: number;
  title: string;
  answerCount: number;
  price: number;
  platform: StorePlatform;
  productId: string;
  isActive: boolean;
};
export type MongPurchaseInput = {
  consultationId: number;
  answerIds: number[];
  idempotencyKey: string;
};
export type StorePurchaseInput = MongPurchaseInput & { presetId: number };
export type VerifyPurchaseInput = { receiptData: string | JsonObject };
// STORE and MONG share a response; MONG has no platform, product, or KRW amount.
export type Purchase = ResponseRecord & {
  id: number;
  platform: StorePlatform | null;
  productId: string | null;
  paymentType: 'STORE' | 'MONG';
  answerCount: number;
  paymentAmountKRW: number | null;
  mongAmount: number | null;
  validationStatus: string;
  fulfillmentStatus: string;
  fulfillmentReason: string | null;
  verifiedAt: string | null;
  refundAt: string | null;
  refundReason: string | null;
  appAccountToken?: string;
  obfuscatedAccountId?: string;
};
export type AdPlacement = 'CHAT_OPEN' | 'CHAT_TAB';
export type AdField = 'faceShape' | 'bangsType' | 'hairLength' | 'hairCurl' | 'hairLayer';
export type AdRequest = { placement: AdPlacement; contextKey: string };
export type AdAssignment =
  | {
      provider: 'CONSULTATION';
      token: string;
      expiresAt: string;
      placement: AdPlacement;
      contextKey: string;
      question: ResponseRecord;
    }
  | { provider: 'ADMOB' }
  | { provider: 'NONE'; reason: string };
export type AdAnswerInput = { field: AdField; value: string };
export type AdAnswerResult = {
  field: AdField;
  selected: string;
  counts: Record<string, number>;
  total: number;
  completed: boolean;
  readyToComplete: boolean;
};
export type AdCompleteInput = Partial<Record<AdField, string>>;
export type AdStatistics =
  | { locked: true; collectedCount: number; requiredCount: number; requiresPurchase: boolean }
  | {
      locked: false;
      collectedCount: number;
      statistics: Partial<Record<AdField, Record<string, number>>>;
    };
export type AdCompletion = {
  completed: true;
  placement: AdPlacement;
  contextKey: string;
  statistics: AdStatistics;
};
export type AdAbandonment = { provider: 'ADMOB'; completed: false };
export type RatingStatistics = ResponseRecord & {
  ratingCount: number;
  averageRating: number | string | null;
};
