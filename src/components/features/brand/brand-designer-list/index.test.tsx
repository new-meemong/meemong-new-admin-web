import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  QueryClient,
  QueryClientProvider,
  keepPreviousData,
} from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BrandTable from "../brand-table";
import BrandDesignerList from "../brand-designer-list";
import CommonTable from "@/components/shared/common-table";
import CommonPagination from "@/components/shared/common-pagination";
import { useGetUsersQuery } from "@/queries/users";
import { Row } from "@tanstack/react-table";
import BrandDesignerCount from "../brand-designer-count";

vi.mock("@/components/shared/common-table", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/components/shared/common-table")>();
  return { ...actual, default: vi.fn(actual.default) };
});

vi.mock("@/components/shared/common-pagination", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@/components/shared/common-pagination")
    >();
  return { ...actual, default: vi.fn(actual.default) };
});

vi.mock("@/queries/users", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/queries/users")>();
  return { ...actual, useGetUsersQuery: vi.fn(actual.useGetUsersQuery) };
});

const fetchMock = vi.fn();
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://example.test");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  vi.mocked(CommonTable).mockClear();
  vi.mocked(CommonPagination).mockClear();
  vi.mocked(useGetUsersQuery).mockClear();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const brand = {
  id: 7,
  code: "test",
  name: "테스트 브랜드",
  isRecommended: false,
  createdAt: "2026-09-22",
};

async function renderWithResponse(
  element: React.ReactNode,
  totalCount: number,
  verifyLoaded?: (client: QueryClient) => Promise<void>,
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  fetchMock.mockImplementation(
    () =>
      new Response(
        JSON.stringify({
          data: {
            dataList: totalCount
              ? [
                  {
                    id: 42,
                    displayName: "브랜드 디자이너 예시",
                    isBlocked: true,
                  },
                ]
              : [],
            dataCount: totalCount,
          },
        }),
        { headers: { "content-type": "application/json" } },
      ),
  );
  const render = () =>
    renderToStaticMarkup(
      <QueryClientProvider client={client}>{element}</QueryClientProvider>,
    );
  try {
    const pending = render();
    const queries = client.getQueryCache().getAll();
    expect(queries).toHaveLength(1);
    // Execute the real query registered by the rendered UI, including transport and normalization.
    await client.fetchQuery({
      ...queries[0].options,
      queryKey: queries[0].queryKey,
    });
    const html = render();
    await verifyLoaded?.(client);
    return {
      pending,
      html,
      url: new URL(fetchMock.mock.calls[0][0]),
    };
  } finally {
    client.clear();
  }
}

describe("brand designer UI request boundary", () => {
  it("reuses fresh counts but refetches after explicit user invalidation", async () => {
    await renderWithResponse(
      <BrandDesignerCount brandId={7} />,
      123,
      async (client) => {
        const query = client.getQueryCache().getAll()[0];
        const options = { ...query.options, queryKey: query.queryKey };
        await client.fetchQuery(options);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        await client.invalidateQueries({
          queryKey: ["GET_USERS"],
          refetchType: "none",
        });
        await client.fetchQuery(options);
        expect(fetchMock).toHaveBeenCalledTimes(2);
      },
    );
  });

  it("registers previous-page placeholders and blocks stale row and page selection", async () => {
    const onSelectDesigner = vi.fn();
    await renderWithResponse(
      <BrandDesignerList brandId={7} onSelectDesigner={onSelectDesigner} />,
      23,
      async (client) => {
        const query = client.getQueryCache().getAll()[0];
        expect(query.options).toMatchObject({
          placeholderData: keepPreviousData,
        });

        const loadedResult = vi
          .mocked(useGetUsersQuery)
          .mock.results.at(-1)!.value;
        vi.mocked(useGetUsersQuery).mockReturnValueOnce({
          ...loadedResult,
          isPlaceholderData: true,
          isFetching: true,
        });
        const html = renderToStaticMarkup(
          <QueryClientProvider client={client}>
            <BrandDesignerList
              brandId={7}
              onSelectDesigner={onSelectDesigner}
            />
          </QueryClientProvider>,
        );
        expect(html).toContain("브랜드 디자이너 예시");
        expect(html).toContain('aria-busy="true"');
        expect(
          vi.mocked(CommonTable).mock.calls.at(-1)![0].onClickRow,
        ).toBeUndefined();
        const pagination = vi.mocked(CommonPagination).mock.calls.at(-1)![0];
        expect(pagination.canChangePage?.(2)).toBe(false);
        expect(onSelectDesigner).not.toHaveBeenCalled();
      },
    );
  });

  it("passes the clicked designer's user ID to the detail opener", async () => {
    const onSelectDesigner = vi.fn();
    await renderWithResponse(
      <BrandDesignerList brandId={7} onSelectDesigner={onSelectDesigner} />,
      1,
    );
    const tableProps = vi.mocked(CommonTable).mock.calls.at(-1)![0];
    expect(tableProps.onClickRow).toBeTypeOf("function");
    tableProps.onClickRow!({ original: tableProps.data[0] } as Row<unknown>);
    expect(onSelectDesigner).toHaveBeenCalledExactlyOnceWith(42);
  });

  it("shows the filtered total rather than the fetched row count in the brand table", async () => {
    const { html, pending, url } = await renderWithResponse(
      <BrandTable
        data={[brand]}
        totalCount={1}
        currentPage={1}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        onRefresh={() => {}}
      />,
      123,
    );
    expect(pending).toContain("조회 중...");
    expect(html).toContain("가입 디자이너 수");
    expect(html).toContain("123명");
    expect(url.pathname).toBe("/api/v1/admins/users");
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      role: "2",
      brandId: "7",
      page: "1",
      size: "1",
    });
  });

  it("loads brand-filtered designers with pagination and status", async () => {
    const { html, url } = await renderWithResponse(
      <BrandDesignerList brandId={7} />,
      23,
    );
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      role: "2",
      brandId: "7",
      page: "1",
      size: "10",
    });
    expect(html).toContain("23명");
    expect(html).toContain("브랜드 디자이너 예시");
    expect(html).toContain("차단");
    expect(html).toContain('aria-label="3페이지"');
  });

  it("shows an explicit empty state for a brand without designers", async () => {
    const { html } = await renderWithResponse(
      <BrandDesignerList brandId={8} />,
      0,
    );
    expect(html).toContain("0명");
    expect(html).toContain("등록된 디자이너가 없습니다.");
  });
});
