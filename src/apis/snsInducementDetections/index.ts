import { fetcher } from "@/apis/core";

export type DetectionConditions = { fieldList: string[]; phraseList: string[] };
export type DetectionRules = DetectionConditions & {
  id: number;
  availableFieldList: string[];
  categoryList: { key: string; label: string; fieldList: string[] }[];
  scanLimit: number;
  maxScanLimit: number;
  updatedAt: string | null;
};
export type DetectionCursor = {
  sourceIndex: number;
  afterId: number;
  configHash: string;
};
export type DetectionEvidence = {
  field: string;
  tableName: string;
  recordId: number;
  text: string;
  matchedPhraseList: string[];
  detailApiPath: string;
  designerInfoId?: number;
  v3HairConsultationId?: number;
};
export type DetectionCandidate = {
  userId: number;
  userDisplayName: string;
  userRole: number;
  evidenceList: DetectionEvidence[];
};
export type DetectionRequest = Partial<DetectionConditions> & {
  scanLimit?: number;
  cursor?: DetectionCursor | null;
};
export type DetectionResponse = {
  dataList: DetectionCandidate[];
  dataCount: number;
  scannedRecordCount: number;
  nextCursor: DetectionCursor | null;
  isPartial: boolean;
  appliedRules: DetectionConditions;
};
const base = "/api/v1/admins/sns-inducement-detections";
export const snsInducementDetectionAPI = {
  getRules: async (signal?: AbortSignal) =>
    (await fetcher<{ data: DetectionRules }>(`${base}/rules`, { signal })).data,
  updateRules: async (input: Partial<DetectionConditions>) =>
    (
      await fetcher<{ data: DetectionRules }>(`${base}/rules`, {
        method: "PUT",
        json: input,
      })
    ).data,
  preview: (input: DetectionRequest, signal?: AbortSignal) =>
    fetcher<DetectionResponse>(`${base}/preview`, {
      method: "POST",
      json: input,
      signal,
    }),
};
