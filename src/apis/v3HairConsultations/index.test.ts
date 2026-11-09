// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildV3ConsultationUpdate,
  v3HairConsultationAPI as api,
} from "./index";
import type { V3ConsultationEditable } from "@/models/v3HairConsultations";
const original: V3ConsultationEditable = {
  aspirationDescription: "원본",
  additionalInquiry: null,
  treatmentHistoryDescription: null,
  extensionPiecesDescription: null,
  desiredDateDescription: null,
  isAllowedStyleVoting: false,
};
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.test");
  document.cookie = "accessToken=test-admin";
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(
      async () =>
        new Response(JSON.stringify({ data: {} }), {
          headers: { "content-type": "application/json" },
        }),
    ),
  );
});
afterEach(() => {
  document.cookie = "accessToken=; max-age=0";
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("v3 consultation HTTP contract", () => {
  it("uses admin auth and normalizes full phone without sending a second phone filter", async () => {
    await api.list({
      searchType: "PHONE",
      searchKeyword: " 010-1234-5678 ",
      visibility: "WITHDRAWN",
      __nextCursor: "41",
      __limit: 20,
    });
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(new URL(String(url)).pathname).toBe(
      "/api/v1/admins/v3-hair-consultations",
    );
    expect(Object.fromEntries(new URL(String(url)).searchParams)).toEqual({
      searchType: "PHONE",
      searchKeyword: "01012345678",
      visibility: "WITHDRAWN",
      __limit: "20",
      __nextCursor: "41",
    });
    expect(new Headers(init?.headers).get("Authorization")).toBe("test-admin");
  });
  it("omits auth, pagination and QUICK for dashboard statistics", async () => {
    await api.statistics({
      consultationType: "QUICK",
      userId: 9,
      visibility: "ALL",
      ...{ __limit: 50, __nextCursor: "40" },
    });
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(new URL(String(url)).pathname).toBe(
      "/api/v1/un-auth/dashboards/v3-hair-consultations/statistics",
    );
    expect(Object.fromEntries(new URL(String(url)).searchParams)).toEqual({
      consultationType: "DEEP",
      userId: "9",
      visibility: "ALL",
    });
    expect(new Headers(init?.headers).has("Authorization")).toBe(false);
    expect(init).not.toHaveProperty("auth");
  });
  it("sends only changed editable fields, including null and false", async () => {
    const body = buildV3ConsultationUpdate(
      { ...original, isAllowedStyleVoting: true },
      {
        ...original,
        aspirationDescription: "",
        isAllowedStyleVoting: false,
        ...{ id: 99 },
      },
      "DEEP",
    );
    expect(body).toEqual({
      aspirationDescription: null,
      isAllowedStyleVoting: false,
    });
    await api.update(123, body);
    expect(vi.mocked(fetch).mock.calls[0][1]?.body).toBe(JSON.stringify(body));
    expect(
      buildV3ConsultationUpdate(original, { ...original }, "QUICK"),
    ).toEqual({});
    expect(() => api.update(123, {})).toThrow();
  });
  it("rejects oversize text and QUICK voting", () => {
    expect(() =>
      buildV3ConsultationUpdate(
        original,
        { ...original, desiredDateDescription: "가".repeat(31) },
        "DEEP",
      ),
    ).toThrow("30자");
    expect(() =>
      buildV3ConsultationUpdate(
        original,
        { ...original, additionalInquiry: "가".repeat(201) },
        "DEEP",
      ),
    ).toThrow("200자");
    expect(() =>
      buildV3ConsultationUpdate(
        original,
        { ...original, isAllowedStyleVoting: true },
        "QUICK",
      ),
    ).toThrow("심층");
  });
  it("scopes answer requests and deletion to their consultation", async () => {
    await api.answers(123, { __nextCursor: "500", __limit: 10 });
    await api.answer(123, 456);
    await api.hideAnswer(123, 456);
    await api.hide(123);
    expect(
      vi.mocked(fetch).mock.calls.map(([url]) => new URL(String(url)).pathname),
    ).toEqual([
      "/api/v1/admins/v3-hair-consultations/123/answers",
      "/api/v1/admins/v3-hair-consultations/123/answers/456",
      "/api/v1/admins/v3-hair-consultations/123/answers/456",
      "/api/v1/admins/v3-hair-consultations/123",
    ]);
    expect(
      new URL(String(vi.mocked(fetch).mock.calls[0][0])).searchParams.get(
        "__nextCursor",
      ),
    ).toBe("500");
    expect(vi.mocked(fetch).mock.calls[2][1]?.method).toBe("DELETE");
    expect(vi.mocked(fetch).mock.calls[3][1]?.method).toBe("DELETE");
  });
});
