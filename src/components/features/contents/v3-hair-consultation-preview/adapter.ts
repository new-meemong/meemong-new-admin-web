import type {
  V3ConsultationDetail,
  V3ConsultationAnswerDetail,
} from "@/models/v3HairConsultations";
import type {
  QuestionDetail,
  AnswerPreview,
  ReadAnswer,
  CustomerType,
} from "./source/entities/consultation/api/contracts";

/** Admin List-suffixed fields are mapped to the existing web reader's snapshot contract. */
export function toQuestionPreview(
  detail: V3ConsultationDetail,
): QuestionDetail {
  return {
    ...detail,
    customerType: detail.customerType as CustomerType,
    round: detail.roundList?.[0] ?? null,
    myAnswer: null,
    images: (detail.imageList ?? []).map((image) => ({ ...image })),
    treatmentHistories: (detail.treatmentHistoryList ?? []).map((history) => ({
      ...history,
    })),
    wantedTreatments: detail.wantedTreatmentList ?? [],
    additionalTreatments: detail.additionalTreatmentList ?? [],
    unwantedTreatments: detail.unwantedTreatmentList ?? [],
    aspirationImageTypes: detail.aspirationImageTypeList ?? [],
    hairConcerns: detail.hairConcernList ?? [],
    concernedAreas: detail.concernedAreaList ?? [],
    stylingMethods: detail.stylingMethodList ?? [],
    preferredRegions: detail.preferredRegionList ?? [],
  };
}
export function toAnswerPreview(
  detail: V3ConsultationAnswerDetail,
): AnswerPreview & ReadAnswer {
  const review = detail.deepStatus?.review;
  return {
    ...detail,
    answerType: detail.answerType as ReadAnswer["answerType"],
    images: (detail.imageList ?? []).map((image) => ({ ...image })),
    imageList: (detail.imageList ?? []).map((image) => ({
      ...image,
      source: image.source === "PORTFOLIO" ? "PORTFOLIO" : "UPLOAD",
      sourcePortfolioId: null,
    })),
    bangsTypes: detail.bangsTypeList ?? [],
    hairLengths: detail.hairLengthList ?? [],
    hairLayers: detail.hairLayerList ?? [],
    hairCurls: detail.hairCurlList ?? [],
    // Admin reads do not record customer read events or confer customer purchase/chat permissions.
    firstReadAt: null,
    isRead: false,
    canRead: true,
    canChat: false,
    canVisitProfile: false,
    chatParticipants: null,
    reviewed: !!review,
    review: review
      ? { ...review, reward: { isPaid: false, mongAmount: 0 } }
      : null,
    designer: {
      userId: detail.designerUserId,
      userDisplayName:
        detail.designerUser?.displayName ??
        `디자이너 #${detail.designerUserId}`,
      userProfilePictureURL: null,
      region: null,
      distanceM: null,
    },
  };
}
