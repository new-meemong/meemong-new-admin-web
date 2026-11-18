import { describe, expect, it } from "vitest";
import { ApiError } from "@/apis/core";
import {
  categoryForField,
  changedConditions,
  detectionFailure,
  evidenceTarget,
  highlightRanges,
  mergeCandidates,
  normalizePhrase,
  validateConditions,
} from "./sns-inducement-detections";
import type { DetectionEvidence } from "@/apis/snsInducementDetections";
const evidence = (field = "BeautyApplications.title"): DetectionEvidence => ({
  field,
  tableName: "BeautyApplications",
  recordId: 1,
  text: "인스타",
  matchedPhraseList: ["인스타"],
  detailApiPath: "/api/v1/admins/beauty-applications/1",
});
it("sends only changed arrays and rejects empty normalized phrases", () => {
  const base = { fieldList: ["a"], phraseList: ["인스타"] };
  expect(changedConditions(base, { ...base, fieldList: ["b"] })).toEqual({
    fieldList: ["b"],
  });
  expect(changedConditions(base, { ...base })).toEqual({});
  expect(
    validateConditions({ ...base, phraseList: ["  !\u200b"] }, ["a"]),
  ).not.toBeNull();
  expect(
    validateConditions({ ...base, fieldList: ["a", "a"] }, ["a"]),
  ).not.toBeNull();
});
it("keeps separate fields on the same record and merges repeated accounts", () => {
  const user = {
    userId: 2,
    userDisplayName: "디자이너",
    userRole: 2,
    evidenceList: [evidence()],
  };
  const merged = mergeCandidates(
    [user],
    [
      {
        ...user,
        evidenceList: [evidence(), evidence("BeautyApplications.description")],
      },
    ],
  );
  expect(merged).toHaveLength(1);
  expect(merged[0].evidenceList).toHaveLength(2);
});
it("classifies DesignerInfos by field while linking both to the member", () => {
  const rules = {
    categoryList: [
      {
        key: "profile",
        label: "프로필",
        fieldList: ["DesignerInfos.storeReservationNotice"],
      },
      {
        key: "sale",
        label: "리뷰특가",
        fieldList: ["DesignerInfos.timeSaleNaverReservationNotice"],
      },
    ],
  };
  expect(
    categoryForField(rules, "DesignerInfos.timeSaleNaverReservationNotice")
      ?.key,
  ).toBe("sale");
  expect(
    evidenceTarget(
      {
        ...evidence(),
        tableName: "V3HairConsultationAnswers",
        recordId: 20,
        v3HairConsultationId: 7,
      },
      2,
    ),
  ).toEqual({ kind: "consultation", id: 7, answerId: 20 });
});
it("uses request context rather than a shared error code", () => {
  const error = new ApiError(
    "잘못된 요청",
    400,
    "INVALID_SNS_DETECTION_REQUEST",
  );
  expect(detectionFailure(error, false)).toMatchObject({
    retryable: false,
    message: expect.stringContaining("조건"),
  });
  expect(detectionFailure(error, true)).toMatchObject({
    retryable: false,
    message: expect.stringContaining("새 조사"),
  });
  expect(detectionFailure(new ApiError("권한", 403), true).retryable).toBe(
    false,
  );
  expect(detectionFailure(new ApiError("오류", 503), true).retryable).toBe(
    true,
  );
});
describe("server-equivalent normalization and original spans", () => {
  it("retains symbols but ignores punctuation, whitespace and format characters", () => {
    expect(normalizePhrase("ＤＭ, \u200b주 세 요+😀~")).toBe("dm주세요+😀~");
    expect(highlightRanges("앞 ＤＭ, \u200b주 세 요 뒤", ["dm주세요"])).toEqual(
      [[2, 12]],
    );
    expect(highlightRanges("DM+주세요", ["dm주세요"])).toEqual([]);
  });
  it("maps expansions and combined Hangul without offset guessing", () => {
    expect(highlightRanges("앞 ㈜ 뒤", ["주"])).toEqual([[2, 3]]);
    expect(highlightRanges("앞 가 뒤", ["가"])).toEqual([[2, 4]]);
    expect(highlightRanges("인스타 인스타", ["인스타", "스타"])).toEqual([
      [0, 3],
      [4, 7],
    ]);
  });
});
