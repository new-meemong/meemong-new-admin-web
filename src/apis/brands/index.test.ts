import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { brandAPI } from "@/apis/brands";

const fetchMock = vi.fn();
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://example.test");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  fetchMock.mockImplementation(
    async () =>
      new Response(JSON.stringify({ data: {} }), {
        headers: { "content-type": "application/json" },
      }),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("brand recommendation API", () => {
  it.each([true, false])(
    "sends boolean %s for creation and recommendation-only updates",
    async (isRecommended) => {
      await brandAPI.create({ name: "테스트", isRecommended });
      await brandAPI.update({ id: 7, isRecommended });
      const [createUrl, createOptions] = fetchMock.mock.calls[0];
      const [updateUrl, updateOptions] = fetchMock.mock.calls[1];
      expect(new URL(createUrl).pathname).toBe("/api/v1/admins/brands");
      expect(createOptions.method).toBe("POST");
      expect(JSON.parse(createOptions.body)).toEqual({
        name: "테스트",
        isRecommended,
      });
      expect(new URL(updateUrl).pathname).toBe("/api/v1/admins/brands/7");
      expect(updateOptions.method).toBe("PATCH");
      expect(JSON.parse(updateOptions.body)).toEqual({ isRecommended });
    },
  );

  it("omits recommendation when not specified so server defaults and existing values apply", async () => {
    await brandAPI.create({ name: "테스트" });
    await brandAPI.update({ id: 7, name: "변경" });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      name: "테스트",
    });
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      name: "변경",
    });
  });

  it("preserves recommendation values in the normalized list", async () => {
    fetchMock.mockImplementationOnce(
      async () =>
        new Response(
          JSON.stringify({
            data: {
              dataList: [
                { id: 7, isRecommended: true },
                { id: 8, isRecommended: false },
              ],
              totalCount: 2,
              page: 1,
              size: 10,
            },
          }),
          { headers: { "content-type": "application/json" } },
        ),
    );
    const result = await brandAPI.getAll();
    expect(result.content.map((brand) => brand.isRecommended)).toEqual([
      true,
      false,
    ]);
  });
});
