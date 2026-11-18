import { ApiError } from "@/apis/core";
import type {
  DetectionCandidate,
  DetectionConditions,
  DetectionEvidence,
  DetectionRules,
} from "@/apis/snsInducementDetections";
import type { ContentDetailTarget } from "@/models/content-detail";

export const FIELD_LABELS: Record<string, string> = {
  "BeautyApplications.title": "모집공고 제목",
  "BeautyApplications.description": "모집공고 본문",
  "ThunderAnnouncements.title": "빠른매칭 제목",
  "ThunderAnnouncements.description": "빠른매칭 본문",
  "DesignerProfiles.description": "디자이너 소개",
  "DesignerInfos.storeReservationNotice": "매장 예약 안내",
  "DesignerInfos.timeSaleNaverReservationNotice": "리뷰특가 공통 예약 안내",
  "V3HairConsultations.desiredDateDescription": "희망 일정",
  "V3HairConsultations.aspirationDescription": "희망 스타일",
  "V3HairConsultations.extensionPiecesDescription": "붙임머리 설명",
  "V3HairConsultations.treatmentHistoryDescription": "시술 이력",
  "V3HairConsultations.additionalInquiry": "추가 문의",
  "V3HairConsultationAnswers.title": "상담 답변 제목",
  "V3HairConsultationAnswers.description": "상담 답변 본문",
  "TimeSaleMenus.name": "리뷰특가 이름",
  "TimeSaleMenus.description": "리뷰특가 설명",
  "TimeSaleMenus.reservationName": "리뷰특가 예약명",
  "TimeSaleMenus.naverReservationNotice": "리뷰특가 개별 예약 안내",
};
export const normalizePhrase = (text: string) =>
  text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\p{P}\p{Cf}]/gu, "");
export function validateConditions(
  value: DetectionConditions,
  allowed: string[],
) {
  if (
    !value.fieldList.length ||
    new Set(value.fieldList).size !== value.fieldList.length ||
    value.fieldList.some((field) => !allowed.includes(field))
  )
    return "허용된 조사 필드를 중복 없이 하나 이상 선택해주세요.";
  if (
    !value.phraseList.length ||
    value.phraseList.length > 100 ||
    value.phraseList.some(
      (phrase) => phrase.length > 100 || !normalizePhrase(phrase),
    )
  )
    return "키워드는 1~100개, 문구당 100자 이내로 입력해주세요. 공백·문장부호만 있는 문구는 사용할 수 없습니다.";
  return null;
}
export function changedConditions(
  base: DetectionConditions,
  draft: DetectionConditions,
): Partial<DetectionConditions> {
  const result: Partial<DetectionConditions> = {};
  for (const key of ["fieldList", "phraseList"] as const)
    if (JSON.stringify(base[key]) !== JSON.stringify(draft[key]))
      result[key] = [...draft[key]];
  return result;
}
export const evidenceKey = (item: DetectionEvidence) =>
  JSON.stringify([item.tableName, item.recordId, item.field]);
export function mergeCandidates(
  previous: DetectionCandidate[],
  incoming: DetectionCandidate[],
) {
  const users = new Map(previous.map((user) => [user.userId, user]));
  for (const user of incoming) {
    const existing = users.get(user.userId);
    const evidence = new Map(
      existing?.evidenceList.map((item) => [evidenceKey(item), item]),
    );
    for (const item of user.evidenceList) evidence.set(evidenceKey(item), item);
    users.set(user.userId, { ...user, evidenceList: [...evidence.values()] });
  }
  return [...users.values()];
}
export function categoryForField(
  rules: Pick<DetectionRules, "categoryList">,
  field: string,
) {
  return rules.categoryList.find((category) =>
    category.fieldList.includes(field),
  );
}
export function detectionFailure(error: unknown, continuation: boolean) {
  const detail =
    error instanceof Error ? error.message : "요청에 실패했습니다.";
  if (error instanceof ApiError) {
    if (error.status === 400)
      return {
        retryable: false,
        message: `${continuation ? "이어서 조사할 수 없습니다. 새 조사를 시작해주세요." : "조사 조건을 확인해주세요."} ${detail}`,
      };
    if ([401, 403].includes(error.status))
      return {
        retryable: false,
        message: "조회 권한이 없습니다. 관리자 로그인 상태를 확인해주세요.",
      };
    if (error.status < 500 && error.status !== 408)
      return { retryable: false, message: detail };
  }
  return {
    retryable: true,
    message: `조사를 일시 중단했습니다. 같은 조건으로 다시 시도할 수 있습니다. ${detail}`,
  };
}
export function evidenceTarget(
  evidence: DetectionEvidence,
  userId: number,
): ContentDetailTarget | null {
  switch (evidence.tableName) {
    case "BeautyApplications":
      return { kind: "model-treatment", id: evidence.recordId };
    case "ThunderAnnouncements":
      return { kind: "thunder-announcement", id: evidence.recordId, userId };
    case "TimeSaleMenus":
      return { kind: "time-sale", id: evidence.recordId };
    case "V3HairConsultations":
      return {
        kind: "consultation",
        id: evidence.v3HairConsultationId ?? evidence.recordId,
      };
    case "V3HairConsultationAnswers":
      return evidence.v3HairConsultationId == null
        ? null
        : {
            kind: "consultation",
            id: evidence.v3HairConsultationId,
            answerId: evidence.recordId,
          };
    default:
      return null;
  }
}

// Grapheme spans preserve combining sequences. Only highlight if the mapped text
// equals whole-string normalization (context-sensitive lowercasing can differ).
export function highlightRanges(
  text: string,
  phrases: string[],
): [number, number][] {
  const segments = new Intl.Segmenter("ko", {
    granularity: "grapheme",
  }).segment(text);
  const positions: [number, number][] = [];
  let normalized = "";
  for (const part of segments) {
    const value = normalizePhrase(part.segment);
    normalized += value;
    for (let i = 0; i < value.length; i++)
      positions.push([part.index, part.index + part.segment.length]);
  }
  if (normalized !== normalizePhrase(text)) return [];
  const ranges: [number, number][] = [];
  for (const phrase of phrases) {
    const needle = normalizePhrase(phrase);
    if (!needle) continue;
    let index = normalized.indexOf(needle);
    while (index >= 0) {
      ranges.push([
        positions[index][0],
        positions[index + needle.length - 1][1],
      ]);
      index = normalized.indexOf(needle, index + 1);
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const range of ranges) {
    const last = merged.at(-1);
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([...range]);
  }
  return merged;
}
