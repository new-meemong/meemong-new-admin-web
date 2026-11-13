import { afterEach, expect, it, vi } from "vitest";
import { userAPI } from "./index";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("예약안내 검색에 브랜드·역할·차단 필터를 함께 전달한다", async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://example.test");
  const fetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify({ data: { content: [], totalCount: 0 } }), {
        headers: { "content-type": "application/json" },
      }),
  );
  vi.stubGlobal("fetch", fetchMock);
  await userAPI.getAll({
    searchType: "STORE_RESERVATION_NOTICE",
    searchKeyword: "예약 %_\\ &안내",
    brandId: 7,
    role: 2,
    blockType: 1,
    page: 1,
    size: 10,
  });
  const url = new URL((fetchMock.mock.calls[0] as unknown as [string])[0]);
  expect(url.pathname).toBe("/api/v1/admins/users");
  expect(Object.fromEntries(url.searchParams)).toEqual({
    searchType: "STORE_RESERVATION_NOTICE",
    searchKeyword: "예약 %_\\ &안내",
    brandId: "7",
    role: "2",
    blockType: "1",
    page: "1",
    size: "10",
  });
});

it("회원 상세는 관리자 인증으로 역할별 객체를 변형 없이 전달한다", async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://example.test");
  vi.stubGlobal("document", { cookie: "accessToken=admin-token" });
  const detail = {
    id: 7,
    role: 3,
    modelInfo: {
      id: null,
      userId: 7,
      modelImageList: [
        { id: 9, imageURL: "https://example.test/9.jpg" },
        { id: 2, imageURL: "https://example.test/2.jpg" },
      ],
      modelInfoWantedStyle: { description: "작성한 고객정보" },
      quickMatchingList: [
        { id: 91, detailUrl: "/api/v1/admins/v3-hair-consultations/91" },
      ],
    },
    designerInfo: null,
  };
  const fetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify({ data: detail }), {
        headers: { "content-type": "application/json" },
      }),
  );
  vi.stubGlobal("fetch", fetchMock);
  expect(await userAPI.getById(7)).toEqual(detail);
  const [url, init] = fetchMock.mock.calls[0] as unknown as [
    string,
    RequestInit,
  ];
  expect(new URL(url).pathname).toBe("/api/v1/admins/users/7");
  expect(new Headers(init.headers).get("Authorization")).toBe("admin-token");
});

it("통합 수정은 null 제거값·닉네임만 보내고 관리자 인증을 유지한다", async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://example.test");
  vi.stubGlobal("document", { cookie: "accessToken=admin-token" });
  const fetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify({ data: null }), {
        headers: { "content-type": "application/json" },
      }),
  );
  vi.stubGlobal("fetch", fetchMock);
  const changes = {
    displayName: "새 닉네임",
    designerInfo: { description: null, storeReservationNotice: null },
  };
  expect(await userAPI.update({ userId: 7, ...changes })).toEqual({
    data: null,
  });
  const [url, init] = fetchMock.mock.calls[0] as unknown as [
    string,
    RequestInit,
  ];
  expect(new URL(url).pathname).toBe("/api/v1/admins/users/7");
  expect(init.method).toBe("PUT");
  expect(JSON.parse(init.body as string)).toEqual(changes);
  expect(new Headers(init.headers).get("Authorization")).toBe("admin-token");
  expect(new Headers(init.headers).get("Content-Type")).toBe(
    "application/json",
  );
});
