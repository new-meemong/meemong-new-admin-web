import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import {
  businessMongAPI,
  BusinessMongDistributionRequest,
  BusinessMongGrantRequest,
} from "./index";
import {
  businessMongQueries,
  findBusinessMongGrant,
  refreshBusinessMongAfterDistribution,
} from "@/queries/businessMong";
import { MONG_MONEY_GROUPS_QUERY_KEY } from "@/queries/mongMoneys";

const request: BusinessMongGrantRequest = {
  requestKey: "grant-test-1",
  businessName: "테스트 사업자",
  businessRegistrationNumber: "1234567890",
  mongAmount: 4500,
  adminDescription: "입금 확인",
};
const distribution: BusinessMongDistributionRequest = {
  requestKey: "distribution-test-1",
  title: "원장님의 선물",
  adminDescription: "분배 확인",
  owner: { displayName: "테스트 원장", phone: "01000000001" },
  recipientList: [
    { displayName: "테스트 직원", phone: "01000000002", amount: 1000 },
  ],
};
const fetchMock = vi.fn<typeof fetch>();
const json = (value: unknown) =>
  new Response(JSON.stringify(value), {
    headers: { "Content-Type": "application/json" },
  });
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.test");
  vi.stubGlobal("document", { cookie: "accessToken=JWT%20test" });
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("business mong production transport and query boundary", () => {
  it("sends a grant to the dedicated authenticated JSON endpoint", async () => {
    fetchMock.mockResolvedValue(json({ data: { ...request, id: 5 } }));
    await businessMongAPI.createGrant(request);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://api.example.test/api/v1/admins/business-mong-grants",
    );
    expect(options?.method).toBe("POST");
    expect(new Headers(options?.headers).get("Authorization")).toBe(
      "JWT%20test",
    );
    expect(new Headers(options?.headers).get("Content-Type")).toBe(
      "application/json",
    );
    expect(JSON.parse(options?.body as string)).toEqual(request);
  });
  it("retries distribution with exactly the same key, order and owner after response loss", async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError("network unavailable"))
      .mockResolvedValueOnce(json({ data: { id: 8 } }));
    await expect(businessMongAPI.distribute(5, distribution)).rejects.toThrow(
      "network unavailable",
    );
    await businessMongAPI.distribute(5, distribution);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.example.test/api/v1/admins/business-mong-grants/5/distributions",
    );
    expect(fetchMock.mock.calls[0][1]?.body).toBe(
      fetchMock.mock.calls[1][1]?.body,
    );
    expect(JSON.parse(fetchMock.mock.calls[1][1]?.body as string)).toEqual(
      distribution,
    );
  });
  it("looks through every business page to reconcile a lost grant response without writing", async () => {
    fetchMock
      .mockResolvedValueOnce(
        json({ dataList: [{ requestKey: "other" }], __nextCursor: "30" }),
      )
      .mockResolvedValueOnce(
        json({ dataList: [{ ...request, id: 5 }], __nextCursor: null }),
      );
    expect(await findBusinessMongGrant(request)).toMatchObject({
      id: 5,
      requestKey: request.requestKey,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const url = new URL(fetchMock.mock.calls[1][0] as string);
    expect(url.searchParams.get("businessRegistrationNumber")).toBe(
      "1234567890",
    );
    expect(url.searchParams.get("__nextCursor")).toBe("30");
    expect(url.searchParams.get("__limit")).toBe("20");
    expect(fetchMock.mock.calls.every(([, options]) => !options?.method)).toBe(
      true,
    );
  });
  it("keeps each business and grant history isolated and forwards pagination", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    fetchMock
      .mockResolvedValueOnce(
        json({ dataList: [], dataCount: 0, __nextCursor: "20" }),
      )
      .mockResolvedValueOnce(
        json({ dataList: [], dataCount: 0, __nextCursor: null }),
      );
    try {
      const options = businessMongQueries.grants("1234567890");
      await client.fetchInfiniteQuery({ ...options, pages: 2 });
      expect(
        new URL(fetchMock.mock.calls[1][0] as string).searchParams.get(
          "__nextCursor",
        ),
      ).toBe("20");
      expect(options.queryKey).not.toEqual(
        businessMongQueries.grants("9876543210").queryKey,
      );
      expect(businessMongQueries.distributions(1).queryKey).not.toEqual(
        businessMongQueries.distributions(2).queryKey,
      );
    } finally {
      client.clear();
    }
  });
  it("invalidates grant balances, distributions and member mong data after distribution", async () => {
    const client = new QueryClient();
    const keys = [
      businessMongQueries.grants().queryKey,
      businessMongQueries.grant(5).queryKey,
      businessMongQueries.distributions(5).queryKey,
      [MONG_MONEY_GROUPS_QUERY_KEY, 10],
      ["GET_USER_DETAIL", 10],
    ];
    keys.forEach((key) => client.setQueryData(key, {}));
    await refreshBusinessMongAfterDistribution(client);
    keys.forEach((key) =>
      expect(client.getQueryState(key)?.isInvalidated).toBe(true),
    );
    client.clear();
  });
});

it("creates and partially updates presets through authenticated JSON transport", async () => {
  const values = {
    title: "상품",
    mongBaseAmount: 100,
    mongBonusAmount: 0,
    supplyAmountKRW: 1000,
    isHidden: false,
    sortOrder: 0,
  };
  fetchMock.mockImplementation(async () =>
    json({ data: { id: 1, ...values } }),
  );
  await businessMongAPI.createPreset(values);
  await businessMongAPI.updatePreset(1, { isHidden: true, sortOrder: 5 });
  const [createUrl, createOptions] = fetchMock.mock.calls[0];
  expect(createUrl).toBe(
    "https://api.example.test/api/v1/admins/business-mong-presets",
  );
  expect(createOptions?.method).toBe("POST");
  expect(JSON.parse(createOptions?.body as string)).toEqual(values);
  const [updateUrl, updateOptions] = fetchMock.mock.calls[1];
  expect(updateUrl).toBe(
    "https://api.example.test/api/v1/admins/business-mong-presets/1",
  );
  expect(updateOptions?.method).toBe("PUT");
  expect(new Headers(updateOptions?.headers).get("Authorization")).toBe(
    "JWT%20test",
  );
  expect(JSON.parse(updateOptions?.body as string)).toEqual({
    isHidden: true,
    sortOrder: 5,
  });
});
